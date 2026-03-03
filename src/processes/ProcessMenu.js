import React, { memo, useContext, useLayoutEffect } from "react";
import { Category, MenuGrid } from "../components";
import { OrderContext } from "../contexts";

const ProcessMenu = memo(() => {
    const order = useContext(OrderContext);

    useLayoutEffect(() => {
        const firstTabName = order?.categoryInfo?.[0]?.cate_name ?? "전체메뉴";
        order?.setSelectedTab?.(firstTabName);
    }, [order?.categoryInfo, order?.setSelectedTab]);

    return (
        <>
            <Category />
            <MenuGrid />
        </>
    );
});

ProcessMenu.displayName = "ProcessMenu";
export default ProcessMenu;
