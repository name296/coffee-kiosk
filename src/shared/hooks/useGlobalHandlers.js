import { useEffect } from "react";

// 전역 핸들러 등록 (단일책임: window 객체에 핸들러 등록/제거만)
export const useGlobalHandlerRegistration = (finalHandleText) => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.__finalHandleText = finalHandleText;
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete window.__finalHandleText;
            }
        };
    }, [finalHandleText]);
};
