import React, { memo } from "react";
import Button from "./Button";
import { DeleteIcon } from "../../Icon"; // Need to ensure Icon export DeleteIcon
import { formatNumber, convertToKoreanQuantity } from "../../utils/format";

// 주문 행
export const OrderRow = memo(({ item, index, quantity, onDecrease, onIncrease, onDelete, sectionRef, convertToKoreanQuantity }) => {
    const totalPrice = item.price * quantity;

    return (
        <>
            <div
                className="order-row"
                ref={sectionRef}
                data-tts-text={`주문목록,${index}번, ${item.name}, ${convertToKoreanQuantity(quantity)} 개, ${totalPrice}원, 버튼 세 개, `}
            >
                <div className="order-image-div">
                    <div className="order-index">{index}</div>
                    <img src={`./images/${item.img}`} alt={item.name} className="order-image" />
                </div>
                
                <p className="order-name">{item.name}</p>

                <div className="order-quantity">
                    <Button className="w080h076 secondary1" ttsText="수량 빼기" label="-" onClick={onDecrease} />
                    <span className="qty">{quantity}</span>
                    <Button className="w080h076 secondary1" ttsText="수량 더하기" label="+" onClick={onIncrease} />
                </div>
                
                <span className="order-price">{formatNumber(totalPrice)}원</span>
                
                <Button className="w076h076 delete-item" svg={<DeleteIcon />} onClick={onDelete} ttsText="삭제" />
            </div>
            <div className="row-line" />
        </>
    );
});
OrderRow.displayName = 'OrderRow';

export default OrderRow;
