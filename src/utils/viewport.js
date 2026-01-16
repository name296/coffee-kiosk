import { SCREEN } from "../constants/constants";

export function setViewportZoom() {
    const { WIDTH: bw, HEIGHT: bh } = SCREEN;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const zoom = Math.min(vw / bw, vh / bh);
    const html = document.documentElement;

    if (html) {
        html.style.transform = `scale(${zoom})`;
        html.style.transformOrigin = 'top left';
        const sw = bw * zoom;
        const sh = bh * zoom;
        html.style.position = 'fixed';
        html.style.top = `${(vh - sh) / 2}px`;
        html.style.left = `${(vw - sw) / 2}px`;
        html.style.width = `${bw}px`;
        html.style.height = `${bh}px`;
    }
}

export function setupViewportResize() {
    const h = () => setViewportZoom();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
}
