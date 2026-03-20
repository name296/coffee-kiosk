import React, { memo, useContext } from "react";
import { Button } from "@/components";
import Icon from "@/components/Icon";
import { TTS } from "@/constants";
import { ModalContext, RefContext } from "@/contexts";
import { useFocusTrap } from "@/hooks";

const MODAL_TTS =
    "알림, 결제 경고, 카드가 잘못 삽입되었습니다, 카드를 제거하시고 다시 결제 버튼을 누릅니다, ";

export const ModalPaymentError = memo(() => {
    const modal = useContext(ModalContext);
    const { refs } = useContext(RefContext);
    const isOpen = modal.ModalPaymentError.isOpen;
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
                    <Icon className="primary" name="GraphicWarning" />
                    <span className="primary">결제 경고</span>
                </div>
                <div className="modal-body body2">
                    <div className="modal-message">
                        <span>
                            카드가 <span className="primary">잘못 삽입</span>되었습니다
                        </span>
                        <span>
                            카드를 제거하시고 <span className="primary">다시 결제</span> 버튼을 누릅니다
                        </span>
                    </div>
                    <div
                        data-tts-text="작업관리,"
                        ref={refs.Modal.footerButtonsRef}
                        className="task-manager"
                    >
                        <Button
                            className="skel-inline skin-danger"
                            svg={<Icon name="Warning" />}
                            label="다시 결제"
                            onClick={() => modal.ModalPaymentError.close()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

ModalPaymentError.displayName = "ModalPaymentError";
export default ModalPaymentError;
