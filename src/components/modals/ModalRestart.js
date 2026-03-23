import React, { memo, useContext } from "react";
import { Button } from "@/components";
import Icon from "@/components/Icon";
import { PROCESS_NAME, TTS } from "@/constants";
import { ModalContext, RefContext, ScreenRouteContext } from "@/contexts";
import { useFocusTrap } from "@/hooks";

const MODAL_TTS = "알림, 홈, 홈으로 이동합니다, 실행하시려면 홈 버튼을 누릅니다,";

export const ModalRestart = memo(() => {
    const modal = useContext(ModalContext);
    const { navigateTo } = useContext(ScreenRouteContext);
    const { refs } = useContext(RefContext);
    const isOpen = modal.ModalRestart.isOpen;
    const { containerRef } = useFocusTrap(isOpen);

    if (!isOpen) return null;

    return (
        <div className="modal" aria-hidden={!isOpen}>
            <div
                className="modal-panel"
                ref={containerRef}
                data-tts-text={MODAL_TTS + TTS.replay}
                tabIndex={0}
            >
                <div className="modal-head body1">
                    <Icon className="primary" name="GraphicHome" />
                    <span className="primary">홈</span>
                </div>
                <div className="modal-body body2">
                    <div className="modal-message">
                        <span>
                            <span className="primary">홈</span>으로 이동합니다
                        </span>
                        <span>
                            실행하시려면 <span className="primary">홈</span> 버튼을 누릅니다
                        </span>
                    </div>
                    <div
                        data-tts-text="작업관리,"
                        ref={refs.Modal.footerButtonsRef}
                        className="task-manager"
                    >
                        <Button className="skel-inline skin-secondary" svg={<Icon name="Cancel" />} label="취소" onClick={() => modal.ModalRestart.close()} />
                        <Button
                            className="skel-inline skin-primary"
                            svg={<Icon name="Home" />}
                            label="홈"
                            onClick={() => {
                                modal.ModalRestart.close();
                                navigateTo(PROCESS_NAME.START);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

ModalRestart.displayName = "ModalRestart";
export default ModalRestart;
