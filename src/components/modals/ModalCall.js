import React, { memo, useContext } from "react";
import { Button } from "@/components";
import Icon from "@/components/Icon";
import { TTS } from "@/constants";
import { ModalContext, RefContext } from "@/contexts";
import { useFocusTrap } from "@/hooks";

const MODAL_TTS = "알림, 직원 호출, 직원을 호출합니다, 실행하시려면 호출 버튼을 누릅니다,";

export const ModalCall = memo(() => {
    const modal = useContext(ModalContext);
    const { refs } = useContext(RefContext);
    const isOpen = modal.ModalCall.isOpen;
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
                    <Icon className="primary" name="GraphicBell" />
                    <span className="primary">직원 호출</span>
                </div>
                <div className="modal-body body2">
                    <div className="modal-message">
                        <span>
                            직원을 <span className="primary">호출</span>합니다
                        </span>
                        <span>
                            실행하시려면 <span className="primary">호출</span> 버튼을 누릅니다
                        </span>
                    </div>
                    <div
                        data-tts-text="작업관리,"
                        ref={refs.Modal.footerButtonsRef}
                        className="task-manager"
                    >
                        <Button className="skel-inline skin-secondary" svg={<Icon name="Cancel" />} label="취소" onClick={() => modal.ModalCall.close({ returnToOpener: true })} />
                        <Button
                            className="skel-inline skin-primary"
                            svg={<Icon name="GraphicBell" />}
                            label="호출"
                            onClick={() => modal.ModalCall.close()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

ModalCall.displayName = "ModalCall";
export default ModalCall;
