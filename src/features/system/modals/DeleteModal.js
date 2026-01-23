import React, { memo, useContext } from "react";
import { BaseModal } from "@shared/ui";
import { ModalContext, OrderContext } from "@shared/contexts";

// 삭제 확인 모달 (DeleteCheck - 내역 없음)
export const DeleteCheckModal = memo(() => {
    const modal = useContext(ModalContext);
    const order = useContext(OrderContext);
    const id = modal.ModalDeleteItemId;

    return (
        <BaseModal
            isOpen={modal.ModalDeleteCheck.isOpen}
            type="deleteCheck"
            onCancel={() => modal.ModalDeleteCheck.close()}
            onConfirm={() => {
                order?.handleDelete?.(id);
                modal.ModalDeleteCheck.close();
            }}
        />
    );
});
DeleteCheckModal.displayName = 'DeleteCheckModal';

// 삭제 모달 (Delete - 실제 삭제)
export const DeleteModal = memo(() => {
    const modal = useContext(ModalContext);
    const order = useContext(OrderContext);
    const id = modal.ModalDeleteItemId;

    return (
        <BaseModal
            isOpen={modal.ModalDelete.isOpen}
            type="delete"
            onCancel={() => modal.ModalDelete.close()}
            onConfirm={() => {
                order?.handleDelete?.(id);
                modal.ModalDelete.close();
            }}
        />
    );
});
DeleteModal.displayName = 'DeleteModal';
