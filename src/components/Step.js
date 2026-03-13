import React, { memo, useContext } from "react";
import { ScreenRouteContext } from "../contexts";
import { STEP_INDEX_BY_PROCESS } from "../constants";
import { StepIcon } from "../Icon";

/** 단계 인덱스: ProcessMenu=1, ProcessDetails=2, 결제그룹=3, 완료그룹=4, ProcessFinish=5 */
function getStepIndex(currentProcess) {
    return STEP_INDEX_BY_PROCESS[currentProcess] ?? null;
}

/** .num 상태: current clear(완료) | current(현재) | clear(미래) */
function numState(stepIndex, i) {
    if (stepIndex > i) return "current clear";
    if (stepIndex === i) return "current";
    return "clear";
}

/** .name / .separator: 현재이거나 지나감이면 current만 (clear 없음) */
function nameState(stepIndex, i) {
    return stepIndex >= i ? "current" : "";
}
function sepState(stepIndex, afterStep) {
    return stepIndex >= afterStep ? "current" : "";
}

/** UI 컴포넌트: 단계 표시(메뉴선택 → 내역확인 → 결제 → 완료). .num/.name/.separator 상태(current|clear) 로 제어 */
const Step = memo(() => {
    const { currentProcess } = useContext(ScreenRouteContext);
    const stepIndex = getStepIndex(currentProcess) ?? 1;

    return (
        <div className="step">
            <span className={`num ${numState(stepIndex, 1)}`}>{stepIndex > 1 ? "✓" : "1"}</span>
            <span className={`name ${nameState(stepIndex, 1)}`}>메뉴선택</span>
            <span className={`separator icon ${sepState(stepIndex, 1)}`}><StepIcon /></span>
            <span className={`num ${numState(stepIndex, 2)}`}>{stepIndex > 2 ? "✓" : "2"}</span>
            <span className={`name ${nameState(stepIndex, 2)}`}>내역확인</span>
            <span className={`separator icon ${sepState(stepIndex, 2)}`}><StepIcon /></span>
            <span className={`num ${numState(stepIndex, 3)}`}>{stepIndex > 3 ? "✓" : "3"}</span>
            <span className={`name ${nameState(stepIndex, 3)}`}>결제</span>
            <span className={`separator icon ${sepState(stepIndex, 3)}`}><StepIcon /></span>
            <span className={`num ${numState(stepIndex, 4)}`}>{stepIndex > 4 ? "✓" : "4"}</span>
            <span className={`name ${nameState(stepIndex, 4)}`}>완료</span>
        </div>
    );
});
Step.displayName = 'Step';

export default Step;
