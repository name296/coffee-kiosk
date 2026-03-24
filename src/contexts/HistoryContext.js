import React, { createContext, useCallback, useMemo, useRef } from "react";

export const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
    const stackRef = useRef([]);

    const pushHistory = useCallback((entry) => {
        if (!entry || typeof entry.undo !== "function") return;
        stackRef.current.push(entry);
    }, []);

    const undoHistory = useCallback((options = {}) => {
        const { skipTypes = [] } = options;
        const skipped = [];
        while (stackRef.current.length > 0) {
            const entry = stackRef.current.pop();
            if (!entry) continue;
            if (entry.type === "stop") {
                stackRef.current.push(entry);
                for (let i = skipped.length - 1; i >= 0; i -= 1) {
                    stackRef.current.push(skipped[i]);
                }
                return null;
            }
            if (skipTypes.includes(entry.type)) {
                skipped.push(entry);
                continue;
            }
            entry.undo();
            for (let i = skipped.length - 1; i >= 0; i -= 1) {
                stackRef.current.push(skipped[i]);
            }
            return entry.label || "실행 취소,";
        }
        for (let i = skipped.length - 1; i >= 0; i -= 1) {
            stackRef.current.push(skipped[i]);
        }
        return null;
    }, []);

    const clearHistory = useCallback(() => {
        stackRef.current = [];
    }, []);

    const value = useMemo(
        () => ({
            pushHistory,
            undoHistory,
            clearHistory
        }),
        [pushHistory, undoHistory, clearHistory]
    );

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    );
};
