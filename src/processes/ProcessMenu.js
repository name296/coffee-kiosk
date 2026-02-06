import React, { memo } from "react";
import { Category, MenuGrid } from "../components";

const ProcessMenu = memo(() => (
    <>
        <Category />
        <MenuGrid />
    </>
));

ProcessMenu.displayName = 'ProcessMenu';
export default ProcessMenu;
