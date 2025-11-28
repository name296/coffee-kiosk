// ============================================================================
// 페이지 스크립트 생성 훅
// ============================================================================

import { useMemo } from 'react';
import { commonScript } from '../config/messages';

/**
 * 결제 단계별 페이지 스크립트를 생성하는 커스텀 훅
 * @param {number} isCreditPayContent - 현재 결제 단계
 * @param {number} totalSum - 총 결제 금액
 * @param {number} orderNum - 주문 번호
 * @returns {string} pageScript - 생성된 페이지 스크립트
 */
export const usePageScript = (isCreditPayContent, totalSum, orderNum) => {
  const pageScript = useMemo(() => {
    if (isCreditPayContent === 0) {
      return `작업 안내, 결제 선택 단계. 결제 금액, ${totalSum.toLocaleString(
        "ko-KR"
      )}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ` + commonScript.replay;
    } else if (isCreditPayContent === 1) {
      return `작업안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ` + commonScript.replay;
    } else if (isCreditPayContent === 2) {
      return `작업 안내, 모바일페이 단계, 가운데 아래에 있는 카드리더기에 휴대전화의 모바일페이를 켜고 접근시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ` + commonScript.replay;
    } else if (isCreditPayContent === 3) {
      return `작업 안내, 신용카드 제거, 신용카드를 뽑습니다, 정상적으로 결제되고 나서 카드가 제거되면, 자동으로 다음 작업, 인쇄 선택으로 이동합니다, 확인 버튼을 눌러 결제 상황을 확인합니다, ` + commonScript.replay;
    } else if (isCreditPayContent === 4) {
      return `작업 안내, 인쇄 선택, 결제되었습니다, 주문번호 ${orderNum}번, 왼쪽 아래의 프린터에서 주문표를 받으시고, 영수증 출력 여부를 선택합니다, 육십초 동안 조작이 없을 경우, 출력 안함으로 자동 선택됩니다, 화면 터치 또는 키패드 입력이 확인되면 사용 시간이 다시 육십초로 연장됩니다,` + commonScript.replay;
    } else if (isCreditPayContent === 5) {
      return `작업 안내, 주문표단계, 주문번호, ${orderNum}, 왼쪽 아래의 프린터에서 주문표가 출력됩니다. 인쇄가 완전히 끝나고 받습니다. 마무리하기 버튼으로 서비스 이용을 종료할 수 있습니다. ` + commonScript.replay;
    } else if (isCreditPayContent === 6) {
      return `작업 안내, 영수증 출력, 왼쪽 아래의 프린터에서 영수증을 받습니다, 마무리하기 버튼으로 사용을 종료할 수 있습니다, 육십초 동안 조작이 없을 경우, 마무리하기로 자동 선택됩니다, 화면 터치 또는 키패드 입력이 확인되면 사용 시간이 다시 육십초로 연장됩니다,` + commonScript.replay;
    } else if (isCreditPayContent === 7) {
      return `작업안내, 사용종료, 이용해주셔서 감사합니다,`;
    } else {
      return "";
    }
  }, [isCreditPayContent, totalSum, orderNum]);

  return pageScript;
};

