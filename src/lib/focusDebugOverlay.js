import { getOverlayRoot, clearOverlayRoot } from "./viewportOverlay";
import { paintGapDebugOverlay } from "./gapDebugOverlay";
import { paintTextDebugOverlay } from "./textDebugOverlay";
import { paintFocusTargetDebugOverlay } from "./focusTargetDebugOverlay";
import { paintImageDebugOverlay } from "./imageDebugOverlay";
import {
    getActiveDebugModes,
    getGapDisplayMax,
    getLayoutDebugMode,
    isFocusDebugEnabled,
    isFocusTargetDebugEnabled,
    isGapDebugEnabled,
    isImageDebugEnabled,
    isTextDebugEnabled,
    setFocusDebugEnabled,
    setFocusTargetDebugEnabled,
    setGapDebugEnabled,
    setImageDebugEnabled,
    setTextDebugEnabled,
} from "./debugQuery";
import {
    collectBBoxInteractiveItems,
    collectGapInteractiveItems,
    mountButtonSupportedStateLabel,
    isButtonActionTarget,
    appendDebugYSpan,
    DEBUG_Y_BOLD_LIMIT,
} from "./layoutDebugUtils";

const BOX_COLORS = ["#ff00e1", "#ff4800", "#ffe100", "#00e1ff", "#00ff88", "#b81a00"];
const ACTIVE_COLOR = "#ff00e1";

export {
    getLayoutDebugMode,
    isGapDebugEnabled,
    isTextDebugEnabled,
    isFocusTargetDebugEnabled,
    isImageDebugEnabled,
    isFocusDebugEnabled,
    getGapDisplayMax,
    getActiveDebugModes,
    setFocusDebugEnabled,
    setFocusTargetDebugEnabled,
    setGapDebugEnabled,
    setImageDebugEnabled,
    setTextDebugEnabled,
} from "./debugQuery";

export function toggleFocusDebug() {
    const enabled = getLayoutDebugMode() === null;
    setFocusDebugEnabled(enabled);
    return enabled;
}

export function toggleGapDebug() {
    const enabled = !isGapDebugEnabled();
    setGapDebugEnabled(enabled);
    return enabled;
}

export function toggleTextDebug() {
    const enabled = !isTextDebugEnabled();
    setTextDebugEnabled(enabled);
    return enabled;
}

export function toggleFocusTargetDebug() {
    const enabled = !isFocusTargetDebugEnabled();
    setFocusTargetDebugEnabled(enabled);
    return enabled;
}

export function toggleImageDebug() {
    const enabled = !isImageDebugEnabled();
    setImageDebugEnabled(enabled);
    return enabled;
}

const appendBBoxLayer = (root, { highlightActive = true } = {}) => {
    const active = document.activeElement;
    let index = 0;

    for (const { el } of collectBBoxInteractiveItems({ leavesOnly: true })) {
        const rect = el.getBoundingClientRect();
        const isActive = highlightActive && el === active;
        const color = isActive ? ACTIVE_COLOR : BOX_COLORS[index % BOX_COLORS.length];
        index += 1;

        const w = Math.round(rect.width * 10) / 10;
        const h = Math.round(rect.height * 10) / 10;

        const box = document.createElement("div");
        box.style.cssText = [
            "position:fixed",
            `left:${rect.left}px`,
            `top:${rect.top}px`,
            `width:${rect.width}px`,
            `height:${rect.height}px`,
            `border:2px solid ${color}`,
            "box-sizing:border-box",
            `background:${color}22`,
            "z-index:0",
            isActive ? "outline:2px dashed #fff" : "",
        ].filter(Boolean).join(";");

        const meta = document.createElement("div");
        meta.style.cssText = [
            "position:absolute",
            "right:0",
            "bottom:0",
            "display:flex",
            "flex-wrap:nowrap",
            "align-items:baseline",
            "gap:0",
            `background:${color}`,
            "color:#000",
            "font:9px monospace",
            "padding:0 2px",
            "opacity:0.85",
            "white-space:nowrap",
        ].join(";");

        appendDebugYSpan(meta, rect, DEBUG_Y_BOLD_LIMIT.bbox);

        const size = document.createElement("span");
        size.textContent = `${w}×${h}`;
        meta.appendChild(size);

        if (isButtonActionTarget(el)) {
            const stateWrap = document.createElement("span");
            if (mountButtonSupportedStateLabel(stateWrap, el, { activeElement: active })) {
                meta.appendChild(document.createTextNode(", "));
                meta.appendChild(stateWrap);
            }
        }

        box.appendChild(meta);
        root.appendChild(box);
    }

    return index;
};

/** bbox / gap / text / focus 시각화 (각각 독립 URL/토글) */
export function paintFocusDebugOverlay(options = {}) {
    const bboxMode = getLayoutDebugMode();
    const gapMode = isGapDebugEnabled();
    const textMode = isTextDebugEnabled();
    const focusMode = isFocusTargetDebugEnabled();
    const imageMode = isImageDebugEnabled();
    const gapMax = getGapDisplayMax();

    if (!bboxMode && !gapMode && !textMode && !focusMode && !imageMode) {
        clearFocusDebugOverlay();
        return {
            boxCount: 0,
            gapCount: 0,
            textCount: 0,
            textMetrics: [],
            itemCount: 0,
            gapMax,
            focused: false,
            focusCount: 0,
            activeOrder: 0,
            focusTtsText: "",
            imageCount: 0,
            iconCount: 0,
            symbolCount: 0,
        };
    }

    const root = getOverlayRoot();
    root.replaceChildren();

    let boxCount = 0;
    let gapCount = 0;
    let textCount = 0;
    let textMetrics = [];
    let focusResult = { focusCount: 0, activeOrder: 0, activeTtsText: "" };
    let imageResult = { imageCount: 0, iconCount: 0, symbolCount: 0, items: [] };

    if (bboxMode) {
        boxCount = appendBBoxLayer(root, options);
    }
    if (gapMode) {
        gapCount = paintGapDebugOverlay(root, { gapMax });
    }
    if (textMode) {
        const textResult = paintTextDebugOverlay(root);
        textCount = textResult.lineCount;
        textMetrics = textResult.items;
    }
    if (focusMode) {
        focusResult = paintFocusTargetDebugOverlay(root);
    }
    if (imageMode) {
        imageResult = paintImageDebugOverlay(root);
    }

    return {
        boxCount,
        gapCount,
        textCount,
        textMetrics,
        gapMax,
        itemCount: collectBBoxInteractiveItems({ leavesOnly: true }).length,
        focusCount: focusResult.focusCount,
        activeOrder: focusResult.activeOrder,
        focusTtsText: focusResult.activeTtsText,
        imageCount: imageResult.imageCount,
        iconCount: imageResult.iconCount,
        symbolCount: imageResult.symbolCount,
    };
}

export function clearFocusDebugOverlay() {
    clearOverlayRoot();
}
