import React, { memo, useContext, useRef } from "react";
import Button from "../components/ui/Button";
import Bottom from "../components/ui/Bottom";

import { TakeinIcon, TakeoutIcon } from "../Icon"; // ensure named exports in Icon.js
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { TTSDBContext } from "../contexts/TTSContext";
import { useTextHandler } from "../hooks/useTTS";
import { useDOM } from "../hooks/useDOM";
import { useSound } from "../hooks/useSound";
import { useGlobalHandlerRegistration } from "../hooks/useGlobalHandlers";
import { useToggleButtonClickHandler, useDisabledButtonBlocker, usePressStateHandler } from "../hooks/useButtonEvents";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { TTS } from "../constants/constants";

const ScreenStart = memo(() => {
    // ScreenStart 전용 TTS 스크립트
    const TTS_SCREEN_START = `안녕하세요, 장애인, 비장애인 모두 사용 가능한 무인주문기입니다,시각 장애인을 위한 음성 안내와 키패드를 제공합니다,키패드는 손을 아래로 뻗으면 닿는 조작부 영역에 있으며, 돌출된 점자 및 테두리로 자세한 위치를 파악할 수 있습니다,키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다, 안내, 시작 단계, 음식을 포장할지 먹고갈지 선택합니다.${TTS.replay}`;

    // 개별 Context에서 직접 가져오기
    const route = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const ttsDB = useContext(TTSDBContext);

    // 로컬 ref 생성
    const mainContentRef = useRef(null);

    const { handleText } = useTextHandler((accessibility.volume ?? 1));
    const { handleText: handleGlobalText } = useTextHandler(accessibility.volume); // for useGlobalHandlerRegistration? or same one?
    // App.js used `handleText` for everything.

    const { blurActiveElement } = useDOM();
    const { play: playSound } = useSound();

    useGlobalHandlerRegistration(handleText);
    useToggleButtonClickHandler(true);
    useDisabledButtonBlocker(true);
    useKeyboardNavigationHandler(true, true);
    usePressStateHandler(true);
    useInteractiveTTSHandler(true, handleText);
    const { updateFocusableSections } = useFocusableSectionsManager(['mainContent'], { mainContent: mainContentRef });

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <div className="main first" data-tts-text={TTS_SCREEN_START} tabIndex={-1}>
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
            </div>
            <Bottom />
        </>
    );
});
ScreenStart.displayName = 'ScreenStart';

export default ScreenStart;
