import { isVisible } from "./layoutDebugUtils";

const TEXT_SCOPE = ".process, .modal";
const OVERLAY_ID = "focus-debug-overlay-root";

const isExcludedTextOwner = (el) => {
    if (!el) return true;
    if (el.closest(`#${OVERLAY_ID}`)) return true;
    if (el.closest('[aria-hidden="true"], [inert], [hidden]')) return true;
    if (el.closest(".measure")) return true;
    return false;
};

const isClipHidden = (style) => {
    const clip = style.clip;
    if (clip && clip !== "auto" && /rect\([^)]*0(?:px)?[^)]*0(?:px)?[^)]*0(?:px)?[^)]*0(?:px)?/i.test(clip)) {
        return true;
    }
    const clipPath = style.clipPath;
    return Boolean(clipPath && clipPath !== "none" && /inset\s*\(\s*50%|circle\s*\(\s*0/i.test(clipPath));
};

const isHiddenTextOwner = (el) => {
    if (isExcludedTextOwner(el)) return true;

    for (let node = el; node instanceof HTMLElement; node = node.parentElement) {
        if (node.hasAttribute("hidden")) return true;
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return true;
        if (parseFloat(style.opacity) === 0) return true;
        if (parseFloat(style.fontSize) === 0) return true;
        if (isClipHidden(style)) return true;
    }

    const rect = el.getBoundingClientRect();
    return rect.width <= 0 || rect.height <= 0;
};

const isTransparentColor = (value) => {
    if (!value || value === "transparent") return true;
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return false;
    const parts = match[1].split(",").map((part) => part.trim());
    if (parts.length === 4) return parseFloat(parts[3]) === 0;
    return false;
};

const parseGradientColorToken = (token) => {
    const trimmed = token.trim();
    if (/^#[0-9a-f]{8}$/i.test(trimmed)) {
        return {
            r: parseInt(trimmed.slice(1, 3), 16),
            g: parseInt(trimmed.slice(3, 5), 16),
            b: parseInt(trimmed.slice(5, 7), 16),
            a: parseInt(trimmed.slice(7, 9), 16) / 255,
        };
    }
    if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
        return {
            r: parseInt(trimmed.slice(1, 3), 16),
            g: parseInt(trimmed.slice(3, 5), 16),
            b: parseInt(trimmed.slice(5, 7), 16),
            a: 1,
        };
    }
    const probe = document.createElement("span");
    probe.style.color = trimmed;
    document.documentElement.appendChild(probe);
    const parsed = window.getComputedStyle(probe).color;
    document.documentElement.removeChild(probe);
    const match = parsed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;
    return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] == null ? 1 : parseFloat(match[4]),
    };
};

