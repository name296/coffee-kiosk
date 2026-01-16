import React, { memo, useContext } from "react";
import { ScreenRouteContext } from "../../contexts/ScreenRouteContext";
import { StepIcon } from "../../Icon";

// 단계 표시 아이템 컴포넌트
const Step1 = () => (
    <div className="step">
        <span className="step-num progress current">✓</span>
        <span className="step-name progress">메뉴선택</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num">2</span>
        <span className="step-name">내역확인</span>
        <span className="separator icon"><StepIcon /></span>
        <span className="step-num">3</span>
        <span className="step-name">결제</span>
        <span className="separator icon"><StepIcon /></span>
        <span className="step-num">4</span>
        <span className="step-name">완료</span>
    </div>
);

const Step2 = () => (
    <div className="step">
        <span className="step-num progress">✓</span>
        <span className="step-name progress">메뉴선택</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress current">2</span>
        <span className="step-name progress">내역확인</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num">3</span>
        <span className="step-name">결제</span>
        <span className="separator icon"><StepIcon /></span>
        <span className="step-num">4</span>
        <span className="step-name">완료</span>
    </div>
);

const Step3 = () => (
    <div className="step">
        <span className="step-num progress">✓</span>
        <span className="step-name progress">메뉴선택</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress">✓</span>
        <span className="step-name progress">내역확인</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress current">3</span>
        <span className="step-name progress">결제</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num">4</span>
        <span className="step-name">완료</span>
    </div>
);

const Step4 = () => (
    <div className="step">
        <span className="step-num progress">✓</span>
        <span className="step-name progress">메뉴선택</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress">✓</span>
        <span className="step-name progress">내역확인</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress">✓</span>
        <span className="step-name progress">결제</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress current">4</span>
        <span className="step-name progress">완료</span>
    </div>
);

const Step5 = () => (
    <div className="step">
        <span className="step-num progress">✓</span>
        <span className="step-name progress">메뉴선택</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress">✓</span>
        <span className="step-name progress">내역확인</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress">✓</span>
        <span className="step-name progress">결제</span>
        <span className="separator progress icon"><StepIcon /></span>
        <span className="step-num progress">✓</span>
        <span className="step-name progress">완료</span>
    </div>
);

const Step = memo(() => {
    const route = useContext(ScreenRouteContext);
    const currentPage = route?.currentPage || 'ScreenStart';

    if (currentPage === 'ScreenMenu') {
        return <Step1 />;
    }

    if (currentPage === 'ScreenDetails') {
        return <Step2 />;
    }

    if (['ScreenPayments', 'ScreenCardInsert', 'ScreenMobilePay', 'ScreenSimplePay', 'ScreenCardRemoval'].includes(currentPage)) {
        return <Step3 />;
    }

    if (['ScreenOrderComplete', 'ScreenReceiptPrint'].includes(currentPage)) {
        return <Step4 />;
    }

    if (currentPage === 'ScreenFinish') {
        return <Step5 />;
    }

    return null;
});
Step.displayName = 'Step';

export default Step;
