import { useCallback, useContext } from "react";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { OrderContext } from "../contexts/OrderContext";
import {
    handleNavigateAction,
    handleSelectTabAction,
    handlePaymentAction,
    handleCancelAction,
    handleReceiptAction,
    handleTabNavAction,
    handleCategoryNavAction,
    handleModalAction
} from "../utils/actionUtils";

export const isActionKey = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'NumpadEnter';

export const useButtonAction = (actionType, actionTarget, actionMethod, disabled, buttonLabel, buttonIcon) => {
    const accessibility = useContext(AccessibilityContext);
    const route = useContext(ScreenRouteContext);
    const order = useContext(OrderContext);

    return useCallback((e) => {
        if (disabled) return;
        e.preventDefault();

        switch (actionType) {
            case 'navigate':
                handleNavigateAction(route.setCurrentPage, actionTarget);
                break;
            case 'selectTab':
                handleSelectTabAction(order.setSelectedTab, order.selectedTab, actionTarget);
                break;
            case 'payment':
                handlePaymentAction(order.sendOrderDataToApp, route.setCurrentPage, actionMethod);
                break;
            case 'cancel':
                handleCancelAction(route.setCurrentPage, order.sendCancelPayment, actionTarget);
                break;
            case 'receipt':
                handleReceiptAction(order.sendPrintReceiptToApp, actionTarget);
                break;
            case 'finish':
                break;
            case 'tabNav':
                handleTabNavAction(order.handlePreviousTab, order.handleNextTab, actionTarget);
                break;
            case 'categoryNav':
                handleCategoryNavAction(order.handleCategoryPageNav, actionTarget);
                break;
            case 'modal':
                handleModalAction(accessibility, actionTarget, buttonLabel, buttonIcon);
                break;
            default:
                break;
        }
    }, [disabled, actionType, actionTarget, actionMethod, buttonLabel, buttonIcon, route, order, accessibility]);
};
