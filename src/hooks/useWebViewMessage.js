// ============================================================================
// 웹뷰 메시지 리스너 훅
// ============================================================================

import { useEffect } from 'react';
import { PAYMENT_STEPS, WEBVIEW_COMMANDS, WEBVIEW_RESPONSE } from '../config/appConfig';

/**
 * 웹뷰 메시지를 수신하고 처리하는 커스텀 훅
 * @param {Function} setisCreditPayContent - 결제 단계 설정 함수
 */
export const useWebViewMessage = (setisCreditPayContent) => {
  useEffect(() => {
    if (window.chrome?.webview) {
      const handleMessage = (event) => {
        let resData = event.data;
        // 결과값 받으면
        // 카드 :  뽑기-> 영수증 출력 여부 : setisCreditPayContent(3) -> setisCreditPayContent(4)
        // 모바일 : 영수증 출력 여부 : setisCreditPayContent(4)
        if (resData.arg.result === WEBVIEW_RESPONSE.SUCCESS) {
          if (resData.Command === WEBVIEW_COMMANDS.PAY) {
            setisCreditPayContent(PAYMENT_STEPS.CARD_REMOVE); // 카드 뽑는 화면 넘어가기
          }
          if (resData.Command === WEBVIEW_COMMANDS.PRINT) {
            setisCreditPayContent(PAYMENT_STEPS.PRINT_SELECT); // 주문번호 출력 페이지
          }
        } else {
          console.log(resData.arg.errorMessage);
        }
      };

      window.chrome.webview.addEventListener("message", handleMessage);

      return () => {
        if (window.chrome?.webview) {
          window.chrome.webview.removeEventListener("message", handleMessage);
        }
      };
    }
  }, [setisCreditPayContent]);
};

