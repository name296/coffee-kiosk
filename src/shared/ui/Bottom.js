import React, { memo, useContext, useCallback } from "react";
import Button from "./Button";
import { HomeIcon, TimeIcon, WheelchairIcon } from "../../Icon";
import { ModalContext, TimeoutContext } from "../contexts";

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
                className="down-footer-button btn-home"
                svg={<HomeIcon />}
                label="시작화면"
                modal="Restart"
            />
            <Button
                className="down-footer-button"
                svg={<TimeIcon />}
                label={timeout?.globalRemainingTimeFormatted || "00:00"}
                onClick={openModalManually}
            />
            <Button className="down-footer-button" svg={<WheelchairIcon />} label="접근성" modal="Accessibility" />
        </div>
    );
});
Bottom.displayName = 'Bottom';

export default Bottom;
