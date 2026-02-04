import { useEffect, useContext } from "react";
import { ScreenRouteContext } from "../contexts";

export const useWebViewMessage = () => {
    const { navigateTo } = useContext(ScreenRouteContext);

    useEffect(() => {
        if (!window.chrome?.webview) return;

        const hm = (e) => {
            let d = e.data;
            if (d.arg.result === 'SUCCESS') {
                if (d.Command === 'PAY') navigateTo('ProcessCardRemoval');
                if (d.Command === 'PRINT') navigateTo('ProcessOrderComplete');
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
    }, [navigateTo]);
};
