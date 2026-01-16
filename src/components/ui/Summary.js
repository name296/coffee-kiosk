import React, { memo, useContext, useState, useEffect } from "react";
import Button from "./Button";
import { OrderIcon, ResetIcon, AddIcon, PayIcon } from "../../Icon";
import { OrderContext } from "../../contexts/OrderContext";
import { ScreenRouteContext } from "../../contexts/ScreenRouteContext";
import { formatNumber, convertToKoreanQuantity } from "../../utils/format";

const Summary = memo(({ orderSummaryRef }) => {
    const order = useContext(OrderContext);
    const route = useContext(ScreenRouteContext);
    const totalCount = order?.totalCount || 0;
    const totalSum = order?.totalSum || 0;
    const currentPage = route?.currentPage || 'ScreenStart';

    const [isDisabledBtn, setIsDisabledBtn] = useState(true);

    useEffect(() => {
        setIsDisabledBtn(totalCount <= 0);
    }, [totalCount]);

    // 메뉴선택/내역확인 페이지에서만 표시
    if (currentPage !== 'ScreenMenu' && currentPage !== 'ScreenDetails') {
        return null;
    }

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
                {currentPage === 'ScreenMenu' && (
                    <>
                        <Button
                            className="w199h090"
                            svg={<ResetIcon className="summary-btn-icon" />}
                            label="초기화"
                            actionType="modal"
                            actionTarget="Reset"
                        />
                        <Button
                            className="w199h090 primary1"
                            svg={<OrderIcon className="summary-btn-icon" />}
                            label="주문"
                            disabled={isDisabledBtn}
                            actionType="navigate"
                            actionTarget="ScreenDetails"
                        />
                    </>
                )}
                {currentPage === 'ScreenDetails' && (
                    <>
                        <Button
                            className="w199h090"
                            svg={<AddIcon className="summary-btn-icon" />}
                            label="추가"
                            actionType="navigate"
                            actionTarget="ScreenMenu"
                        />
                        <Button
                            className="w199h090 primary1"
                            svg={<PayIcon className="summary-btn-icon" />}
                            label="결제"
                            actionType="navigate"
                            actionTarget="ScreenPayments"
                        />
                    </>
                )}
            </div>
        </div>
    );
});
Summary.displayName = 'Summary';

export default Summary;
