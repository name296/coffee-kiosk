import { useCallback } from 'react';

/**
 * 토글 버튼 그룹 관리 훅
 * 같은 그룹 내에서 하나만 선택되도록 처리
 * 
 * @param {string} groupSelector - 그룹 선택자 (예: '.category')
 * @param {Function} onToggle - 토글 시 실행할 콜백 함수
 * @returns {Function} handleToggle - 토글 핸들러 함수
 */
export const useToggleGroup = (groupSelector, onToggle) => {
  const handleToggle = useCallback((e, value) => {
    // preventDefault는 TTS 재생을 막을 수 있으므로 제거
    // 대신 stopPropagation으로 이벤트 버블링만 막음
    e.stopPropagation();
    
    const button = e.target.closest('.button');
    if (!button) return;
    
    // 같은 그룹 내 다른 버튼의 pressed 제거 및 아이콘 숨김
    const group = button.closest(groupSelector);
    if (group) {
      group.querySelectorAll('.button.toggle').forEach(btn => {
        if (btn !== button && btn.classList.contains('pressed')) {
          const otherIconPressed = btn.querySelector('.content.icon.pressed');
          if (otherIconPressed) {
            otherIconPressed.style.display = 'none';
          }
          btn.classList.remove('pressed');
          btn.setAttribute('aria-pressed', 'false');
          requestAnimationFrame(() => {
            if (otherIconPressed) {
              otherIconPressed.style.removeProperty('display');
            }
          });
        }
      });
    }
    
    // 클릭된 버튼의 pressed 상태 토글
    const wasPressed = button.classList.contains('pressed');
    const iconPressed = button.querySelector('.content.icon.pressed');
    
    if (wasPressed) {
      if (iconPressed) iconPressed.style.display = 'none';
      button.classList.remove('pressed');
      button.setAttribute('aria-pressed', 'false');
      requestAnimationFrame(() => {
        if (iconPressed) iconPressed.style.removeProperty('display');
      });
    } else {
      if (iconPressed) iconPressed.style.removeProperty('display');
      button.classList.add('pressed');
      button.setAttribute('aria-pressed', 'true');
    }
    
    // 콜백 실행
    if (onToggle) {
      onToggle(value);
    }
  }, [groupSelector, onToggle]);

  return handleToggle;
};

