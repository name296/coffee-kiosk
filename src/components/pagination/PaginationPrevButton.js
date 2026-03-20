import React, { memo } from "react";
import Button from "@/components/Button";

/** 이전 버튼. 정보만 받아서 렌더 */
const PaginationPrevButton = memo(({ label, icon, onClick, className }) => (
    <Button
        label={label}
        svg={icon}
        onClick={onClick}
        className={className}
    />
));
PaginationPrevButton.displayName = "PaginationPrevButton";

export default PaginationPrevButton;
