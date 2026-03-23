import React, { memo, useContext, useEffect, useRef } from "react";
import Button from "@/components/Button";
import { DeleteIcon, MinusIcon, PlusIcon } from "@/components/Icon";
import { formatNumber, convertToKoreanQuantity, convertToKoreanOrdinal } from "@/lib";
import { OrderContext, ModalContext, ScreenRouteContext, AccessibilityContext } from "@/contexts";
import { PROCESS_NAME } from "@/constants";
import { useTextHandler } from "@/hooks";

// 주문 행
const OrderRow = memo(({ item, index, quantity, onDecrease, onIncrease, onDelete, convertToKoreanQuantity, convertToKoreanOrdinal }) => {
    const totalPrice = item.price * quantity;
    const rowTtsText = `${convertToKoreanOrdinal(index)}번 목록, ${item.name}, ${convertToKoreanQuantity(quantity)} 개, ${totalPrice}원,`;

    return (
        <>
            <div className="order-row">
                <div className="order-item body2">
                    <div className="order-index body1">{index}</div>
                    <img src={`images/${item.img}`} alt={item.name} className="order-image" />
                </div>
                <span className="button-like skel-inline skin-neutral order-name" tabIndex={0} data-tts-text={rowTtsText}>
                    <span className="order-name__text">{item.name}</span>
                </span>
                <div className="order-quantity" data-tts-text='수량조절,'>
                    <Button className="skel-inline skin-secondary counter" ttsText="빼기" svg={<MinusIcon />} onClick={onDecrease} />
                    <span className="button-like skel-inline skin-neutral qty" tabIndex={0} data-tts-text={`${formatNumber(quantity)}개`}>
                        {quantity}
                    </span>
                    <Button className="skel-inline skin-secondary counter" ttsText="더하기" svg={<PlusIcon />} onClick={onIncrease} />
                </div>
                <span className="button-like skel-inline order-price skin-neutral" tabIndex={0} data-tts-text={`${formatNumber(totalPrice)}원`}>
                    {`${formatNumber(totalPrice)}원`}
                </span>
                <Button className="skel-inline skin-danger" svg={<DeleteIcon />} onClick={onDelete} ttsText="삭제" />
            </div>
        </>
    );
});
OrderRow.displayName = 'OrderRow';

const OrderList = memo(({ currentItems = [], startIndex = 0 } = {}) => {
    const order = useContext(OrderContext);
    const modal = useContext(ModalContext);
    const { currentProcess } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);
    const quantitiesRef = useRef(order.quantities);

    useEffect(() => {
        quantitiesRef.current = order.quantities;
    }, [order.quantities]);

    const openDeleteModal = (itemId) => {
        modal.setModalDeleteItemId(itemId);
        const isLastItem = order.orderItems.length === 1;
        const isMenuProcess = currentProcess === PROCESS_NAME.MENU;

        if (isMenuProcess) {
            modal.ModalDelete.open();
        } else {
            isLastItem ? modal.ModalDeleteCheck.open() : modal.ModalDelete.open();
        }
    };

    const handleItemDecrease = (item) => (e, target) => {
        const itemId = item.id;
        const current = quantitiesRef.current[itemId] ?? 0;
        if (current === 1) {
            openDeleteModal(itemId);
            return;
        }
        if (current <= 0) return;
        const nextQty = current - 1;
        quantitiesRef.current = { ...quantitiesRef.current, [itemId]: nextQty };
        order.handleDecrease(itemId);
        const lineTotal = item.price * nextQty;
        handleText(`${convertToKoreanQuantity(nextQty)} 개, ${formatNumber(lineTotal)}원,`, false);
    };

    const handleItemIncrease = (item) => (e, target) => {
        const itemId = item.id;
        const current = quantitiesRef.current[itemId] ?? 0;
        const nextQty = current + 1;
        quantitiesRef.current = { ...quantitiesRef.current, [itemId]: nextQty };
        order.handleIncrease(itemId);
        const lineTotal = item.price * nextQty;
        handleText(`${convertToKoreanQuantity(nextQty)} 개, ${formatNumber(lineTotal)}원,`, false);
    };

    const handleItemDelete = (itemId) => (e, target) => {
        openDeleteModal(itemId);
    };

    return (
        <div className="order-list">
            {currentItems && currentItems.length > 0 && currentItems.map((item, i) => (
                <OrderRow
                    key={item.id}
                    item={item}
                    index={startIndex + i + 1}
                    quantity={order.quantities[item.id]}
                    onDecrease={(e, target) => handleItemDecrease(item)(e, target)}
                    onIncrease={(e, target) => handleItemIncrease(item)(e, target)}
                    onDelete={(e, target) => handleItemDelete(item.id)(e, target)}
                    convertToKoreanQuantity={convertToKoreanQuantity}
                    convertToKoreanOrdinal={convertToKoreanOrdinal}
                />
            ))}
        </div>
    );
});
OrderList.displayName = 'OrderList';

export default OrderList;
