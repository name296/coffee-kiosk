import { OVERLAY_ROOT_ID } from "./viewportOverlay";
import {
    getFocusTtsText,
    getScopedFocusableElements,
    isSectionFocusParent,
    isVisible,
} from "./layoutDebugUtils";

const FOCUS_COLORS = ["#ff00e1", "#ff4800", "#ffe100", "#00e1ff", "#00ff88", "#b81a00"];
const ACTIVE_COLOR = "#ff00e1";

const isPaintableFocusTarget = (el) => {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el.closest(`#${OVERLAY_ROOT_ID}`)) return false;
    if (!isVisible(el)) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

const buildFocusLabel = (order, ttsText) => {
    if (ttsText) return `${order}, ${ttsText}`;
    return String(order);
};

const appendFocusLabel = (root, box, el, rect, order, ttsText, color) => {
    const tag = document.createElement("div");
    tag.textContent = buildFocusLabel(order, ttsText);

    const shared = [
        `background:${color}`,
        "color:#000",
        "font:9px/1.2 monospace",
        "padding:1px 3px",
        "max-width:360px",
        "white-space:normal",
        "word-break:keep-all",
        "pointer-events:none",
        "z-index:4",
    ];

    if (isSectionFocusParent(el)) {
        tag.style.cssText = [
            "position:fixed",
            `left:${rect.left}px`,
            `top:${rect.top}px`,
            "transform:translateY(calc(-100% - 2px))",
            ...shared,
        ].join(";");
        root.appendChild(box);
        root.appendChild(tag);
        return;
    }

    tag.style.cssText = [
        "position:absolute",
        "left:0",
        "top:0",
        "max-width:min(100%,360px)",
        ...shared,
    ].join(";");
    box.appendChild(tag);
    root.appendChild(box);
};

/** @param {ParentNode} root */
export const paintFocusTargetDebugOverlay = (root) => {
    const active = document.activeElement;
    const items = getScopedFocusableElements();
    let focusCount = 0;
    let activeOrder = 0;
    let activeTtsText = "";

    items.forEach((el, index) => {
        if (!isPaintableFocusTarget(el)) return;

        const order = index + 1;
        const rect = el.getBoundingClientRect();
        const isActive = el === active;
        const ttsText = getFocusTtsText(el);
        const color = isActive ? ACTIVE_COLOR : FOCUS_COLORS[index % FOCUS_COLORS.length];

        if (isActive) {
            activeOrder = order;
            activeTtsText = ttsText;
        }

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
            "z-index:3",
            isActive ? "outline:2px dashed #fff" : "",
        ].filter(Boolean).join(";");

        appendFocusLabel(root, box, el, rect, order, ttsText, color);
        focusCount += 1;
    });

    return { focusCount, activeOrder, activeTtsText };
};
