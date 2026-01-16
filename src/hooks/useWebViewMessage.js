import { useEffect, useContext } from "react";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";

export const useWebViewMessage = () => {
    const route = useContext(ScreenRouteContext);

    useEffect(() => {
        if (!window.chrome?.webview) return;

        const hm = (e) => {
            let d = e.data;
            if (d.arg.result === 'SUCCESS') {
                if (d.Command === 'PAY') route.setCurrentPage('ScreenCardRemoval');
                if (d.Command === 'PRINT') route.setCurrentPage('ScreenOrderComplete');
            } else {
                console.log(d.arg.errorMessage);
            }
        };

        window.chrome.webview.addEventListener("message", hm);
        return () => {
            if (window.chrome?.webview) {
                window.chrome.webview.removeEventListener("message", hm);
            }
        };
    }, [route]);
};
