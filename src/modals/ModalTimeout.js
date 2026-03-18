import React, { memo, useContext } from "react";
import { Button } from "../components";
import Icon from "../Icon";
import { PROCESS_NAME, TTS } from "../constants";
import { ModalContext, RefContext, ScreenRouteContext, TimeoutContext } from "../contexts";
import { useFocusTrap } from "../hooks";

const MODAL_TTS =
    "알림, 시간연장, 사용시간이 20초 남았습니다, 계속 사용하시려면 연장 버튼을 누릅니다, ";

export const ModalTimeout = memo(() => {
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);
    const { navigateTo } = useContext(ScreenRouteContext);
    const { refs } = useContext(RefContext);
    const isOpen = modal.ModalTimeout.isOpen;
    const { containerRef } = useFocusTrap(isOpen);
    const countdown = timeout?.globalRemainingTime;
    const secText =
        countdown !== undefined ? `${Math.ceil(countdown / 1000)}초` : "20초";

    if (!isOpen) return null;

    return (
        <div className="modal" aria-hidden={!isOpen}>
            <div
                className="modal-panel"
                ref={containerRef}
                data-tts-text={MODAL_TTS + TTS.replay}
                tabIndex={-1}
            >
                <div className="modal-head body1">
                    <Icon className="primary" name="Extention" />
                    <span className="primary">시간연장</span>
                </div>
                <div className="modal-body body2">
                    <div className="modal-message">
                        <span>
                            사용시간이 <span className="primary">{secText}</span> 남았습니다
                        </span>
                        <span>
                            계속 사용하시려면 <span className="primary">연장</span> 버튼을 누릅니다
                        </span>
                    </div>
                    <div
                        data-tts-text="작업관리,"
                        ref={refs.Modal.footerButtonsRef}
                        className="task-manager"
                    >
                        <Button
                            className="skel-inline skin-secondary"
                            svg={<Icon name="Home" />}
                            label="시작화면"
                            onClick={() => {
                                modal.ModalTimeout.close();
                                navigateTo(PROCESS_NAME.START);
                            }}
                        />
                        <Button
                            className="skel-inline skin-primary"
                            svg={<Icon name="Extention" />}
                            label="연장"
                            onClick={() => {
                                modal.ModalTimeout.close();
                                timeout?.resetIdleTimeout?.();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

ModalTimeout.displayName = "ModalTimeout";
export default ModalTimeout;
