import React, { memo } from "react";
import Process from "./processes/Process";
import { Modal } from "./modals/Modal";

/**
 * Screen – Process + Modal 자식으로 구성
 */
const Screen = memo(() => (
    <>
        <Process />
        <Modal />
    </>
));

Screen.displayName = "Screen";
export default Screen;
