import { isVisible } from "./layoutDebugUtils";

const IMAGE_SCOPE = ".process, .modal";
const OVERLAY_ID = "focus-debug-overlay-root";

const SPECIAL_ELEMENT_SELECTOR = ".pagination-separator, .category-separator, svg.separator";
const VISUAL_SELECTOR = `img, .icon img, .icon svg, ${SPECIAL_ELEMENT_SELECTOR}`;

/** 글자·숫자 제외 — ✓, / 등 */
const SPECIAL_CHAR_PATTERN = /^[^\p{L}\p{N}]+$/u;

const isSvgIcon = (el) => el?.matches?.("svg") && Boolean(el.closest(".icon"));
const isIconHostedImage = (el) => el?.matches?.("img") && Boolean(el.closest(".icon"));
const isOrderItemImage = (el) => el?.matches?.("img") && Boolean(el.closest(".order-item"));
const isSymbolElement = (el) => Boolean(el?.matches?.(SPECIAL_ELEMENT_SELECTOR));

const isDecorativeVisualEl = (el) =>
    Boolean(el?.closest?.(".icon") || el?.matches?.(SPECIAL_ELEMENT_SELECTOR));

const isExcludedImageEl = (el) => {
    if (!el) return true;
    if (el.closest(`#${OVERLAY_ID}`)) return true;
    if (el.closest(".measure")) return true;
    if (el.closest("[inert], [hidden]")) return true;
    if (isDecorativeVisualEl(el)) return false;
    if (el.closest('[aria-hidden="true"]')) return true;
    return false;
};

const isHiddenImageEl = (el) => {
    if (isExcludedImageEl(el)) return true;

    for (let node = el; node instanceof Element; node = node.parentElement) {
        if (node.hasAttribute("hidden")) return true;
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return true;
        if (parseFloat(style.opacity) === 0) return true;
    }

    const rect = el.getBoundingClientRect();
    return rect.width <= 0 || rect.height <= 0;
};

const isSpecialCharText = (text) => {
    const trimmed = text?.trim();
    if (!trimmed) return false;
    return SPECIAL_CHAR_PATTERN.test(trimmed);
};

const isRectVisuallyExposed = (el, rect) => {
    // .icon / .order-item 안 img·svg는 겹침·pointer-events:none(.screen:focus-within)으로 hit-test 빗나감
    if (isSvgIcon(el) || isIconHostedImage(el) || isOrderItemImage(el) || isSymbolElement(el)) return true;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const stack = document.elementsFromPoint?.(cx, cy)
        ?? [document.elementFromPoint(cx, cy)].filter(Boolean);
    return stack.some(
        (node) => node instanceof Element && (el.contains(node) || node.contains(el))
    );
};

const getVisualKind = (el) => {
    if (isSvgIcon(el)) return "icon";
    if (isSymbolElement(el)) return "symbol";
    if (el.matches("svg")) return "icon";
    return "image";
};

const getTextOwnerElement = (textNode) => {
    const owner = textNode.parentElement;
    if (!(owner instanceof HTMLElement)) return null;
    if (!owner.closest(IMAGE_SCOPE)) return null;
    if (!isVisible(owner) || isHiddenImageEl(owner)) return null;
    if (owner.closest(SPECIAL_ELEMENT_SELECTOR)) return null;
    return owner;
};

/** @returns {{ el: Element, rect: DOMRect, kind: "image"|"icon"|"symbol" }[]} */
export const collectImageMetrics = () => {
    const root = document.querySelector("#viewport-scaler") ?? document.body;
    const items = [];

    for (const scope of root.querySelectorAll(IMAGE_SCOPE)) {
        for (const el of scope.querySelectorAll(VISUAL_SELECTOR)) {
            if (!(el instanceof Element)) continue;
            if (!isVisible(el) || isHiddenImageEl(el)) continue;

            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) continue;
            if (!isRectVisuallyExposed(el, rect)) continue;

            items.push({ el, rect, kind: getVisualKind(el) });
        }

        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!isSpecialCharText(node.textContent)) return NodeFilter.FILTER_REJECT;
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
                items.push({ el: owner, rect: lineRect, kind: "symbol" });
            }
        }
    }

    return items;
};
