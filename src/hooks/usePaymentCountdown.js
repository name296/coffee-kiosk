// ============================================================================
// 결제 카운트다운 훅
// ============================================================================

import { useState, useEffect } from 'react';
import { PAYMENT_STEPS, TIMER_CONFIG } from '../config/appConfig';

/**
 * 결제 단계별 카운트다운을 관리하는 커스텀 훅
 * @param {number} isCreditPayContent - 현재 결제 단계
 * @param {Function} setisCreditPayContent - 결제 단계 설정 함수
 * @param {Object} ModalReturn - 리턴 모달 객체 { isOpen, open, close }
 * @param {Object} ModalAccessibility - 접근성 모달 객체 { isOpen, open, close }
 * @param {Function} setQuantities - 수량 설정 함수
 * @param {Array} totalMenuItems - 전체 메뉴 아이템
 * @param {Function} setisDark - 다크 모드 설정 함수
 * @param {Function} setVolume - 볼륨 설정 함수
 * @param {Function} setisLarge - 대형 모드 설정 함수
 * @param {Function} setisLow - 저시력 모드 설정 함수
 * @param {Function} setCurrentPage - 현재 페이지 설정 함수
 * @returns {number} countdown - 현재 카운트다운 값
 */
export const usePaymentCountdown = ({
  isCreditPayContent,
  setisCreditPayContent,
  ModalReturn,
  ModalAccessibility,
  setQuantities,
  totalMenuItems,
  setisDark,
  setVolume,
  setisLarge,
  setisLow,
  setCurrentPage
}) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // 타이머 설정 : 영수증 미출력 시 자동 마무리 단계
    if (isCreditPayContent === PAYMENT_STEPS.PRINT_SELECT || isCreditPayContent === PAYMENT_STEPS.RECEIPT_PRINT) {
      const resetCountdown = () => setCountdown(TIMER_CONFIG.AUTO_FINISH_DELAY);

      // 카운트다운 설정
      setCountdown(TIMER_CONFIG.AUTO_FINISH_DELAY);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(timer);
            setTimeout(() => {
              setisCreditPayContent(PAYMENT_STEPS.FINISH);
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, TIMER_CONFIG.INTERVAL_DELAY);

      // keydown 및 click 이벤트 추가
      const handleReset = () => resetCountdown();
      window.addEventListener('keydown', handleReset);
      window.addEventListener('click', handleReset);

      return () => {
        window.removeEventListener('keydown', handleReset);
        window.removeEventListener('click', handleReset);
        clearInterval(timer);
      };
    }

    // 타이머 설정 : 마무리 단계 후 첫화면으로 이동
    if (isCreditPayContent === PAYMENT_STEPS.FINISH) {
      setCountdown(TIMER_CONFIG.FINAL_PAGE_DELAY);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(timer);
            setTimeout(() => {
              // 모달창 끄기
              ModalReturn.close();
              ModalAccessibility.close();
              setQuantities(
                totalMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
              );

              // 초기설정
              setisDark(false);
              setVolume(1);
              setisLarge(false);
              setisLow(false);
              setCurrentPage("first");
              return 0;
            }, 0);
          }
          return prev - 1;
        });
      }, TIMER_CONFIG.INTERVAL_DELAY);

      return () => clearInterval(timer);
    }
  }, [
    isCreditPayContent,
    setisCreditPayContent,
    ModalReturn,
    ModalAccessibility,
    setQuantities,
    totalMenuItems,
    setisDark,
    setVolume,
    setisLarge,
    setisLow,
    setCurrentPage
  ]);

  return countdown;
};

