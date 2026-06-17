import { getOverlayRoot } from "./viewportOverlay";
import { collectImageMetrics } from "./imageDebugUtils";

const IMAGE_COLOR = "#00bcd4";
const ICON_COLOR = "#ffb300";
const SYMBOL_COLOR = "#e040fb";

const colorForKind = (kind) => {
    if (kind === "icon") return ICON_COLOR;
    if (kind === "symbol") return SYMBOL_COLOR;
    return IMAGE_COLOR;
};

const appendImageRect = (root, rect, color) => {
    const box = document.createElement("div");
    box.style.cssText = [
        "position:fixed",
        `left:${rect.left}px`,
        `top:${rect.top}px`,
        `width:${rect.width}px`,
        `height:${rect.height}px`,
        `border:1px solid ${color}`,
        "box-sizing:border-box",
        `background:${color}22`,
        "pointer-events:none",
        "z-index:1",
    ].join(";");
    root.appendChild(box);
};

const appendImageLabel = (root, rect, color) => {
    const w = Math.round(rect.width * 10) / 10;
    const h = Math.round(rect.height * 10) / 10;
    const tag = document.createElement("div");
    tag.textContent = `${w}×${h}`;
    tag.style.cssText = [
        "position:fixed",
        `left:${rect.right}px`,
        `top:${rect.bottom}px`,
        "transform:translate(-100%, -100%)",
        `background:${color}`,
        "color:#000",
        "font:9px monospace",
        "padding:0 2px",
        "white-space:nowrap",
        "pointer-events:none",
        "z-index:2",
    ].join(";");
    root.appendChild(tag);
};

/** @param {ParentNode} root */
export const paintImageDebugOverlay = (root = getOverlayRoot()) => {
    const items = collectImageMetrics();
    let layer = root.querySelector(".image-debug-layer");
    if (!layer) {
        layer = document.createElement("div");
        layer.className = "image-debug-layer";
        layer.style.cssText = "position:fixed;inset:0;pointer-events:none;overflow:visible;z-index:1";
        root.appendChild(layer);
    }
    layer.replaceChildren();

    let imageCount = 0;
    let iconCount = 0;
    let symbolCount = 0;
    for (const { rect, kind } of items) {
        const color = colorForKind(kind);
        appendImageRect(layer, rect, color);
        appendImageLabel(layer, rect, color);
        if (kind === "icon") iconCount += 1;
        else if (kind === "symbol") symbolCount += 1;
        else imageCount += 1;
    }

    return { imageCount, iconCount, symbolCount, items };
};

export { collectImageMetrics };
