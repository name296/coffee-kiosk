import { useEffect } from "react";
import {
    clearFocusDebugOverlay,
    getActiveDebugModes,
    getGapDisplayMax,
    getLayoutDebugMode,
    isFocusDebugEnabled,
    paintFocusDebugOverlay,
    toggleFocusDebug,
    toggleFocusTargetDebug,
    toggleGapDebug,
    toggleImageDebug,
    toggleTextDebug,
} from "@/lib/focusDebugOverlay";

/** 개발용: ?debug=bbox | ?debug=gap[=N] | ?debug=text | ?debug=focus | ?debug=image */
export const FocusDebugOverlay = () => {
    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return undefined;

        let rafId = 0;

        const repaint = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (isFocusDebugEnabled()) {
                    const result = paintFocusDebugOverlay();
                    if (process.env.NODE_ENV === "development") {
                        console.debug("[layout-debug]", result);
                    }
                } else {
                    clearFocusDebugOverlay();
                }
            });
        };

        const onKeyDown = (event) => {
            if (!event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;

            if (event.key.toLowerCase() === "b") {
                const enabled = toggleFocusDebug();
                console.info(`[debug] bbox ${enabled ? "ON" : "OFF"} — Shift+B (?debug=bbox)`);
                repaint();
                event.preventDefault();
                return;
            }

            if (event.key.toLowerCase() === "g") {
                const enabled = toggleGapDebug();
                const max = getGapDisplayMax();
                console.info(
                    `[debug] gap ${enabled ? "ON" : "OFF"} — Shift+G (?debug=gap · ?debug=gap=${max})`
                );
                repaint();
                event.preventDefault();
                return;
            }

            if (event.key.toLowerCase() === "t") {
                const enabled = toggleTextDebug();
                console.info(`[debug] text ${enabled ? "ON" : "OFF"} — Shift+T (?debug=text)`);
                repaint();
                event.preventDefault();
                return;
            }

            if (event.key.toLowerCase() === "f") {
                const enabled = toggleFocusTargetDebug();
                console.info(`[debug] focus ${enabled ? "ON" : "OFF"} — Shift+F (?debug=focus)`);
                repaint();
                event.preventDefault();
                return;
            }

            if (event.key.toLowerCase() === "i") {
                const enabled = toggleImageDebug();
                console.info(`[debug] image ${enabled ? "ON" : "OFF"} — Shift+I (?debug=image)`);
                repaint();
                event.preventDefault();
            }
        };

        const modes = getActiveDebugModes();
        if (modes.debug) {
            console.info("[debug] URL", modes);
        } else if (modes.gap || modes.bbox || modes.text || modes.focus || modes.image) {
            console.info("[debug] localStorage", modes);
        }

        repaint();
        window.addEventListener("resize", repaint);
        window.addEventListener("coffee-kiosk:viewport-change", repaint);
        window.addEventListener("coffee-kiosk:focus-debug-change", repaint);
        window.addEventListener("coffee-kiosk:gap-debug-change", repaint);
        window.addEventListener("coffee-kiosk:text-debug-change", repaint);
        window.addEventListener("coffee-kiosk:focus-target-debug-change", repaint);
        window.addEventListener("coffee-kiosk:image-debug-change", repaint);
        window.addEventListener("focusin", repaint, true);
        window.addEventListener("focusout", repaint, true);
        document.addEventListener("mousedown", repaint, true);
        document.addEventListener("mouseup", repaint, true);
        document.addEventListener("keydown", onKeyDown);

        const observer = new MutationObserver(repaint);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style", "hidden", "aria-hidden", "aria-disabled", "aria-pressed"],
        });

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", repaint);
            window.removeEventListener("coffee-kiosk:viewport-change", repaint);
            window.removeEventListener("focusin", repaint, true);
            window.removeEventListener("focusout", repaint, true);
            document.removeEventListener("mousedown", repaint, true);
            document.removeEventListener("mouseup", repaint, true);
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("coffee-kiosk:focus-debug-change", repaint);
            window.removeEventListener("coffee-kiosk:gap-debug-change", repaint);
            window.removeEventListener("coffee-kiosk:text-debug-change", repaint);
            window.removeEventListener("coffee-kiosk:focus-target-debug-change", repaint);
            window.removeEventListener("coffee-kiosk:image-debug-change", repaint);
            observer.disconnect();
            clearFocusDebugOverlay();
        };
    }, []);

    return null;
};
