import React, { memo, useContext } from "react";
import { BaseModal } from "./Modal";
import { ModalContext, OrderContext } from "../contexts";

// 삭제 확인 모달 (DeleteCheck - 내역 없음)
export const ModalDeleteCheck = memo(() => {
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
ModalDeleteCheck.displayName = 'ModalDeleteCheck';

// 삭제 모달 (Delete - 실제 삭제)
export const ModalDelete = memo(() => {
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
ModalDelete.displayName = 'ModalDelete';
