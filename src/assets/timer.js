let intervalId = null;
const introTTSTime = 180;
const returnHomeTime = 60;
let intervalTime = 0;

export const startIntroTimer = (scriptText, handleText, onInitSetting) => {
  if(intervalId){
    intervalTime = 0;
    clearInterval(intervalId);
    intervalId = null;
  }
  intervalId = setInterval(() => {
    if (intervalTime === introTTSTime) {
      handleText(scriptText); // 기준 시간 도달 시 텍스트 처리
      updateTimer(); // 시간 초기화
    }
    if(intervalTime != 0 && intervalTime % returnHomeTime == 0){
      onInitSetting();
    }      
    intervalTime++;
  }, 1000); // 1초마다 실행
}

// 자동 초기화면 타이아웃 제거 (미사용)
export const startReturnTimer = (scriptText, handleText, navigate) => {
    if(intervalId){
      clearInterval(intervalId);
      intervalId = null;
      intervalTime = 0;
    }
    intervalId = setInterval(() => {
      if(intervalTime === returnHomeTime){
        // handleText(scriptText); 
        navigate("/", {state: true});
      }      
      intervalTime++;
    }, 1000); // 1초마다 실행
};

export const updateTimer = () =>{
    intervalTime = 0;
}

export const stopIntroTimer = ()=>{
  if(intervalId){
    clearInterval(intervalId);
    intervalId = null;
  }
}