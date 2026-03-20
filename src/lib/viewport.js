/**
 * 뷰포트 맞춤: body(캔버스) 스케일·중앙 정렬만 담당.
 * body 기준 크기는 CSS(design-system --layout-width/height)에서 정의.
 */
export function setViewportZoom() {
    const body = document.body;
    if (!body) return;
    body.style.position = 'fixed';
    body.style.top = '50%';
    body.style.left = '50%';
    body.style.transform = `translate(-50%, -50%) scale(${Math.min(window.innerWidth / body.offsetWidth, window.innerHeight / body.offsetHeight)})`;
    body.style.transformOrigin = 'center center';
}

export function setupViewportResize() {
    const h = () => setViewportZoom();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
}
