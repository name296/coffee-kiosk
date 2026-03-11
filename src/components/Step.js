import React, { memo, useContext } from "react";
import { ScreenRouteContext } from "../contexts";
import { STEP_INDEX_BY_PROCESS } from "../constants";
import { StepIcon } from "../Icon";

/** 단계 인덱스: ProcessMenu=1, ProcessDetails=2, 결제그룹=3, 완료그룹=4, ProcessFinish=5 */
function getStepIndex(currentProcess) {
    return STEP_INDEX_BY_PROCESS[currentProcess] ?? null;
}

const STEP_MODIFIER = { 1: "menu", 2: "detail", 3: "pay", 4: "complete", 5: "finish" };

/** UI 컴포넌트: 단계 표시(메뉴선택 → 내역확인 → 결제 → 완료). 진행/현재 상태는 .step.menu|detail|pay|complete|finish CSS로 제어 */
const Step = memo(() => {
    const { currentProcess } = useContext(ScreenRouteContext);
    const stepIndex = getStepIndex(currentProcess) ?? 0;
    const modifier = STEP_MODIFIER[stepIndex] ?? "menu";

    /* 지나간 스텝 = ✓, 현재/미래 스텝 = 숫자 */
    return (
        <div className={`step ${modifier}`}>
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
