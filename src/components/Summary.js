import React, { memo, useContext } from "react";
import Button from "./Button";
import { OrderIcon, ResetIcon, AddIcon, PayIcon } from "../Icon";
import { PROCESS_NAME } from "../constants";
import { OrderContext, ScreenRouteContext } from "../contexts";
import { formatNumber, convertToKoreanQuantity } from "../utils";

const Summary = memo(() => {
    const order = useContext(OrderContext);
    const { currentProcess } = useContext(ScreenRouteContext);
    const totalCount = order?.totalCount || 0;
    const totalSum = order?.totalSum || 0;
    const isDisabledBtn = totalCount <= 0;

    const summaryTtsText = `주문요약, 주문수량, ${convertToKoreanQuantity(totalCount)} 개, 주문금액, ${formatNumber(totalSum)}원, 버튼 두개,`;

    return (
        <div className="summary">
            {/* 수량/금액 표시 영역 */}
            <div className="summary-content">
                <span className="summary-text">수량</span>
                <span className="summary-count num primary">{totalCount}개</span>
                <span className="summary-line">|</span>
                <span className="summary-text">금액</span>
                <span className="summary-count price primary">{formatNumber(totalSum)}원</span>
            </div>

            {/* 버튼 영역 */}
            <div className="task-manager" data-tts-text={summaryTtsText}>
                {currentProcess === PROCESS_NAME.MENU && (
                    <>
                        <Button
                            svg={<ResetIcon />}
                            label="비우기"
                            modal="Reselect"
                            disabled={isDisabledBtn}
                        />
                        <Button
                            className="primary1"
                            svg={<OrderIcon />}
                            label="주문"
                            disabled={isDisabledBtn}
                            navigate={PROCESS_NAME.DETAILS}
                        />
                    </>
                )}
                {currentProcess === PROCESS_NAME.DETAILS && (
                    <>
                        <Button
                            svg={<AddIcon />}
                            label="메뉴"
                            navigate={PROCESS_NAME.MENU}
                        />
                        <Button
                            className="primary1"
                            svg={<PayIcon />}
                            label="결제"
                            navigate={PROCESS_NAME.PAYMENTS}
                        />
                    </>
                )}
            </div>
        </div>
    );
});
Summary.displayName = 'Summary';

export default Summary;
