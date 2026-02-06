import React, { memo, useContext, useCallback, useEffect } from "react";
import { BaseModal } from "./Modal";
import { Button } from "../components";
import Icon from "../Icon";
import { AccessibilityContext, ModalContext, RefContext } from "../contexts";
import { useAccessibilitySettings, useDOM } from "../hooks";
import { VOLUME_MAP } from "../constants";

export const ModalAccessibility = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);
    const refsData = useContext(RefContext);
    const { setAudioVolume } = useDOM();
    const isOpen = modal.ModalAccessibility.isOpen;

    // 접근성 설정 로직 (Hook)
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

    const originalSettingsRef = refsData.refs.ModalAccessibility.originalSettingsRef;

    // 원래 설정 저장 및 관리
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
    }, [isOpen, originalSettingsRef, accessibility]);

    // 핸들러들
    const handleDarkChange = useCallback((val) => {
        setDark(val);
        accessibility.setIsDark(val);
    }, [setDark, accessibility]);

    const handleVolumeChange = useCallback((val) => {
        setSettingsVolume(val);
        accessibility.setVolume(val);
        setAudioVolume('audioPlayer', VOLUME_MAP[val]);
    }, [setSettingsVolume, accessibility, setAudioVolume]);

    const handleLargeChange = useCallback((val) => {
        setLarge(val);
        accessibility.setIsLarge(val);
    }, [setLarge, accessibility]);

    const handleLowChange = useCallback((val) => {
        setLow(val);
        accessibility.setIsLow(val);
    }, [setLow, accessibility]);

    const handleInitialSettingsPress = useCallback(() => {
        updateAllSettings({ isDark: false, isLow: false, isLarge: false, volume: 1 });
        accessibility.setIsDark(false);
        accessibility.setVolume(1);
        accessibility.setIsLarge(false);
        accessibility.setIsLow(false);
        setAudioVolume('audioPlayer', 0.5);
    }, [updateAllSettings, accessibility, setAudioVolume]);

    const handleCancelPress = useCallback(() => {
        const original = originalSettingsRef.current;
        if (original) {
            accessibility.setIsDark(original.isDark);
            accessibility.setVolume(original.volume);
            accessibility.setIsLarge(original.isLarge);
            accessibility.setIsLow(original.isLow);
            setAudioVolume('audioPlayer', VOLUME_MAP[original.volume]);
        }
        modal.ModalAccessibility.close();
    }, [originalSettingsRef, accessibility, modal, setAudioVolume]);

    const handleConfirmPress = useCallback(() => {
        modal.ModalAccessibility.close();
    }, [modal]);

    if (!isOpen) return null;

    const accessibilityContent = (
        <>
            <div className="modal-message">
                <div>원하시는&nbsp;<span className="primary">접근성 옵션</span>을 선택하시고</div>
                <div><span className="primary">적용하기</span>&nbsp;버튼을 누르세요</div>
            </div>
            <div className="setting-row" data-tts-text="초기설정으로 일괄선택,">
                <span className="setting-name"><span className="primary">초기설정</span>으로 일괄선택</span>
                <div className="task-manager">
                    <Button svg={<Icon name="Restart" />} label="초기설정" onClick={handleInitialSettingsPress} />
                </div>
            </div>
            <hr className="setting-line" />
            <div className="setting-row">
                <span className="setting-name"><span className="icon"><Icon name="Contrast" /></span>고대비화면</span>
                <div className="task-manager" data-tts-text={`고대비 화면, 선택상태, ${getStatusText.dark},`}>
                    <Button toggle value={currentSettings.isDark} selectedValue={false} onChange={handleDarkChange} label="끔" />
                    <Button toggle value={currentSettings.isDark} selectedValue={true} onChange={handleDarkChange} label="켬" />
                </div>
            </div>
            <hr className="setting-line" />
            <div className="setting-row">
                <span className="setting-name"><span className="icon"><Icon name="Volume" /></span>소리크기</span>
                <div className="task-manager" data-tts-text={`소리크기, 선택상태, ${getStatusText.volume},`}>
                    <Button toggle value={currentSettings.volume} selectedValue={0} onChange={handleVolumeChange} label="끔" />
                    <Button toggle value={currentSettings.volume} selectedValue={1} onChange={handleVolumeChange} label="약" />
                    <Button toggle value={currentSettings.volume} selectedValue={2} onChange={handleVolumeChange} label="중" />
                    <Button toggle value={currentSettings.volume} selectedValue={3} onChange={handleVolumeChange} label="강" />
                </div>
            </div>
            <hr className="setting-line" />
            <div className="setting-row">
                <span className="setting-name"><span className="icon"><Icon name="Large" /></span>큰글씨화면</span>
                <div className="task-manager" data-tts-text={`큰글씨 화면, 선택상태, ${getStatusText.large},`}>
                    <Button toggle value={currentSettings.isLarge} selectedValue={false} onChange={handleLargeChange} label="끔" />
                    <Button toggle value={currentSettings.isLarge} selectedValue={true} onChange={handleLargeChange} label="켬" />
                </div>
            </div>
            <hr className="setting-line" />
            <div className="setting-row">
                <span className="setting-name"><span className="icon"><Icon name="Wheelchair" /></span>낮은화면</span>
                <div className="task-manager" data-tts-text={`낮은 화면, 선택상태, ${getStatusText.low},`}>
                    <Button toggle value={currentSettings.isLow} selectedValue={false} onChange={handleLowChange} label="끔" />
                    <Button toggle value={currentSettings.isLow} selectedValue={true} onChange={handleLowChange} label="켬" />
                </div>
            </div>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            type="accessibility"
            customContent={
                <>
                    {accessibilityContent}
                    <div data-tts-text="작업 관리," ref={refsData.refs.BaseModal.modalConfirmButtonsRef} className="task-manager">
                        <Button svg={<Icon name="Cancel" />} label="적용안함" onClick={handleCancelPress} />
                        <Button svg={<Icon name="Ok" />} label="적용하기" onClick={handleConfirmPress} />
                    </div>
                </>
            }
        />
    );
});

ModalAccessibility.displayName = 'ModalAccessibility';
export default ModalAccessibility;
