import React, { memo } from "react";
import { Button, Main, Bottom } from "@/components";
import { PROCESS_NAME, TTS } from "@/constants";
import { TakeinIcon, TakeoutIcon } from "@/components/Icon";

/** `.main .title` 문구와 동일 — Main TTS와 화면 카피 단일 소스 */
const START_TITLE_ACCESSIBILITY =
    "화면 하단의 접근성 버튼을 눌러 고대비화면, 소리크기, 큰글씨화면, 낮은화면을 설정할 수 있습니다";
const START_TITLE_KEYPAD =
    "키패드는 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼을 눌러 사용할 수 있습니다";

const PROCESS_START_MAIN_TTS = `${START_TITLE_ACCESSIBILITY}, ${START_TITLE_KEYPAD},${TTS.replay}`;

const ProcessStart = memo(() => (
    <div className="process first">
        <div className="poster">
            <img src="images/poster.png" alt="커피포스터" />
        </div>
        <Main ttsText={PROCESS_START_MAIN_TTS}>
            <span className="title">{START_TITLE_ACCESSIBILITY}</span>
            <div
                className="task-manager"
                data-tts-text="취식방식,"
            >
                <Button className="skel-inline skin-secondary" svg={<TakeoutIcon />} label="포장하기" navigate={PROCESS_NAME.MENU} />
                <Button className="skel-inline skin-primary" svg={<TakeinIcon />} label="먹고가기" navigate={PROCESS_NAME.MENU} />
            </div>
            <span className="title">{START_TITLE_KEYPAD}</span>
        </Main>
        <Bottom />
    </div>
));

ProcessStart.displayName = "ProcessStart";
export default ProcessStart;
