import React, { memo, useRef } from "react";
import Button from "../../../shared/ui/Button";

import { TakeinIcon, TakeoutIcon } from "../../../Icon";
import { useFocusableSectionsManager } from "../../../shared/hooks/useFocusManagement";

const ScreenStart = memo(() => {
    const mainContentRef = useRef(null);

    useFocusableSectionsManager(['mainContent'], { mainContent: mainContentRef });

    return (
        <>
            <img src="./images/poster.png" className="poster" alt="커피포스터" />
            <div className="hero">
                <p>화면 하단의 접근성 버튼을 눌러 고대비화면, 소리크기, 큰글씨화면, 낮은화면을 설정할 수 있습니다</p>
                <div
                    className="task-manager"
                    data-tts-text="취식방식 선택 영역입니다. 포장하기, 먹고가기 버튼이 있습니다. 좌우 방향키로 버튼을 선택합니다,"
                    ref={mainContentRef}
                >
                    <Button className="w285h285 secondary1" svg={<TakeoutIcon />} label="포장하기" navigate="ScreenMenu" />
                    <Button className="w285h285 secondary1" svg={<TakeinIcon />} label="먹고가기" navigate="ScreenMenu" />
                </div>
                <p>키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다</p>
            </div>
        </>
    );
});

ScreenStart.displayName = 'ScreenStart';
export default ScreenStart;
