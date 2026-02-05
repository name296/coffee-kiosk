import React, { memo, useContext, useState, useEffect } from "react";
import Button from "./Button";
import { OrderIcon, ResetIcon, AddIcon, PayIcon } from "../Icon";
import { OrderContext, ScreenRouteContext } from "../contexts";
import { formatNumber, convertToKoreanQuantity } from "../utils";

const Summary = memo(({ orderSummaryRef }) => {
    const order = useContext(OrderContext);
    const { currentProcess } = useContext(ScreenRouteContext);
    const totalCount = order?.totalCount || 0;
    const totalSum = order?.totalSum || 0;

    const [isDisabledBtn, setIsDisabledBtn] = useState(true);

    useEffect(() => {
        setIsDisabledBtn(totalCount <= 0);
    }, [totalCount]);

    const summaryTtsText = `주문요약, 주문수량, ${convertToKoreanQuantity(totalCount)} 개, 주문금액, ${formatNumber(totalSum)}원, 버튼 두개,`;

    return (
        <div className="summary">
            {/* 수량/금액 표시 영역 */}
            <div className="task-manager">
                <p className="summary-label">수량</p>
                <p className="summary-text">{totalCount}개</p>
                <div className="short-colline" />
                <p className="summary-label">금액</p>
                <p className="summary-text">{formatNumber(totalSum)}원</p>
            </div>

            {/* 버튼 영역 */}
            <div className="task-manager" ref={orderSummaryRef} data-tts-text={summaryTtsText}>
                {currentProcess === 'ProcessMenu' && (
                    <>
                        <Button
                            svg={<ResetIcon className="summary-btn-icon" />}
                            label="초기화"
                            modal="Reset"
                            disabled={isDisabledBtn}
                        />
                        <Button
                            className="primary1"
                            svg={<OrderIcon className="summary-btn-icon" />}
                            label="주문"
                            disabled={isDisabledBtn}
                            navigate="ProcessDetails"
                        />
                    </>
                )}
                {currentProcess === 'ProcessDetails' && (
                    <>
                        <Button
                            svg={<AddIcon className="summary-btn-icon" />}
                            label="메뉴"
                            navigate="ProcessMenu"
                        />
                        <Button
                            className="primary1"
                            svg={<PayIcon className="summary-btn-icon" />}
                            label="결제"
                            navigate="ProcessPayments"
                        />
                    </>
                )}
            </div>
        </div>
    );
});
Summary.displayName = 'Summary';

export default Summary;
