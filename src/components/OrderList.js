import React, { memo, useContext } from "react";
import Button from "@/components/Button";
import { DeleteIcon, MinusIcon, PlusIcon } from "@/components/Icon";
import { formatNumber, convertToKoreanQuantity } from "@/lib";
import { OrderContext, ModalContext, ScreenRouteContext } from "@/contexts";
import { PROCESS_NAME } from "@/constants";

// 주문 행
const OrderRow = memo(({ item, index, quantity, onDecrease, onIncrease, onDelete, convertToKoreanQuantity }) => {
    const totalPrice = item.price * quantity;

    return (
        <>
            <div className="order-row" data-tts-text={`주문목록,${index}번, ${item.name}, ${convertToKoreanQuantity(quantity)} 개, ${totalPrice}원,`}>
                <div className="order-item body2">
                    <div className="order-index body1">{index}</div>
                    <img src={`images/${item.img}`} alt={item.name} className="order-image" />
                </div>
                <span className="order-name">{item.name}</span>
                <div className="order-quantity">
                    <Button className="skel-inline skin-secondary counter" ttsText="빼기" svg={<MinusIcon />} onClick={onDecrease} />
                    <Button className="skel-inline skin-neutral qty" label={quantity} ttsText={`${formatNumber(quantity)}개`}></Button>
                    <Button className="skel-inline skin-secondary counter" ttsText="더하기" svg={<PlusIcon />} onClick={onIncrease} />
                </div>
                <span className="order-price">{`${formatNumber(totalPrice)}원`}</span>
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

    const handleItemDecrease = (itemId) => (e, target) => {
        (order.quantities[itemId] === 1) ? openDeleteModal(itemId) : order.handleDecrease(itemId);
    };

    const handleItemIncrease = (itemId) => (e, target) => {
        order.handleIncrease(itemId);
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
                    onDecrease={(e, target) => handleItemDecrease(item.id)(e, target)}
                    onIncrease={(e, target) => handleItemIncrease(item.id)(e, target)}
                    onDelete={(e, target) => handleItemDelete(item.id)(e, target)}
                    convertToKoreanQuantity={convertToKoreanQuantity}
                />
            ))}
        </div>
    );
});
OrderList.displayName = 'OrderList';

export default OrderList;
