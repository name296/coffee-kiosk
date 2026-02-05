import React, { memo, useContext } from "react";
import { ScreenRouteContext } from "../contexts";
import { StepIcon } from "../Icon";

/** 단계 인덱스: ProcessMenu=1, ProcessDetails=2, 결제그룹=3, 완료그룹=4, ProcessFinish=5. CSS .step.1~.5로 상태 제어 */
function getStepIndex(currentProcess) {
    if (currentProcess === 'ProcessMenu') return 1;
    if (currentProcess === 'ProcessDetails') return 2;
    if (['ProcessPayments', 'ProcessCardInsert', 'ProcessMobilePay', 'ProcessSimplePay', 'ProcessCardRemoval'].includes(currentProcess)) return 3;
    if (['ProcessOrderComplete', 'ProcessReceiptPrint'].includes(currentProcess)) return 4;
    if (currentProcess === 'ProcessFinish') return 5;
    return null;
}

/** UI 컴포넌트: 단계 표시(메뉴선택 → 내역확인 → 결제 → 완료). 진행/현재 상태는 .step.1~.5 CSS로 제어. .first 시 CSS display:none */
const Step = memo(() => {
    const { currentProcess } = useContext(ScreenRouteContext);
    const stepIndex = getStepIndex(currentProcess) ?? 0;

    /* 지나간 스텝 = ✓, 현재/미래 스텝 = 숫자 */
    return (
        <div className={`step step-${stepIndex}`}>
            <span className="step-num">{stepIndex > 1 ? "✓" : "1"}</span>
            <span className="step-name">메뉴선택</span>
            <span className="separator icon"><StepIcon /></span>
            <span className="step-num">{stepIndex > 2 ? "✓" : "2"}</span>
            <span className="step-name">내역확인</span>
            <span className="separator icon"><StepIcon /></span>
            <span className="step-num">{stepIndex > 3 ? "✓" : "3"}</span>
            <span className="step-name">결제</span>
            <span className="separator icon"><StepIcon /></span>
            <span className="step-num">{stepIndex > 4 ? "✓" : "4"}</span>
            <span className="step-name">완료</span>
        </div>
    );
});
Step.displayName = 'Step';

export default Step;
