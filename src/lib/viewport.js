/**
 * 뷰포트 맞춤: body 중앙은 globals(inset 50% + translate -50%), 배율만 `style.scale` + resize. 전역 1회 등록(클린업 없음).
 */
let registered = false;

export function setupViewportZoom() {
    if (typeof window === "undefined" || registered) return;
    registered = true;
    const apply = () => {document.body.style.scale = Math.min(window.innerWidth / document.body.offsetWidth, window.innerHeight / document.body.offsetHeight);};
    apply();
    window.addEventListener("resize", apply);
}
