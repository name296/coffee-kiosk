import React, { memo, useContext } from "react";
import Button from "@/components/Button";
import { HomeIcon, TimeIcon, WheelchairIcon } from "@/components/Icon";
import { TimeoutContext } from "@/contexts";
import { formatRemainingTimeTTS } from "@/lib";

/** UI 컴포넌트: 하단 시스템 버튼(홈, 타임아웃, 접근성) */
const Bottom = memo(() => {
    const timeout = useContext(TimeoutContext);

    return (
        <div className="bottom body1" data-tts-text="시스템 설정,">
            <Button
                className="skel-access skin-access"
                svg={<HomeIcon />}
                label="홈"
                modal="Restart"
            />
            <Button
                className="skel-access skin-access bottom-timeout"
                svg={<TimeIcon />}
                label={timeout?.globalRemainingTimeFormatted || "00:00"}
                ttsText={formatRemainingTimeTTS(timeout?.globalRemainingTime)}
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
