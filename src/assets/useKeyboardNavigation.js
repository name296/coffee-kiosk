import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { updateTimer } from "../assets/timer";
import ReturnModal from "../components/ReturnModal";
import { useTextHandler } from '../assets/tts';


export const useKeyboardNavigation = ({
  initFocusableSections = [],
  initFirstButtonSection = "button",
  // isAccessibilityModal = false,
  // isReturnModal = false,
  // isResetModal = false,
  // isDeleteModal = false,
  // isCallModal = false,
  // isCreditPayContent = 0
}) => {
  const { sections, 
    isAccessibilityModal, setisAccessibilityModal, 
    isReturnModal, setisReturnModal, 
    isDeleteModal, setisDeleteModal, 
    isDeleteCheckModal, setisDeleteCheckModal, 
    isResetModal, setisResetModal, 
    isCallModal, setisCallModal, 
    isCreditPayContent, 
    volume, setVolume,
    setQuantities,
    totalMenuItems,
    setisLarge,
    setisLow,
    setisDark,
    setisCreditPayContent,
    commonScript,
    currentPage,
    setCurrentPage,
    goBack
   } = useContext(AppContext);
  const { handleText, handleReplayText } = useTextHandler(volume);
  const initialState = React.useRef({
    focusableSections: initFocusableSections,
    firstButtonSection: initFirstButtonSection,
  });
  const [focusableSections, setFocusableSections] = useState(
    initFocusableSections
  );
  const [firstButtonSection, setFirstButtonSection] = useState(
    initFirstButtonSection
  );

  // 업데이트
  const updateFocusableSections = (newSections) => {
    setFocusableSections(newSections);
  };

  useEffect(() => {
    if (isAccessibilityModal) {
      setFocusableSections( ["modalPage", "AccessibilitySections1", "AccessibilitySections2", "AccessibilitySections3", "AccessibilitySections4",
      "AccessibilitySections5", "AccessibilitySections6"]);
      setFirstButtonSection('AccessibilitySections1');
    } else if(isReturnModal || isResetModal || isDeleteModal || isDeleteCheckModal || isCallModal) {
      setFocusableSections( ["modalPage", "confirmSections"]);
      setFirstButtonSection('confirmSections');
    } else if (currentPage === 'forth') {
      const creditPaySections = isCreditPayContent === 0 ? ["page", "middle", "bottom", "bottomfooter"]
        : isCreditPayContent === 7 ? ["page", "bottomfooter"]
          : ["page", "bottom", "bottomfooter"];
      const creditPayFirstSection = 'AccessibilitySections1';
      setFocusableSections(creditPaySections);
      setFirstButtonSection(creditPayFirstSection);
    } else {
      // 초기값 복원
      setFocusableSections(initialState.current.focusableSections);
      setFirstButtonSection(initialState.current.firstButtonSection);
    }
  }, [isAccessibilityModal, isReturnModal, isResetModal, isDeleteModal, isDeleteCheckModal, isCallModal, isCreditPayContent]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // if (location.pathname.split("/").at(-1) === '') {
        updateTimer();
      // }
      const key = event.key;
      const activeElement = document.activeElement;

      const getSectionIndex = (element) => {
        return focusableSections.findIndex(
          (section) =>
            sections[section]?.current &&
            sections[section].current.contains(element)
        );
      };

      const currentSectionIndex = getSectionIndex(activeElement);

      const moveFocus = (sectionIndex, itemIndex = 0, isLast = false) => {
        const section = sections[focusableSections[sectionIndex]]?.current;
        if (!section) return;

        const isEnteringSection = sectionIndex !== currentSectionIndex;
        let ttsText = "";

        if (isEnteringSection) {
          ttsText += section.dataset.text || "";
        }

        const focusableItems = Array.from(section.querySelectorAll("button"));
        const targetElement = isLast
          ? focusableItems[focusableItems.length - 1]
          : focusableItems[itemIndex];

        if (targetElement) {
          ttsText += targetElement.dataset.text || "";
          handleText(ttsText);
          targetElement.focus();
        }
      };

      // const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      // if (arrowKeys.includes(key)) {
        const focusableItems = Array.from(
          sections[focusableSections[currentSectionIndex]]?.current.querySelectorAll(
            "button"
          ) || []
        );
        const currentItemIndex = focusableItems.indexOf(activeElement);
        // currentPage는 이미 Context에서 가져옴
        switch (key) {
          case "ArrowUp":
            if (currentSectionIndex > 0) moveFocus(currentSectionIndex - 1);
            else{ handleText('이전 영역이 없습니다.', false);}
            break;
 
          case "ArrowDown":
            if (currentSectionIndex < focusableSections.length - 1) moveFocus(currentSectionIndex + 1);
            else handleText('다음 영역이 없습니다.', false);
            break;

          case "ArrowLeft":
            if (currentItemIndex > 0) {
              moveFocus(currentSectionIndex, currentItemIndex - 1);
            } else if (currentSectionIndex > 0) {
              moveFocus(currentSectionIndex - 1, 0, true);
            } else {
              handleText('이전 영역이 없습니다.', false);
            }
            break;

          case "ArrowRight":
            if (currentItemIndex < focusableItems.length - 1) {
              moveFocus(currentSectionIndex, currentItemIndex + 1);
            } else if (currentSectionIndex < focusableSections.length - 1) {
               moveFocus(currentSectionIndex + 1);
            } else{
              handleText('다음 영역이 없습니다.', false);
            }
            break;

          case "Home": // 처음으로
            // 모달창 열려 있을 때 블락
            if(isReturnModal || isAccessibilityModal || isDeleteCheckModal || isDeleteModal || isResetModal || isCallModal){
              handleText('홈, 진행 중인 작업이 있어 이동 할 수 없습니다');
              return;
            }
            if(currentPage === 'forth' && isCreditPayContent > 2){ // 결제 전 단계까지 가능
              handleText('홈, 결제 과정에 진입하여 이동할 수 없습니다.');
              return;
            }
            handleText('홈, ');
            if(document.activeElement) document.activeElement.blur();
            setTimeout(()=>{
              if(currentPage !== 'first' && currentPage !== ''){
                  // // 모달창 끄기
                  // setisReturnModal(false);
                  // setisResetModal(false);
                  // setisDeleteModal(false);
                  // setisDeleteCheckModal(false);
                  // setisCallModal(false);
                  // setisAccessibilityModal(false)
                  // setQuantities(
                  //   totalMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
                  // );
                  
                  // // 초기설정
                  // setisHighContrast(false);
                  // setVolume(1);
                  // setisBigSize(false);
                  // setisLowScreen(false);
                  // navigate("/");
                  setisReturnModal(true);
              }else{
                handleText(commonScript.intro);
              }
            }, 300);
            
            break;
          
          case "*": // 키패드 사용법
            const keypadScript = '키패드 사용법,상 하 버튼으로 탐색 영역을 이동할 수 있습니다,좌 우 버튼으로 초점을 이동할 수 있습니다,동그라미 버튼으로 초점의 대상을 실행 또는 선택할 수 있습니다,홈 버튼으로 시작단계에서 음성유도 안내를 다시 듣거나, 작업 중인 경우 모든 선택을 취소하고 시작단계로 돌아올 수 있습니다,'
              + '뒤로 버튼으로 이전 작업단계로 이동 할 수 있습니다, 별 버튼으로 키패드 사용법을 재생할 수 있습니다, 샵 버튼으로 직전 안내를 다시 들을 수 있습니다,';
            handleText(keypadScript);
            break;
 
          case "#": //다시듣기
            handleReplayText();
            break;

          case "h": // 호출
            // 다른 모달 닫기
            setisReturnModal(false);
            setisResetModal(false);
            setisDeleteModal(false);
            setisDeleteCheckModal(false);
            setisAccessibilityModal(false);
            // 호출 모달 열기
            setisCallModal(true);
            break;

          // case "Enter": 
          //   event.preventDefault();
          //   if(event.target.classList.contains('summary-btn')&&
          //      event.target.classList.contains('disabled')){
          //     handleText('메뉴를 선택하세요.');
          //     return;
          //   }
          //   // if(event.target.classList.contains('menu-item')&&
          //   //    event.target.classList.contains('disabled')){
          //   //   handleText('없는 상품입니다.');
          //   //   return;
          //   // }

          //   if(event.target.classList.contains('select-btn')){
          //     handleText('선택, ', false);
          //   }else{
          //     handleText('실행, ', false);
          //   }
          //   setTimeout(() => {
          //     event.target.click(); 
          //   }, 500); // 0.5초 지연
          //   break;

          case "Backspace": // 뒤로가기
            // 모달창 열려 있을 때 블락
            if(isReturnModal || isAccessibilityModal || isDeleteCheckModal || isDeleteModal || isResetModal || isCallModal){
              handleText('뒤로, 진행 중인 작업이 있어 이동 할 수 없습니다');
              return;
            }
            if(currentPage === 'forth' && isCreditPayContent > 2){ // 결제 전 단계까지 가능
              handleText('뒤로, 결제 과정에 진입하여 이동할 수 없습니다.');
              return;
            }
            handleText('뒤로, ');
            if(currentPage === 'first' || currentPage === ''){
              // handleText('홈 화면입니다. 뒤로갈 수 없습니다.');
              return;
            }
            setTimeout(()=>{
              // 모든 모달창 닫기 : 안씀
              // setisReturnModal(false);
              // setisAccessibilityModal(false);
              // setisDeleteCheckModal(false);
              // setisDeleteModal(false);
              // setisResetModal(false);
              // setisCallModal(false);

              if(currentPage === 'forth' && [1,2].includes(isCreditPayContent)){
                setisCreditPayContent(0);
              }else{
                goBack(); // 히스토리에서 이전 페이지로 이동
              }

            }, 300);
            break;

          default:
            break;
        }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusableSections, firstButtonSection]);
  
  return {updateFocusableSections};
};