import React, { memo } from "react";
import Button from "../Button";

/** 다음 버튼. 정보만 받아서 렌더 */
const PaginationNextButton = memo(({ label, icon, onClick, className }) => (
    <Button
        label={label}
        svg={icon}
        onClick={onClick}
        iconFirst={false}
        className={className}
    />
));
PaginationNextButton.displayName = "PaginationNextButton";

export default PaginationNextButton;
