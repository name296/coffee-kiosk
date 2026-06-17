import { getOverlayRoot } from "./viewportOverlay";
import {
    centerX,
    centerY,
    collectGapInteractiveItems,
    horizontalOverlap,
    verticalOverlap,
} from "./layoutDebugUtils";

const ROW_EPS = 32;
const COL_EPS = 32;
/** 시각화·계산 상한 — 32px 미만 간격만 대상 */
export const GAP_DISPLAY_MAX = 32;
const MIN_OVERLAP_RATIO = 0.2;
const GAP_H_COLOR = "#00e5ff";
const GAP_V_COLOR = "#ff9100";

const gapKey = (type, a, b) => {
    const p1 = `${a.r.left.toFixed(0)}_${a.r.top.toFixed(0)}_${a.r.width.toFixed(0)}`;
    const p2 = `${b.r.left.toFixed(0)}_${b.r.top.toFixed(0)}_${b.r.width.toFixed(0)}`;
    return `${type}:${[p1, p2].sort().join("<>")}`;
};

const pushUnique = (list, seen, entry) => {
    const key = gapKey(entry.type, entry.a, entry.b);
    if (seen.has(key)) return;
    seen.add(key);
    list.push(entry);
};

/** @param {{ el: Element, r: DOMRect }[]} items */
export const computeInteractiveGaps = (items, gapMax = DEFAULT_GAP_DISPLAY_MAX) => {
    const gaps = [];
    const seen = new Set();

    const rows = [];
    const sortedByY = [...items].sort((a, b) => centerY(a.r) - centerY(b.r) || a.r.left - b.r.left);
    for (const item of sortedByY) {
        const row = rows.find((group) => Math.abs(centerY(group[0].r) - centerY(item.r)) <= ROW_EPS);
        if (row) row.push(item);
        else rows.push([item]);
    }
    for (const row of rows) {
        row.sort((a, b) => a.r.left - b.r.left);
        for (let i = 0; i < row.length - 1; i += 1) {
            const a = row[i];
            const b = row[i + 1];
            if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
            const gap = b.r.left - a.r.right;
            if (gap < 0 || gap >= gapMax) continue;
            pushUnique(gaps, seen, { type: "h", a, b, gap: Math.round(gap * 10) / 10 });
        }
    }

    const cols = [];
    const sortedByX = [...items].sort((a, b) => centerX(a.r) - centerX(b.r) || a.r.top - b.r.top);
    for (const item of sortedByX) {
        const col = cols.find((group) => Math.abs(centerX(group[0].r) - centerX(item.r)) <= COL_EPS);
        if (col) col.push(item);
        else cols.push([item]);
    }
    for (const col of cols) {
        col.sort((a, b) => a.r.top - b.r.top);
        for (let i = 0; i < col.length - 1; i += 1) {
            const a = col[i];
            const b = col[i + 1];
            if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
            const gap = b.r.top - a.r.bottom;
            if (gap < 0 || gap >= gapMax) continue;
            pushUnique(gaps, seen, { type: "v", a, b, gap: Math.round(gap * 10) / 10 });
        }
    }

    for (let i = 0; i < items.length; i += 1) {
        for (let j = i + 1; j < items.length; j += 1) {
            const a = items[i];
            const b = items[j];
            if (a.el.contains(b.el) || b.el.contains(a.el)) continue;

            const left = a.r.left <= b.r.left ? a : b;
            const right = left === a ? b : a;
            const vo = verticalOverlap(left.r, right.r);
            if (vo >= Math.min(left.r.height, right.r.height) * MIN_OVERLAP_RATIO) {
                const gap = right.r.left - left.r.right;
                if (gap >= 0 && gap < gapMax) {
                    pushUnique(gaps, seen, { type: "h", a: left, b: right, gap: Math.round(gap * 10) / 10 });
                }
            }

            const top = a.r.top <= b.r.top ? a : b;
            const bottom = top === a ? b : a;
            const ho = horizontalOverlap(top.r, bottom.r);
            if (ho >= Math.min(top.r.width, bottom.r.width) * MIN_OVERLAP_RATIO) {
                const gap = bottom.r.top - top.r.bottom;
                if (gap >= 0 && gap < gapMax) {
                    pushUnique(gaps, seen, { type: "v", a: top, b: bottom, gap: Math.round(gap * 10) / 10 });
                }
            }
        }
    }

    return gaps;
};

const svgEl = (name, attrs) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    return node;
};

const appendGapLabel = (svg, cx, cy, text, color, rotate = 0) => {
    const padX = 3;
    const padY = 2;
    const fontSize = 10;
    const textW = text.length * 6.2;
    const textH = fontSize + 2;

    const group = svgEl("g", {});
    if (rotate) {
        group.setAttribute("transform", `rotate(${rotate} ${cx} ${cy})`);
    }

    group.appendChild(svgEl("rect", {
        x: cx - textW / 2 - padX,
        y: cy - textH / 2 - padY,
        width: textW + padX * 2,
        height: textH + padY * 2,
        fill: "rgba(0,0,0,0.72)",
        rx: 2,
    }));

    const label = svgEl("text", {
        x: cx,
        y: cy,
        fill: color,
        "font-size": fontSize,
        "font-family": "monospace",
        "text-anchor": "middle",
        "dominant-baseline": "middle",
    });
    label.textContent = text;
    group.appendChild(label);
    svg.appendChild(group);
};

/** @param {ParentNode} root */
export const paintGapDebugOverlay = (root = getOverlayRoot(), { gapMax = GAP_DISPLAY_MAX } = {}) => {
    const items = collectGapInteractiveItems({ leavesOnly: true });
    const gaps = computeInteractiveGaps(items, gapMax);

    let svg = root.querySelector("svg.gap-debug-layer");
    if (!svg) {
        svg = svgEl("svg", { class: "gap-debug-layer" });
        svg.style.cssText = [
            "position:fixed",
            "inset:0",
            "width:100%",
            "height:100%",
            "pointer-events:none",
            "overflow:visible",
            "z-index:1",
        ].join(";");
        root.appendChild(svg);
    }
    svg.replaceChildren();

    for (const { type, a, b, gap } of gaps) {
        const color = type === "h" ? GAP_H_COLOR : GAP_V_COLOR;
        if (type === "h") {
            const y = (Math.max(a.r.top, b.r.top) + Math.min(a.r.bottom, b.r.bottom)) / 2;
            const x1 = a.r.right;
            const x2 = b.r.left;
            svg.appendChild(svgEl("line", {
                x1, y1: y, x2, y2: y,
                stroke: color,
                "stroke-width": 2,
            }));
            appendGapLabel(svg, (x1 + x2) / 2, y, `${gap}px`, color);
        } else {
            const x = (Math.max(a.r.left, b.r.left) + Math.min(a.r.right, b.r.right)) / 2;
            const y1 = a.r.bottom;
            const y2 = b.r.top;
            svg.appendChild(svgEl("line", {
                x1: x, y1, x2: x, y2,
                stroke: color,
                "stroke-width": 2,
            }));
            appendGapLabel(svg, x, (y1 + y2) / 2, `${gap}px`, color, 90);
        }
    }

    return gaps.length;
};
