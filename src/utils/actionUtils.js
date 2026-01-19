// 버튼 액션 핸들러 (단일책임원칙: 각 액션 타입별로 분리)
// ============================================================================

// 페이지 네비게이션 액션 (단일책임: 페이지 이동만)
export const handleNavigateAction = (setCurrentPage, actionTarget) => {
    if (actionTarget) setCurrentPage(actionTarget);
};

// 탭 선택 액션 (단일책임: 탭 선택만)
export const handleSelectTabAction = (setSelectedTab, selectedTab, actionTarget) => {
    if (actionTarget && selectedTab !== actionTarget) {
        setSelectedTab(actionTarget);
    }
};

// 결제 액션 (단일책임: 결제 처리 및 페이지 이동)
export const handlePaymentAction = (sendOrderDataToApp, setCurrentPage, actionMethod) => {
    if (actionMethod) {
        sendOrderDataToApp(actionMethod);
        const pageMap = {
            card: 'ScreenCardInsert',
            mobile: 'ScreenMobilePay',
            simple: 'ScreenSimplePay'
        };
        const targetPage = pageMap[actionMethod] || 'ScreenCardInsert';
        setCurrentPage(targetPage);
    }
};

// 취소 액션 (단일책임: 취소 처리 및 페이지 이동)
export const handleCancelAction = (setCurrentPage, sendCancelPayment, actionTarget) => {
    if (actionTarget) {
        setCurrentPage(actionTarget);
    } else {
        sendCancelPayment();
    }
};

// 영수증 액션 (단일책임: 영수증 출력 처리만)
export const handleReceiptAction = (sendPrintReceiptToApp, actionTarget) => {
    if (actionTarget === 'print') {
        sendPrintReceiptToApp();
    }
};

// 탭 네비게이션 액션 (단일책임: 탭 이동만)
export const handleTabNavAction = (handlePreviousTab, handleNextTab, actionTarget) => {
    if (actionTarget === 'prev') {
        handlePreviousTab();
    } else {
        handleNextTab();
    }
};

// 카테고리 네비게이션 액션 (단일책임: 카테고리 페이지 이동만)
export const handleCategoryAction = (handleCategoryPageNav, actionTarget) => {
    handleCategoryPageNav(actionTarget);
};

// 모달 열기 액션 (단일책임: 모달 열기만)
export const handleModalAction = (modal, actionTarget, buttonLabel, buttonIcon) => {
    if (actionTarget && modal[`Modal${actionTarget}`]) {
        modal[`Modal${actionTarget}`].open(buttonLabel, buttonIcon);
    }
};
