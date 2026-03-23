import React, { useEffect } from "react";
import { setupViewportZoom } from "@/lib";

/** 뷰포트 초기화 */
export const ViewportInitializer = () => {
    useEffect(() => {
        setupViewportZoom();
    }, []);
    return null;
};
