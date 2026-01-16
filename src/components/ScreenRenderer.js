import React, { useContext } from "react";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";

import ScreenStart from "../screens/ScreenStart";
import ScreenMenu from "../screens/ScreenMenu";
import ScreenDetails from "../screens/ScreenDetails";
import ScreenPayments from "../screens/ScreenPayments";
import ScreenCardInsert from "../screens/ScreenCardInsert";
import ScreenMobilePay from "../screens/ScreenMobilePay";
import ScreenSimplePay from "../screens/ScreenSimplePay";
import ScreenCardRemoval from "../screens/ScreenCardRemoval";
import ScreenOrderComplete from "../screens/ScreenOrderComplete";
import ScreenReceiptPrint from "../screens/ScreenReceiptPrint";
import ScreenFinish from "../screens/ScreenFinish";

export const ScreenRenderer = () => {
    const { currentPage } = useContext(ScreenRouteContext);

    return (
        <>
            {currentPage === 'ScreenStart' && <ScreenStart />}
            {currentPage === 'ScreenMenu' && <ScreenMenu />}
            {currentPage === 'ScreenDetails' && <ScreenDetails />}
            {currentPage === 'ScreenPayments' && <ScreenPayments />}
            {currentPage === 'ScreenCardInsert' && <ScreenCardInsert />}
            {currentPage === 'ScreenMobilePay' && <ScreenMobilePay />}
            {currentPage === 'ScreenSimplePay' && <ScreenSimplePay />}
            {currentPage === 'ScreenCardRemoval' && <ScreenCardRemoval />}
            {currentPage === 'ScreenOrderComplete' && <ScreenOrderComplete />}
            {currentPage === 'ScreenReceiptPrint' && <ScreenReceiptPrint />}
            {currentPage === 'ScreenFinish' && <ScreenFinish />}
        </>
    );
};
