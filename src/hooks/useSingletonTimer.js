// ============================================================================
// 인트로 타이머 싱글톤 훅
// 첫 화면에서 일정 시간마다 인트로 TTS 반복
// (홈 이동은 useIdleTimeout이 처리)
// ============================================================================

const INTRO_TTS_TIME = 180; // 3분마다 인트로 TTS 반복

/**
 * 인트로 타이머 싱글톤 클래스
 */
class IntroTimerSingleton {
  #intervalId = null;
  #intervalTime = 0;

  /**
   * 인트로 타이머 시작 (3분마다 TTS 반복)
   */
  startIntroTimer(scriptText, handleText, onInitSetting) {
    this.cleanup();

    this.#intervalId = setInterval(() => {
      this.#intervalTime++;
      
      if (this.#intervalTime >= INTRO_TTS_TIME) {
        handleText(scriptText);
        this.#intervalTime = 0; // 리셋
        if (onInitSetting) {
          onInitSetting();
        }
      }
    }, 1000);
  }

  /**
   * 타이머 중지
   */
  stopIntroTimer() {
    this.cleanup();
  }

  /**
   * 타이머 정리
   */
  cleanup() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
    this.#intervalTime = 0;
  }
}

// 싱글톤 인스턴스
let timerInstance = null;

const getTimerSingleton = () => {
  if (!timerInstance) {
    timerInstance = new IntroTimerSingleton();
  }
  return timerInstance;
};

/**
 * 인트로 타이머 훅
 * - startIntroTimer: 인트로 TTS 반복 시작
 * - stopIntroTimer: 타이머 중지
 */
export const useTimer = () => {
  const timer = getTimerSingleton();

  return {
    startIntroTimer: (scriptText, handleText, onInitSetting) =>
      timer.startIntroTimer(scriptText, handleText, onInitSetting),
    stopIntroTimer: () => timer.stopIntroTimer(),
  };
};

