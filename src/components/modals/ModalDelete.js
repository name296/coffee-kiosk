import React, { memo, useContext } from "react";
import { Button } from "@/components";
import Icon from "@/components/Icon";
import { TTS } from "@/constants";
import { ModalContext, OrderContext, RefContext } from "@/contexts";
import { useFocusTrap } from "@/hooks";

const TTS_DELETE_CHECK =
    "알림, 주문없음, 주문이 없으면 메뉴선택으로 돌아갑니다, 실행하시려면 메뉴 버튼을 누릅니다, ";
const TTS_DELETE =
    "알림, 상품삭제, 주문 상품을 삭제합니다, 실행하시려면 삭제 버튼을 누릅니다, ";

export const ModalDeleteCheck = memo(() => {
    const modal = useContext(ModalContext);
    const order = useContext(OrderContext);
    const { refs } = useContext(RefContext);
    const id = modal.ModalDeleteItemId;
    const isOpen = modal.ModalDeleteCheck.isOpen;
    const { containerRef } = useFocusTrap(isOpen);

    if (!isOpen) return null;

    return (
        <div className="modal" aria-hidden={!isOpen}>
            <div
                className="modal-panel"
                ref={containerRef}
                data-tts-text={TTS_DELETE_CHECK + TTS.replay}
                tabIndex={0}
            >
                <div className="modal-head body1">
                    <Icon className="primary" name="GraphicWarning" />
                    <span className="primary">주문없음</span>
                </div>
                <div className="modal-body body2">
                    <div className="modal-message">
                        <span>
                            주문이 없으면 <span className="primary">메뉴선택</span>으로 돌아갑니다
                        </span>
                        <span>
                            실행하시려면 <span className="primary">메뉴</span> 버튼을 누릅니다
                        </span>
                    </div>
                    <div
                        data-tts-text="작업관리,"
                        ref={refs.Modal.footerButtonsRef}
                        className="task-manager"
                    >
                        <Button className="skel-inline skin-secondary" svg={<Icon name="Cancel" />} label="취소" onClick={() => modal.ModalDeleteCheck.close({ returnToOpener: true })} />
                        <Button
                            className="skel-inline skin-primary"
                            svg={<Icon name="Add" />}
                            label="메뉴"
                            onClick={() => {
                                order?.handleDelete?.(id);
                                modal.ModalDeleteCheck.close();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
ModalDeleteCheck.displayName = "ModalDeleteCheck";

export const ModalDelete = memo(() => {
    const modal = useContext(ModalContext);
    const order = useContext(OrderContext);
    const { refs } = useContext(RefContext);
    const id = modal.ModalDeleteItemId;
    const isOpen = modal.ModalDelete.isOpen;
    const { containerRef } = useFocusTrap(isOpen);

    if (!isOpen) return null;

    return (
        <div className="modal" aria-hidden={!isOpen}>
            <div
                className="modal-panel"
                ref={containerRef}
                data-tts-text={TTS_DELETE + TTS.replay}
                tabIndex={0}
            >
                <div className="modal-head body1">
                    <Icon className="primary" name="GraphicTrash" />
                    <span className="primary">삭제</span>
                </div>
                <div className="modal-body body2">
                    <div className="modal-message">
                        <span>
                            주문 상품을 <span className="primary">삭제</span>합니다
                        </span>
                        <span>
                            실행하시려면 <span className="primary">삭제</span> 버튼을 누릅니다
                        </span>
                    </div>
                    <div
                        data-tts-text="작업관리,"
                        ref={refs.Modal.footerButtonsRef}
                        className="task-manager"
                    >
                        <Button className="skel-inline skin-secondary" svg={<Icon name="Cancel" />} label="취소" onClick={() => modal.ModalDelete.close({ returnToOpener: true })} />
                        <Button
                            className="skel-inline skin-primary"
                            svg={<Icon name="Delete" />}
                            label="삭제"
                            onClick={() => {
                                order?.handleDelete?.(id);
                                modal.ModalDelete.close();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
ModalDelete.displayName = "ModalDelete";
