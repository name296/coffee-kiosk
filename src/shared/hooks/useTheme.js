import { useEffect, useLayoutEffect } from "react";

export const useBodyClass = (className, condition) => {
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (condition) document.body.classList.add(className);
        else document.body.classList.remove(className);
        return () => document.body.classList.remove(className);
    }, [className, condition]);
};

// HTML 요소에 클래스 + font-size 스케일 적용 (CSS 변수 사용)
export const useHtmlClass = (className, condition) => {
    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        const html = document.documentElement;
        const scale = condition ? 1.2 : 1;

        // CSS 변수로 스케일 조정 (1 = 기본, 1.2 = 큰글씨)
        html.style.setProperty('--font-size-scale', scale);

        if (condition) {
            html.classList.add(className);
        } else {
            html.classList.remove(className);
        }
        console.log(`🎨 useHtmlClass: ${className}=${condition}, scale=${scale}`);
    }, [className, condition]);
};
