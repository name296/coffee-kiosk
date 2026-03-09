import React, { memo } from "react";
import OrderList from "./OrderList";

/**
 * details-content 래퍼 + OrderList.
 * ProcessMenu(Summary 아래), ProcessDetails(Main 내) 공통 사용.
 */
const DetailsContent = memo(({ className = "", paginationDirection, itemsPerPageOverride, style } = {}) => (
    <div className={`details-content ${className}`.trim()} style={style}>
        <OrderList
            paginationDirection={paginationDirection}
            itemsPerPageOverride={itemsPerPageOverride}
        />
    </div>
));

DetailsContent.displayName = "DetailsContent";
export default DetailsContent;
