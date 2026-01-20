import React, { memo, useContext } from "react";
import { BaseModal } from "../../ui/Modal";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { OrderContext } from "../../../contexts/OrderContext";

// 삭제 확인 모달 (DeleteCheck - 내역 없음)
export const DeleteCheckModal = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);
    const id = accessibility.ModalDeleteItemId;

    return (
        <BaseModal
            isOpen={accessibility.ModalDeleteCheck.isOpen}
            type="deleteCheck"
            onCancel={() => accessibility.ModalDeleteCheck.close()}
            onConfirm={() => {
                order?.handleDelete?.(id);
                accessibility.ModalDeleteCheck.close();
            }}
        />
    );
});
DeleteCheckModal.displayName = 'DeleteCheckModal';

// 삭제 모달 (Delete - 실제 삭제)
export const DeleteModal = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);
    const id = accessibility.ModalDeleteItemId;

    return (
        <BaseModal
            isOpen={accessibility.ModalDelete.isOpen}
            type="delete"
            onCancel={() => accessibility.ModalDelete.close()}
            onConfirm={() => {
                order?.handleDelete?.(id);
                accessibility.ModalDelete.close();
            }}
        />
    );
});
DeleteModal.displayName = 'DeleteModal';
