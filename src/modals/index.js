/**
 * 모달: 전역 모달 프레임 + 개별 모달
 * - ModalConfig(모달 콘피그)가 타입별 아이콘·문구·버튼 매핑
 * - 네이밍: Modal + 타입 (ModalAccessibility, ModalCall 등)
 */
export { Modal, BaseModal } from "./Modal";
export { default as MODAL_CONFIG } from "./ModalConfig";
export { default as ModalAccessibility } from "./ModalAccessibility";
export { default as ModalPaymentError } from "./ModalPaymentError";
export { default as ModalCall } from "./ModalCall";
export { ModalDelete, ModalDeleteCheck } from "./ModalDelete";
export { default as ModalReset } from "./ModalReset";
export { default as ModalRestart } from "./ModalRestart";
export { default as ModalTimeout } from "./ModalTimeout";
