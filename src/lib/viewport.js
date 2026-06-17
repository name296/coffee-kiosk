/**
 * 뷰포트 맞춤: body는 transform 없이 flex 중앙 정렬만.
 * scale은 #viewport-scaler에만 적용 — Cursor DevTools·Select element·fixed 오버레이 좌표계 보호.
 */
const SCALER_SELECTOR = "#viewport-scaler";

let registered = false;

export function getViewportScaler() {
    if (typeof document === "undefined") return null;
    return document.querySelector(SCALER_SELECTOR);
}

export function getViewportScale() {
    const scaler = getViewportScaler();
    if (!scaler) return 1;
    const raw = parseFloat(getComputedStyle(scaler).scale);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

export function setupViewportZoom() {
    if (typeof window === "undefined" || registered) return;
    registered = true;

    const apply = () => {
        const scaler = getViewportScaler();
        if (!scaler) return;

        scaler.style.scale = String(Math.min(
            window.innerWidth / scaler.offsetWidth,
            window.innerHeight / scaler.offsetHeight
        ));
        window.dispatchEvent(new CustomEvent("coffee-kiosk:viewport-change"));
    };

    apply();
    window.addEventListener("resize", apply);
}
