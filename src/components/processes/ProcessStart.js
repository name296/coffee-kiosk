import React, { memo } from "react";
import { Button, Main, Bottom } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { TakeinIcon, TakeoutIcon } from "@/components/Icon";
import { processTts } from "@/lib/processTts";

const ProcessStart = memo(() => (
    <div className="process first">
        <div className="poster">
            <img src="images/poster.png" alt="커피포스터" />
        </div>
        <Main ttsText={processTts[PROCESS_NAME.START]}>
            <span className="title">화면 하단의 접근성 버튼을 눌러 고대비화면, 소리크기, 큰글씨화면, 낮은화면을 설정할 수 있습니다</span>
            <div
                className="task-manager"
                data-tts-text="취식방식 선택 영역입니다. 포장하기, 먹고가기 버튼이 있습니다. 좌우 방향키로 버튼을 선택합니다,"
            >
                <Button className="skel-inline skin-secondary" svg={<TakeoutIcon />} label="포장하기" navigate={PROCESS_NAME.MENU} />
                <Button className="skel-inline skin-primary" svg={<TakeinIcon />} label="먹고가기" navigate={PROCESS_NAME.MENU} />
            </div>
            <span className="title">키패드는 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 사용할 수 있습니다</span>
        </Main>
        <Bottom />
    </div>
));

ProcessStart.displayName = "ProcessStart";
export default ProcessStart;
