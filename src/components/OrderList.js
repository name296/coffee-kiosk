import React, { memo, useContext } from "react";
import Button from "./Button";
import { DeleteIcon, MinusIcon, PlusIcon } from "../Icon";
import Pagination from "./Pagination";
import { formatNumber, convertToKoreanQuantity } from "../utils";
import { OrderContext, AccessibilityContext, ModalContext } from "../contexts";
import { usePageSlicer } from "../hooks";

// 주문 행
const OrderRow = memo(({ item, index, quantity, onDecrease, onIncrease, onDelete, convertToKoreanQuantity, showRowLine = true }) => {
    const totalPrice = item.price * quantity;
    const rowClassName = showRowLine ? "order-row with-line" : "order-row";

    return (
        <>
            <div className={rowClassName} data-tts-text={`주문목록,${index}번, ${item.name}, ${convertToKoreanQuantity(quantity)} 개, ${totalPrice}원,`}>
                <div className="order-image-div">
                    <div className="order-index">{index}</div>
                    <img src={`./images/${item.img}`} alt={item.name} className="order-image" />
                </div>
                <p className="order-name">{item.name}</p>
                <div className="order-quantity">
                    <Button className="secondary1 counter" ttsText="빼기" svg={<MinusIcon />} onClick={onDecrease} />
                    <Button className="qty" label={quantity} />
                    <Button className="secondary1 counter" ttsText="더하기" svg={<PlusIcon />} onClick={onIncrease} />
                </div>
                <Button className="order-price" label={`${formatNumber(totalPrice)}원`} />
                <Button className="delete-item" svg={<DeleteIcon />} onClick={onDelete} ttsText="삭제" />
            </div>
        </>
    );
});
OrderRow.displayName = 'OrderRow';

const OrderList = memo(() => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);

    const {
        pageNumber, totalPages, currentItems,
        handlePrevPage, handleNextPage, itemsPerPage
    } = usePageSlicer(
        order.orderItems,
        accessibility.isLow ? 3 : 6,
        3,
        accessibility.isLow
    );

    const openDeleteModal = (itemId) => {
        modal.setModalDeleteItemId(itemId);
        (order.orderItems.length > 1) ? modal.ModalDelete.open() : modal.ModalDeleteCheck.open();
    };

    const handleItemDecrease = (itemId) => (e, target) => {
        target?.focus?.();
        (order.quantities[itemId] === 1) ? openDeleteModal(itemId) : order.handleDecrease(itemId);
    };

    const handleItemIncrease = (itemId) => (e, target) => {
        target?.focus?.();
        order.handleIncrease(itemId);
    };

    const handleItemDelete = (itemId) => (e, target) => {
        target?.focus?.();
        openDeleteModal(itemId);
    };

    return (
        <>
            <div className="order-list">
                {currentItems && currentItems.length > 0 && currentItems.map((item, i) => (
                    <OrderRow
                        key={item.id}
                        item={item}
                        index={(pageNumber - 1) * itemsPerPage + i + 1}
                        quantity={order.quantities[item.id]}
                        onDecrease={(e, target) => handleItemDecrease(item.id)(e, target)}
                        onIncrease={(e, target) => handleItemIncrease(item.id)(e, target)}
                        onDelete={(e, target) => handleItemDelete(item.id)(e, target)}
                        convertToKoreanQuantity={convertToKoreanQuantity}
                        showRowLine={i < currentItems.length - 1}
                    />
                ))}
            </div>
            <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPrev={(e, target) => { target?.focus?.(); handlePrevPage(); }}
                onNext={(e, target) => { target?.focus?.(); handleNextPage(); }}
                direction={accessibility.isLow ? "vertical" : "horizontal"}
                ttsPrefix="주문목록"
            />
        </>
    );
});
OrderList.displayName = 'OrderList';

export default OrderList;
