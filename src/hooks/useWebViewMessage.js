import { useEffect, useContext } from "react";
import { PROCESS_NAME } from "@/constants";
import { ScreenRouteContext } from "@/contexts";

export const useWebViewMessage = () => {
    const { navigateTo } = useContext(ScreenRouteContext);

    useEffect(() => {
        if (!window.chrome?.webview) return;

        const hm = (e) => {
            let d = e.data;
            if (d.arg.result === 'SUCCESS') {
                if (d.Command === 'PAY') navigateTo(PROCESS_NAME.CARD_REMOVAL);
                if (d.Command === 'PRINT') navigateTo(PROCESS_NAME.ORDER_COMPLETE);
            } else {
                if (process.env.NODE_ENV === "development") {
                    console.log(d.arg.errorMessage);
                }
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
