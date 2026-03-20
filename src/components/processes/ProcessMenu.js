import React, { memo, useContext, useLayoutEffect } from "react";
import { Category, MenuGrid, Main, Step, Bottom, Summary, Cart } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { OrderContext } from "@/contexts";
import { processTts } from "@/lib/processTts";

const ProcessMenu = memo(() => {
    const order = useContext(OrderContext);

    useLayoutEffect(() => {
        const firstTabName = order?.categoryInfo?.[0]?.cate_name ?? "전체메뉴";
        order?.setSelectedTab?.(firstTabName);
    }, [order?.categoryInfo, order?.setSelectedTab]);

    return (
        <div className="process second" tabIndex={-1}>
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.MENU]}>
                <Category />
                <MenuGrid />
            </Main>
            <Summary />
            <Cart className="compact" />
            <Bottom />
        </div>
    );
});

ProcessMenu.displayName = "ProcessMenu";
export default ProcessMenu;
