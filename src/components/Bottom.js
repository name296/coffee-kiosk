import React, { memo, useContext } from "react";
import Button from "./Button";
import { HomeIcon, TimeIcon, WheelchairIcon } from "../Icon";
import { TimeoutContext } from "../contexts";

/** UI 컴포넌트: 하단 시스템 버튼(시작화면, 타임아웃, 접근성) */
const Bottom = memo(() => {
    const timeout = useContext(TimeoutContext);

    return (
        <div className="bottom" data-tts-text="시스템 설정,">
            <Button
                svg={<HomeIcon />}
                label="시작화면"
                modal="Restart"
            />
            <Button
                svg={<TimeIcon />}
                label={timeout?.globalRemainingTimeFormatted || "00:00"}
                modal="Timeout"
            />
            <Button
                svg={<WheelchairIcon />}
                label="접근성"
                modal="Accessibility" />
        </div>
    );
});
Bottom.displayName = 'Bottom';

export default Bottom;
