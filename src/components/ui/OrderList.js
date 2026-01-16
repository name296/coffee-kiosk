import React, { memo } from "react";
import OrderRow from "./OrderRow";

const OrderList = memo(({
    currentItems,
    pageNumber,
    itemsPerPage,
    rowRefs,
    quantities,
    onDecrease,
    onIncrease,
    onDelete,
    convertToKoreanQuantity
}) => {
    return (
        <div className="order-list">
            {currentItems && currentItems.length > 0 && currentItems.map((item, i) => (
                <OrderRow
                    key={item.id}
                    item={item}
                    index={(pageNumber - 1) * itemsPerPage + i + 1}
                    quantity={quantities[item.id]}
                    onDecrease={(e) => onDecrease(item.id, currentItems.length)(e)}
                    onIncrease={(e) => onIncrease(item.id)(e)}
                    onDelete={(e) => onDelete(item.id, currentItems.length)(e)}
                    sectionRef={itemsPerPage ? rowRefs[(i % itemsPerPage)] : rowRefs[i]}
                    convertToKoreanQuantity={convertToKoreanQuantity}
                />
            ))}
        </div>
    );
});
OrderList.displayName = 'OrderList';

export default OrderList;
