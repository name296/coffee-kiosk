import React, { memo, useContext } from "react";
import Button from "./Button";
import { HomeIcon, TimeIcon, WheelchairIcon } from "../Icon";
import { TimeoutContext } from "../contexts";

/** UI 컴포넌트: 하단 시스템 버튼(시작화면, 타임아웃, 접근성) */
const Bottom = memo(() => {
    const timeout = useContext(TimeoutContext);

    return (
        <div className="bottom body1" data-tts-text="시스템 설정,">
            <Button
                className="skel-access skin-access"
                svg={<HomeIcon />}
                label="처음으로"
                modal="Restart"
            />
            <Button
                className="skel-access skin-access"
                svg={<TimeIcon />}
                label={timeout?.globalRemainingTimeFormatted || "00:00"}
                modal="Timeout"
            />
            <Button
                className="skel-access skin-access"
                svg={<WheelchairIcon />}
                label="접근성"
                modal="Accessibility"
            />
        </div>
    );
});
Bottom.displayName = 'Bottom';

export default Bottom;
