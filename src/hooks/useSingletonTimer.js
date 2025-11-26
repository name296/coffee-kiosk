// ============================================================================
// 타이머 싱글톤 훅
// ============================================================================

const INTRO_TTS_TIME = 180;
const RETURN_HOME_TIME = 60;

/**
 * 타이머 싱글톤 클래스
 */
class TimerSingleton {
  #intervalId = null;
  #intervalTime = 0;

  /**
   * 인트로 타이머 시작
   */
  startIntroTimer(scriptText, handleText, onInitSetting) {
    this.cleanup();

    this.#intervalId = setInterval(() => {
      if (this.#intervalTime === INTRO_TTS_TIME) {
        handleText(scriptText); // 기준 시간 도달 시 텍스트 처리
        this.updateTimer(); // 시간 초기화
      }
      if (
        this.#intervalTime !== 0 &&
        this.#intervalTime % RETURN_HOME_TIME === 0
      ) {
        onInitSetting();
      }
      this.#intervalTime++;
    }, 1000); // 1초마다 실행
  }

  /**
   * 자동 초기화면 타이머 시작
   */
  startReturnTimer(scriptText, handleText, setCurrentPage) {
    this.cleanup();

    this.#intervalId = setInterval(() => {
      if (this.#intervalTime === RETURN_HOME_TIME) {
        // handleText(scriptText);
        if (setCurrentPage) {
          setCurrentPage("first");
        }
      }
      this.#intervalTime++;
    }, 1000); // 1초마다 실행
  }

  /**
   * 타이머 시간 초기화
   */
  updateTimer() {
    this.#intervalTime = 0;
  }

  /**
   * 인트로 타이머 중지
   */
  stopIntroTimer() {
    this.cleanup();
  }

  /**
   * 현재 타이머 시간 가져오기
   */
  getIntervalTime() {
    return this.#intervalTime;
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

/**
 * 타이머 싱글톤 인스턴스 가져오기 (내부 사용)
 */
const getTimerSingleton = () => {
  if (!timerInstance) {
    timerInstance = new TimerSingleton();
  }
  return timerInstance;
};

// 리액트 훅 버전 (컴포넌트 내에서 사용)
export const useTimer = () => {
  const timerSingleton = getTimerSingleton();

  return {
    startIntroTimer: (scriptText, handleText, onInitSetting) =>
      timerSingleton.startIntroTimer(scriptText, handleText, onInitSetting),
    startReturnTimer: (scriptText, handleText, setCurrentPage) =>
      timerSingleton.startReturnTimer(scriptText, handleText, setCurrentPage),
    updateTimer: () => timerSingleton.updateTimer(),
    stopIntroTimer: () => timerSingleton.stopIntroTimer(),
    getIntervalTime: () => timerSingleton.getIntervalTime(),
    cleanup: () => timerSingleton.cleanup(),
  };
};