const parseLinearGradientStops = (backgroundImage) => {
    if (!backgroundImage || !backgroundImage.includes("gradient")) return null;
    const stops = [];
    for (const match of backgroundImage.matchAll(/(#[0-9a-f]{3,8}|rgba?\([^)]+\))\s+([\d.]+)%/gi)) {
        const parsed = parseGradientColorToken(match[1]);
        if (!parsed) continue;
        stops.push({ ...parsed, offset: parseFloat(match[2]) / 100 });
    }
    if (!stops.length) return null;
    return stops.sort((a, b) => a.offset - b.offset);
};

const sampleGradientAt = (stops, t) => {
    if (!stops.length) return null;
    if (t <= stops[0].offset) return stops[0];
    if (t >= stops[stops.length - 1].offset) return stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i += 1) {
        const start = stops[i];
        const end = stops[i + 1];
        if (t < start.offset || t > end.offset) continue;
        const span = end.offset - start.offset || 1;
        const ratio = (t - start.offset) / span;
        return {
            r: Math.round(start.r + (end.r - start.r) * ratio),
            g: Math.round(start.g + (end.g - start.g) * ratio),
            b: Math.round(start.b + (end.b - start.b) * ratio),
            a: start.a + (end.a - start.a) * ratio,
        };
    }
    return stops[stops.length - 1];
};

const toRgbString = ({ r, g, b }) => `rgb(${r}, ${g}, ${b})`;

const getLineContrastSampleYs = (el, lineRect) => {
    const ys = new Set([
        lineRect.top,
        lineRect.top + lineRect.height / 2,
        lineRect.bottom,
    ]);

    for (let node = el; node instanceof HTMLElement; node = node.parentElement) {
        const { backgroundImage } = window.getComputedStyle(node);
        if (!backgroundImage || backgroundImage === "none") continue;
        const stops = parseLinearGradientStops(backgroundImage);
        if (!stops) continue;
        const nodeRect = node.getBoundingClientRect();
        if (nodeRect.height <= 0) continue;
        for (const stop of stops) {
            const y = nodeRect.top + stop.offset * nodeRect.height;
            if (y >= lineRect.top && y <= lineRect.bottom) ys.add(y);
        }
    }

    return [...ys];
};

/** @returns {[number, number, number] | null} sRGB 0–255 */
const parseCssColor = (value) => {
    if (!value || value === "transparent") return null;
    const probe = document.createElement("span");
    probe.style.color = value;
    document.documentElement.appendChild(probe);
    const parsed = window.getComputedStyle(probe).color;
    document.documentElement.removeChild(probe);
    const match = parsed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const channelToLinear = (channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const getRelativeLuminance = (r, g, b) =>
    0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);

/** WCAG 2.x 명도대비 — 배경 없으면 null */
export const getContrastRatio = (foreground, background) => {
    const fg = parseCssColor(foreground);
    const bg = parseCssColor(background);
    if (!fg || !bg) return null;
    const l1 = getRelativeLuminance(...fg);
    const l2 = getRelativeLuminance(...bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
};

/** 명도대비용 — (x,y) 지점에서 보이는 배경색. background-image gradient 포함 */
export const resolveEffectiveBackgroundAt = (el, x, y) => {
    for (let node = el; node instanceof HTMLElement; node = node.parentElement) {
        const { backgroundColor, backgroundImage } = window.getComputedStyle(node);

        if (backgroundImage && backgroundImage !== "none") {
            const stops = parseLinearGradientStops(backgroundImage);
            const rect = node.getBoundingClientRect();
            if (stops && rect.height > 0) {
                const t = Math.max(0, Math.min(1, (y - rect.top) / rect.height));
                const sampled = sampleGradientAt(stops, t);
                if (sampled && sampled.a > 0.01) {
                    return toRgbString(sampled);
                }
            }
        }

        if (!isTransparentColor(backgroundColor)) {
            return backgroundColor;
        }
    }
    return null;
};

/** 명도대비용 — 실제로 보이는 배경색 (시각화하지 않음) */
export const resolveEffectiveBackground = (el) => {
    const rect = el.getBoundingClientRect();
    return resolveEffectiveBackgroundAt(
        el,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
    );
};

/** @returns {{ color: string, backgroundColor: string | null, contrastRatio: number | null }} */
export const getTextColorsAtRect = (el, rect) => {
    const { color } = window.getComputedStyle(el);
    const cx = rect.left + rect.width / 2;
    const sampleYs = getLineContrastSampleYs(el, rect);

    let contrastRatio = null;
    let backgroundColor = null;

    for (const y of sampleYs) {
        const bg = resolveEffectiveBackgroundAt(el, cx, y);
        const ratio = getContrastRatio(color, bg);
        if (ratio == null) continue;
        if (contrastRatio == null || ratio < contrastRatio) {
            contrastRatio = ratio;
            backgroundColor = bg;
        }
    }

    return { color, backgroundColor, contrastRatio };
};

/** @returns {{ color: string, backgroundColor: string | null }} */
export const getTextColors = (el) => {
    const { color } = window.getComputedStyle(el);
    return { color, backgroundColor: resolveEffectiveBackground(el) };
};

/** 텍스트 노드의 직접 부모만 owner — hidden .measure를 건너뛰며 visible 조상을 잡지 않음 */
const getTextOwnerElement = (textNode) => {
    const owner = textNode.parentElement;
    if (!(owner instanceof HTMLElement)) return null;
    if (!owner.closest(TEXT_SCOPE)) return null;
    if (!isVisible(owner) || isHiddenTextOwner(owner)) return null;
    return owner;
};

/** visibility:hidden 등은 hit-test 대상이 아니므로, rect 중심의 최상단 요소와 owner 트리 일치 여부로 판별 */
const isRectVisuallyExposed = (owner, rect) => {
    if (rect.width <= 0 || rect.height <= 0) return false;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    if (!hit) return false;
    return owner.contains(hit) || hit.contains(owner);
};

/** @returns {{ el: Element, lineRect: DOMRect, color: string, backgroundColor: string | null, contrastRatio: number | null }[]} */
export const collectTextMetrics = () => {
    const root = document.querySelector("#viewport-scaler") ?? document.body;
    const items = [];

    for (const scope of root.querySelectorAll(TEXT_SCOPE)) {
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
                if (node.parentElement?.closest("svg")) return NodeFilter.FILTER_REJECT;
                if (!getTextOwnerElement(node)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            },
        });

        for (let textNode = walker.nextNode(); textNode; textNode = walker.nextNode()) {
            const owner = getTextOwnerElement(textNode);
            if (!owner) continue;

            const range = document.createRange();
            range.selectNodeContents(textNode);

            for (const lineRect of range.getClientRects()) {
                if (lineRect.width <= 0 || lineRect.height <= 0) continue;
                if (lineRect.width < 1 && lineRect.height < 1) continue;
                if (!isRectVisuallyExposed(owner, lineRect)) continue;
                const { color, backgroundColor } = getTextColorsAtRect(owner, lineRect);
                const contrastRatio = getContrastRatio(color, backgroundColor);
                items.push({ el: owner, lineRect, color, backgroundColor, contrastRatio });
            }
        }
    }

    return items;
};
