import React, { memo, useContext, useCallback } from "react";
import Button from "./Button";
import { HomeIcon, TimeIcon, WheelchairIcon } from "../Icon";
import { ModalContext, TimeoutContext } from "../contexts";

/** UI 컴포넌트: 하단 시스템 버튼(시작화면, 타임아웃, 접근성) */
const Bottom = memo(({ systemControlsRef }) => {
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);

    const openModalManually = useCallback(() => {
        if (modal?.ModalTimeout) {
            modal.ModalTimeout.open();
        }
    }, [modal]);

    return (
        <div className="bottom" data-tts-text="시스템 설정, 버튼 세 개," ref={systemControlsRef}>
            <Button
                svg={<HomeIcon />}
                label="시작화면"
                modal="Restart"
            />
            <Button
                svg={<TimeIcon />}
                label={timeout?.globalRemainingTimeFormatted || "00:00"}
                modal="Timeout"
            />
            <Button
                svg={<WheelchairIcon />}
                label="접근성"
                modal="Accessibility" />
        </div>
    );
});
Bottom.displayName = 'Bottom';

export default Bottom;
