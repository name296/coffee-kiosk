import React, { memo, useContext, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components";
import Icon from "@/components/Icon";
import { TTS, VOLUME_MAP } from "@/constants";
import { AccessibilityContext, ModalContext, RefContext } from "@/contexts";
import { useAccessibilitySettings, useDOM, useFocusTrap, useTextHandler } from "@/hooks";

const MODAL_TTS = "알림, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다, ";

export const ModalAccessibility = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);
    const refsData = useContext(RefContext);
    const { setAudioVolume } = useDOM();
    const { handleText } = useTextHandler(accessibility.volume);
    const isOpen = modal.ModalAccessibility.isOpen;
    const { containerRef } = useFocusTrap(isOpen);
    const originalSettingsRef = useRef(null);

    useEffect(() => {
        if (isOpen && !originalSettingsRef.current) {
            originalSettingsRef.current = {
                isDark: accessibility.isDark,
                isLow: accessibility.isLow,
                isLarge: accessibility.isLarge,
                volume: accessibility.volume
            };
        } else if (!isOpen) {
            originalSettingsRef.current = null;
        }
    }, [isOpen, accessibility.isDark, accessibility.isLow, accessibility.isLarge, accessibility.volume]);

    const {
        settings: currentSettings,
        setDark, setLow, setLarge, setVolume: setSettingsVolume,
        updateAll: updateAllSettings, getStatusText
    } = useAccessibilitySettings({
        isDark: accessibility.isDark,
        isLow: accessibility.isLow,
        isLarge: accessibility.isLarge,
        volume: accessibility.volume
    });

    const handleDarkChange = useCallback((val) => {
        setDark(val);
        accessibility.setIsDark(val);
        handleText(`고대비 ${val ? "켬" : "끔"},`, false);
    }, [setDark, accessibility, handleText]);

    const handleVolumeChange = useCallback((val) => {
        setSettingsVolume(val);
        accessibility.setVolume(val);
        setAudioVolume("audioPlayer", VOLUME_MAP[val]);
        const volumeLabel = val === 0 ? "끔" : val === 1 ? "약" : val === 2 ? "중" : "강";
        handleText(`음량 ${volumeLabel},`, false, val);
    }, [setSettingsVolume, accessibility, setAudioVolume, handleText]);

    const handleLargeChange = useCallback((val) => {
        setLarge(val);
        accessibility.setIsLarge(val);
        handleText(`큰글씨 ${val ? "켬" : "끔"},`, false);
    }, [setLarge, accessibility, handleText]);

    const handleLowChange = useCallback((val) => {
        setLow(val);
        accessibility.setIsLow(val);
        handleText(`낮은화면 ${val ? "켬" : "끔"},`, false);
    }, [setLow, accessibility, handleText]);

    const handleInitialSettingsPress = useCallback(() => {
        updateAllSettings({ isDark: false, isLow: false, isLarge: false, volume: 1 });
        accessibility.setIsDark(false);
        accessibility.setVolume(1);
        accessibility.setIsLarge(false);
        accessibility.setIsLow(false);
        setAudioVolume("audioPlayer", 0.5);
    }, [updateAllSettings, accessibility, setAudioVolume]);

    const handleCancelPress = useCallback(() => {
        const original = originalSettingsRef.current;
        if (original) {
            accessibility.setIsDark(original.isDark);
            accessibility.setIsLow(original.isLow);
            accessibility.setIsLarge(original.isLarge);
            accessibility.setVolume(original.volume);
            setAudioVolume("audioPlayer", VOLUME_MAP[original.volume]);
        }
        modal.ModalAccessibility.close({ returnToOpener: true });
    }, [accessibility, modal, setAudioVolume]);

    const handleConfirmPress = useCallback(() => {
        modal.ModalAccessibility.close();
    }, [modal]);

    if (!isOpen) return null;

    return (
        <div className="modal modal-accessibility" aria-hidden={!isOpen}>
            <div
                className="modal-panel"
                ref={containerRef}
                data-tts-text={MODAL_TTS + TTS.replay}
                tabIndex={0}
            >
                <div className="modal-head body1">
                    <Icon className="primary" name="Wheelchair" />
                    <span className="primary">접근성</span>
                </div>
                <div className="modal-body body2">
                    <div className="modal-message">
                        <span>
                            원하시는 <span className="primary">접근성 옵션</span>을 선택하시고
                        </span>
                        <span>
                            <span className="primary">적용하기</span> 버튼을 누릅니다
                        </span>
                    </div>
                    <div className="modal-settings">
                        <div className="modal-setting-row">
                            <span className="modal-setting-name">
                                <Icon name="Contrast" className="modal-graphic" aria-hidden />
                                고대비
                            </span>
                            <div className="task-manager" data-tts-text="고대비 설정,">
                                <Button toggle value={currentSettings.isDark} selectedValue={false} onChange={handleDarkChange} label="끔" />
                                <Button toggle value={currentSettings.isDark} selectedValue={true} onChange={handleDarkChange} label="켬" />
                            </div>
                        </div>
                        <div className="modal-setting-row">
                            <span className="modal-setting-name">
                                <Icon name="Volume" className="modal-graphic" aria-hidden />
                                음량
                            </span>
                            <div className="task-manager" data-tts-text="음량 설정,">
                                <Button toggle value={currentSettings.volume} selectedValue={0} onChange={handleVolumeChange} label="끔" />
                                <Button toggle value={currentSettings.volume} selectedValue={1} onChange={handleVolumeChange} label="약" />
                                <Button toggle value={currentSettings.volume} selectedValue={2} onChange={handleVolumeChange} label="중" />
                                <Button toggle value={currentSettings.volume} selectedValue={3} onChange={handleVolumeChange} label="강" />
                            </div>
                        </div>
                        <div className="modal-setting-row">
                            <span className="modal-setting-name">
                                <Icon name="Large" className="modal-graphic" aria-hidden />
                                큰글씨
                            </span>
                            <div className="task-manager" data-tts-text="큰글씨 설정,">
                                <Button toggle value={currentSettings.isLarge} selectedValue={false} onChange={handleLargeChange} label="끔" />
                                <Button toggle value={currentSettings.isLarge} selectedValue={true} onChange={handleLargeChange} label="켬" />
                            </div>
                        </div>
                        <div className="modal-setting-row">
                            <span className="modal-setting-name">
                                <Icon name="Wheelchair" className="modal-graphic" aria-hidden />
                                낮은화면
                            </span>
                            <div className="task-manager" data-tts-text="낮은화면 설정,">
                                <Button toggle value={currentSettings.isLow} selectedValue={false} onChange={handleLowChange} label="끔" />
                                <Button toggle value={currentSettings.isLow} selectedValue={true} onChange={handleLowChange} label="켬" />
                            </div>
                        </div>
                    </div>
                    <div
                        data-tts-text="작업 관리,"
                        ref={refsData.refs.Modal.footerButtonsRef}
                        className="task-manager"
                    >
                        <Button className="skel-inline skin-danger" svg={<Icon name="Restart" />} label="초기화" ttsText="접근성 설정 초기화," onClick={handleInitialSettingsPress} />
                        <Button className="skel-inline skin-secondary" svg={<Icon name="Cancel" />} label="적용안함" onClick={handleCancelPress} />
                        <Button className="skel-inline skin-primary" svg={<Icon name="Ok" />} label="적용하기" onClick={handleConfirmPress} />
                    </div>
                </div>
            </div>
        </div>
    );
});

ModalAccessibility.displayName = "ModalAccessibility";
export default ModalAccessibility;
