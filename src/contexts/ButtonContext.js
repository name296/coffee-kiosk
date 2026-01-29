import React, { createContext, useState, useCallback, useMemo, useContext } from "react";

// ============================================================================
// Button 관련 Context (단일책임원칙: 각 책임별 분리)
// ============================================================================

// Button State Context - 버튼 상태 관리 (pressed 상태)
// 레벨: 전역 UI 상태/알림 레벨
// 의존성: 없음 (독립)
// 사용처: Button 컴포넌트 (Screen 컴포넌트들이 Button을 사용하므로 간접 사용)
// 제공 값: buttonStates, setButtonPressed, toggleButtonPressed, isButtonPressed
// Provider 위치: RefProvider 내부, ScreenRouteProvider보다 바깥 (ButtonStateProvider)
export const ButtonStateContext = createContext();

export const ButtonStateProvider = ({ children }) => {
    const [buttonStates, setButtonStates] = useState({});

    const setButtonPressed = useCallback((id, p) => {
        setButtonStates(pr => ({ ...pr, [id]: p }));
    }, []);

    const toggleButtonPressed = useCallback((id) => {
        let ns;
        setButtonStates(p => { ns = !p[id]; return { ...p, [id]: ns }; });
        return ns;
    }, []);

    const isButtonPressed = useCallback((id) => buttonStates[id] || false, [buttonStates]);

    const value = useMemo(() => ({
        setButtonPressed,
        toggleButtonPressed,
        isButtonPressed,
        buttonStates
    }), [setButtonPressed, toggleButtonPressed, isButtonPressed, buttonStates]);

    return (
        <ButtonStateContext.Provider value={value}>
            {children}
        </ButtonStateContext.Provider>
    );
};
export const useButtonState = () => {
    const context = useContext(ButtonStateContext);
    return {
        buttonStates: context?.buttonStates || {},
        setButtonPressed: context?.setButtonPressed || (() => { }),
        toggleButtonPressed: context?.toggleButtonPressed || (() => false),
        isButtonPressed: context?.isButtonPressed || (() => false)
    };
};

// Button Group Context - 버튼 그룹 선택 관리 (그룹 내 단일 선택)
// 레벨: 전역 UI 상태/알림 레벨
// 의존성: 없음 (독립)
// 사용처: Button 컴포넌트 (toggle prop 사용 시, Screen 컴포넌트들이 Button을 사용하므로 간접 사용)
// 제공 값: groupStates, selectInGroup, getSelectedInGroup, isSelectedInGroup, clearGroupSelection
// Provider 위치: ButtonStateProvider 내부, ScreenRouteProvider보다 바깥 (ButtonGroupProvider)
export const ButtonGroupContext = createContext();

export const ButtonGroupProvider = ({ children }) => {
    const [groupStates, setGroupStates] = useState({});

    const selectInGroup = useCallback((gid, bid) => {
        setGroupStates(p => ({ ...p, [gid]: bid }));
    }, []);

    const getSelectedInGroup = useCallback((gid) => groupStates[gid] || null, [groupStates]);
    const isSelectedInGroup = useCallback((gid, bid) => groupStates[gid] === bid, [groupStates]);

    const clearGroupSelection = useCallback((gid) => {
        setGroupStates(p => { const s = { ...p }; delete s[gid]; return s; });
    }, []);

    const value = useMemo(() => ({
        selectInGroup,
        getSelectedInGroup,
        isSelectedInGroup,
        clearGroupSelection,
        groupStates
    }), [selectInGroup, getSelectedInGroup, isSelectedInGroup, clearGroupSelection, groupStates]);

    return (
        <ButtonGroupContext.Provider value={value}>
            {children}
        </ButtonGroupContext.Provider>
    );
};
export const useButtonGroup = () => {
    const context = useContext(ButtonGroupContext);
    return {
        groupStates: context?.groupStates || {},
        selectInGroup: context?.selectInGroup || (() => { }),
        getSelectedInGroup: context?.getSelectedInGroup || (() => null),
        isSelectedInGroup: context?.isSelectedInGroup || (() => false),
        clearGroupSelection: context?.clearGroupSelection || (() => { })
    };
};
