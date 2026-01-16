export const safeQuerySelector = (s, c = null) => {
    try {
        if (typeof document === 'undefined') return null;
        return (c || document).querySelector(s);
    } catch { return null; }
};

// .main 포커스 설정 원천 함수
export const focusMainElement = () => {
    if (typeof document === 'undefined') return;
    const mainElement = document.querySelector('.main');
    if (mainElement) {
        const prevActive = document.activeElement;
        const prevActiveInfo = prevActive ? {
            tagName: prevActive.tagName,
            className: prevActive.className,
            id: prevActive.id || null
        } : null;

        console.log('[포커스] focusMainElement 호출', {
            from: prevActiveInfo,
            to: { tagName: mainElement.tagName, className: mainElement.className },
            timestamp: new Date().toISOString()
        });

        mainElement.focus();
    }
};
