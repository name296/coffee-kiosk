import React, { useEffect } from "react";
import { setViewportZoom, setupViewportResize } from "../utils";

/** 뷰포트 초기화 */
export const ViewportInitializer = () => {
    useEffect(() => {
        setViewportZoom();
        const cleanup = setupViewportResize();
        return cleanup;
    }, []);
    return null;
};
