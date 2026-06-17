import { getOverlayRoot } from "./viewportOverlay";
import { collectTextMetrics } from "./textDebugUtils";

const INK_COLOR = "#e040fb";
const CONTRAST_FAIL_COLOR = "#f44336";
const CONTRAST_PASS_COLOR = "#00c853";
const CONTRAST_ENHANCED_COLOR = "#2196f3";

const labelBackgroundForContrast = (contrastRatio) => {
    if (contrastRatio == null) return INK_COLOR;
    if (contrastRatio >= 7) return CONTRAST_ENHANCED_COLOR;
    if (contrastRatio >= 4.5) return CONTRAST_PASS_COLOR;
    return CONTRAST_FAIL_COLOR;
};

const appendInkLabel = (root, left, top, inkH, contrastRatio) => {
    const contrastLabel = contrastRatio == null ? "?" : contrastRatio.toFixed(3);
    const tag = document.createElement("div");
    tag.textContent = `${inkH}px, ${contrastLabel}`;
    tag.style.cssText = [
        "position:fixed",
        `left:${left}px`,
        `top:${top}px`,
        `background:${labelBackgroundForContrast(contrastRatio)}`,
        "color:#000",
        "font:9px/1.1 monospace",
        "padding:1px 3px",
        "white-space:nowrap",
        "pointer-events:none",
        "z-index:2",
    ].join(";");
    root.appendChild(tag);
};

const appendInkRect = (root, rect) => {
    const box = document.createElement("div");
    box.style.cssText = [
        "position:fixed",
        `left:${rect.left}px`,
        `top:${rect.top}px`,
        `width:${rect.width}px`,
        `height:${rect.height}px`,
        `border:1px solid ${INK_COLOR}`,
        "box-sizing:border-box",
        "pointer-events:none",
        "z-index:1",
    ].join(";");
    root.appendChild(box);
};

/** @param {ParentNode} root */
export const paintTextDebugOverlay = (root = getOverlayRoot()) => {
    const items = collectTextMetrics();
    let layer = root.querySelector(".text-debug-layer");
    if (!layer) {
        layer = document.createElement("div");
        layer.className = "text-debug-layer";
        layer.style.cssText = "position:fixed;inset:0;pointer-events:none;overflow:visible;z-index:1";
        root.appendChild(layer);
    }
    layer.replaceChildren();

    let lineCount = 0;
    for (const { lineRect, contrastRatio } of items) {
        appendInkRect(layer, lineRect);
        const inkH = Math.round(lineRect.height * 10) / 10;
        appendInkLabel(layer, lineRect.left, lineRect.top - 12, inkH, contrastRatio);
        lineCount += 1;
    }

    return { lineCount, items };
};

export { collectTextMetrics };
