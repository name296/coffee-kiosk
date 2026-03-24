import React, { memo, useContext, useMemo } from "react";
import Button from "@/components/Button";
import { HomeIcon, WheelchairIcon } from "@/components/Icon";
import { TimeoutContext } from "@/contexts";
import { formatRemainingTimeTTS } from "@/lib";

/** UI 컴포넌트: 하단 시스템 버튼(홈+남은시간, 접근성) */
const Bottom = memo(() => {
    const timeout = useContext(TimeoutContext);
    const mmss = timeout?.globalRemainingTimeFormatted || "00:00";
    const homeTimeLabel = useMemo(() => `홈 (${mmss})`, [mmss]);
    const homeTimeTts = useMemo(
        () => `홈, 남은시간, ${formatRemainingTimeTTS(timeout?.globalRemainingTime)},`,
        [timeout?.globalRemainingTime]
    );

    return (
        <div className="bottom body1" data-tts-text="시스템 설정,">
            <Button
                className="skel-access skin-access"
                svg={<HomeIcon />}
                label={homeTimeLabel}
                ttsText={homeTimeTts}
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
