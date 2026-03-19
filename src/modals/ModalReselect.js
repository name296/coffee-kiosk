import React, { memo, useContext } from "react";
import { Button } from "../components";
import Icon from "../Icon";
import { TTS } from "../constants";
import { ModalContext, OrderContext, RefContext } from "../contexts";
import { useFocusTrap } from "../hooks";

const MODAL_TTS = "알림, 비움, 주문 내역을 비웁니다, 실행하시려면 비움 버튼을 누릅니다, ";

export const ModalReselect = memo(() => {
    const modal = useContext(ModalContext);
    const order = useContext(OrderContext);
    const { refs } = useContext(RefContext);
    const isOpen = modal.ModalReselect.isOpen;
    const { containerRef } = useFocusTrap(isOpen);

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
                    <Icon className="primary" name="GraphicReset" />
                    <span className="primary">비움</span>
                </div>
                <div className="modal-body body2">
                    <div className="modal-message">
                        <span>
                            주문 내역을 <span className="primary">비웁니다</span>
                        </span>
                        <span>
                            실행하시려면 <span className="primary">비움</span> 버튼을 누릅니다
                        </span>
                    </div>
                    <div
                        data-tts-text="작업관리,"
                        ref={refs.Modal.footerButtonsRef}
                        className="task-manager"
                    >
                        <Button className="skel-inline skin-secondary" svg={<Icon name="Cancel" />} label="취소" onClick={() => modal.ModalReselect.close()} />
                        <Button
                            className="skel-inline skin-primary"
                            svg={<Icon name="Reset" />}
                            label="비움"
                            onClick={() => {
                                modal.ModalReselect.close();
                                order?.setQuantities?.({});
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

ModalReselect.displayName = "ModalReselect";
export default ModalReselect;
