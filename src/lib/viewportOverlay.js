/** transform된 body 밖(documentElement)에 두는 오버레이 — getBoundingClientRect(뷰포트 좌표)와 일치 */
export const OVERLAY_ROOT_ID = "focus-debug-overlay-root";

export function getOverlayRoot() {
    let root = document.getElementById(OVERLAY_ROOT_ID);
    if (!root) {
        root = document.createElement("div");
        root.id = OVERLAY_ROOT_ID;
        root.setAttribute("aria-hidden", "true");
        root.style.cssText = [
            "position:fixed",
            "inset:0",
            "pointer-events:none",
            "z-index:2147483646",
            "overflow:visible",
        ].join(";");
        document.documentElement.appendChild(root);
    }
    return root;
}

export function clearOverlayRoot() {
    document.getElementById(OVERLAY_ROOT_ID)?.remove();
}
