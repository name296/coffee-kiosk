import React, { memo } from "react";
import { Button } from "@shared/ui";
import { DeleteIcon, MinusIcon, PlusIcon } from "../../../Icon";
import { formatNumber, convertToKoreanQuantity } from "@shared/utils";

// 주문 행
const OrderRow = memo(({ item, index, quantity, onDecrease, onIncrease, onDelete, sectionRef, convertToKoreanQuantity }) => {
    const totalPrice = item.price * quantity;

    return (
        <>
            <div className="order-row" ref={sectionRef} data-tts-text={`주문목록,${index}번, ${item.name}, ${convertToKoreanQuantity(quantity)} 개, ${totalPrice}원, 버튼 세 개, `}>
                <div className="order-image-div">
                    <div className="order-index">{index}</div>
                    <img src={`./images/${item.img}`} alt={item.name} className="order-image" />
                </div>
                <p className="order-name">{item.name}</p>
                <div className="order-quantity">
                    <Button className="w080h076 secondary1" ttsText="빼기" svg={<MinusIcon />} onClick={onDecrease} />
                    <Button className="qty" label={quantity} />
                    <Button className="w080h076 secondary1" ttsText="더하기" svg={<PlusIcon />} onClick={onIncrease} />
                </div>
                <Button className="order-price" label={`${formatNumber(totalPrice)}원`} />
                <Button className="w076h076 delete-item" svg={<DeleteIcon />} onClick={onDelete} ttsText="삭제" />
            </div>
            <div className="row-line" />
        </>
    );
});
OrderRow.displayName = 'OrderRow';

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
