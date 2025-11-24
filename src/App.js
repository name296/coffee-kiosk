import React, { useRef, createContext, useState, useEffect } from "react";
import FocusTrap from "focus-trap-react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import FirstPage from "./pages/FirstPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SecondPage from "./pages/SecondPage";
import ThirdPage from "./pages/ThirdPage";
import ForthPage from "./pages/ForthPage";
import { useTextHandler } from "./assets/tts";
import { updateTimer } from "./assets/timer";
import DeleteModal from "./components/DeleteModal";

export const AppContext = createContext();

const commonScript = {
  intro:
    "안녕하세요,장애인, 비장애인 모두 사용 가능한 무인주문기입니다,시각 장애인을 위한 음성 안내와 키패드를 제공합니다,키패드는 손을 아래로 뻗으면 닿는 조작부 영역에 있으며, 돌출된 점자 및 테두리로 자세한 위치를 파악할 수 있습니다,키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다,",
  replay:
    "키패드 사용법 안내는 키패드의 별 버튼을, 직전 안내 다시 듣기는 샵 버튼을 누릅니다,",
  return: "초기화면으로 돌아갑니다.",
};

export const AppProvider = ({ children }) => {
  const tabs = [
    "전체메뉴",
    "커피",
    "밀크티",
    "스무디",
    "차",
    "주스",
    "라떼",
    "버블티",
    "에이드",
    "기타",
  ];

  const totalMenuItems = [
    {
      id: 1,
      name: "아메리카노 (아이스)",
      price: "2500",
      img: getAssetPath("./public/images/item-아메리카노.svg"),
    },
    {
      id: 2,
      name: "바닐라라떼 (아이스)",
      price: "2500",
      img: getAssetPath("./public/images/item-바닐라라떼.svg"),
    },
    {
      id: 3,
      name: "콜드브루 디카페인",
      price: "2900",
      img: getAssetPath("./public/images/item-콜드브루.svg"),
    },
    { id: 4, name: "흑당라떼", price: "2500", img: getAssetPath("./public/images/item-흑당라떼.svg") },
    { id: 5, name: "딸기라떼", price: "2500", img: getAssetPath("./public/images/item-딸기라떼.svg") },
    {
      id: 6,
      name: "미숫가루 달고나라떼",
      price: "2500",
      img: getAssetPath("./public/images/item-달고나라떼.svg"),
    },
    {
      id: 7,
      name: "콜드브루 (아이스)",
      price: "2500",
      img: getAssetPath("./public/images/item-콜드브루.svg"),
    },
    {
      id: 8,
      name: "바닐라라떼 (아이스)",
      price: "2500",
      img: getAssetPath("./public/images/item-바닐라라떼.svg"),
    },
    {
      id: 9,
      name: "딸기라떼 (아이스)",
      price: "2500",
      img: getAssetPath("./public/images/item-딸기라떼.svg"),
    },
    {
      id: 10,
      name: "카라멜 마끼아또",
      price: "3000",
      img: getAssetPath("./public/images/item-바닐라라떼.svg"),
    },
    {
      id: 11,
      name: "녹차라떼",
      price: "2800",
      img: getAssetPath("./public/images/item-달고나라떼.svg"),
    },
    {
      id: 12,
      name: "헤이즐넛라떼",
      price: "2900",
      img: getAssetPath("./public/images/item-콜드브루.svg"),
    },
  ];
  const [selectedTab, setSelectedTab] = useState("전체메뉴");
  const categorizeMenu = (totalMenuItems) => {
    const categorizedMenu = {
      전체메뉴: totalMenuItems,
      커피: totalMenuItems.filter(
        (item) =>
          item.name.includes("아메리카노") ||
          item.name.includes("콜드브루") ||
          item.name.includes("마끼아또")
      ),
      라떼: totalMenuItems.filter((item) => item.name.includes("라떼")),
    };

    if (selectedTab === "전체메뉴") {
      return categorizedMenu.전체메뉴;
    } else if (selectedTab === "커피") {
      return categorizedMenu.커피;
    } else if (selectedTab === "라떼") {
      return categorizedMenu.라떼;
    } else
      return [
        {
          id: 13,
          name: "추가예정",
          price: "0",
          img: getAssetPath("./public/images/item-아메리카노.svg"),
        },
      ];
  };

  const menuItems = categorizeMenu(totalMenuItems);

  const [isHighContrast, setisHighContrast] = useState(false);
  const [isLowScreen, setisLowScreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isBigSize, setisBigSize] = useState(false);
  const [isCreditPayContent, setisCreditPayContent] = useState(0);
  const [quantities, setQuantities] = useState(
    menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );
  const [isReturnModal, setisReturnModal] = useState(false);
  const [isAccessibilityModal, setisAccessibilityModal] = useState(false);
  const [isResetModal, setisResetModal] = useState(false);
  const [isDeleteModal, setisDeleteModal] = useState(false);
  const [isDeleteCheckModal, setisDeleteCheckModal] = useState(false);
  const [isCallModal, setisCallModal] = useState(false);
  const [intervalTime, setintervalTime] = useState(0);
  const [introFlag, setintroFlag] = useState(true);
  // const [categoryInfo, setCategoryInfo] = useState(null);
  // const [menuList, setMenuList] = useState(null);

  const [accessibility, setAccessibility] = useState({
    isHighContrast: isHighContrast,
    isLowScreen: isLowScreen,
    isBigSize: isBigSize,
    volume: volume,
    //
  });

  // 메뉴 정보 가져오기
  // fetch('/menu_data.json')
  // .then(response => response.json())
  // .then(data => {
  //   setCategoryInfo(data.categoryInfo);
  //   setMenuList(data.menuList);
  // })
  // .catch(error => console.error('Error fetching data:', error));

  // 수량 증가
  const handleIncrease = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  // 수량 감소
  const handleDecrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const calculateSum = (quantities) => {
    return Number(
      Object.values(quantities).reduce((sum, value) => sum + value, 0)
    );
  };

  const calculateTotal = (quantities, menuItems) => {
    return Object.entries(quantities)
      .filter(([key, value]) => value !== 0)
      .reduce((sum, [key, value]) => {
        const priceObj = menuItems[key - 1];
        const price = priceObj ? priceObj.price : 0;
        return Number(sum) + Number(value) * Number(price);
      }, 0);
  };

  const totalCount = calculateSum(quantities);
  const totalSum = calculateTotal(quantities, totalMenuItems);

  const filterMenuItems = (menuItems, quantities) => {
    return menuItems.filter((item) => quantities[item.id] !== 0);
  };

  // 주문 정보를 생성
  const createOrderItems = (menuItems, quantities) => {
    return menuItems
      .filter((item) => quantities[item.id] !== 0) // 개수가 0이 아닌 메뉴만 필터링
      .map((item) => ({
        ...item,
        quantity: quantities[item.id], // 메뉴 정보에 수량을 추가
      }));
  };

  const { handleText } = useTextHandler(volume);
  const readCurrentPage = (newVolume) =>{
    const pageTts = document.querySelector('.hidden-btn.page-btn').dataset.text;
    handleText(pageTts, true, newVolume);
  }

  
  const convertToKoreanQuantity = (num) => {
    let number = parseInt(num)
    if (number < 1 || number > 999) return number;

    const units = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
    const tens = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
    const hundreds = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];

    if (number <= 9) {
        return units[number];
    }

    let numStr = number.toString();
    let result = "";

    if (numStr.length === 3) {
        let hundred = parseInt(numStr[0]);
        result += hundreds[hundred]; // 백의 자리 고유 표현 사용
        numStr = numStr.substring(1);
    }

    if (numStr.length === 2) {
        let ten = parseInt(numStr[0]);
        if (ten > 0) {
            result += tens[ten];
        }
        numStr = numStr.substring(1);
    }

    let one = parseInt(numStr[0]);
    if (one > 0) {
        result += units[one];
    }

    return result;
}

  useEffect(()=>{
    if(isHighContrast){
      document.querySelector('body').classList.add('high-contrast');
    }else{
      document.querySelector('body').classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  useEffect(()=>{

    if (isLowScreen) {
      document.querySelector('body').classList.add('low-mode');
    } else {
      document.querySelector('body').classList.remove('low-mode');
    }

  }, [isLowScreen]);

  useEffect(()=>{

    if (isBigSize) {
      document.documentElement.style.fontSize = '75%';
    } else {
      document.documentElement.style.fontSize = '62.5%';
    }

  }, [isBigSize]);



  const sections = {
    top: useRef(null),
    row1: useRef(null),
    row2: useRef(null),
    row3: useRef(null),
    row4: useRef(null),
    row5: useRef(null),
    row6: useRef(null),
    page: useRef(null),
    modalPage: useRef(null),
    middle: useRef(null),
    bottom: useRef(null),
    footer: useRef(null),
    bottomfooter: useRef(null),
    confirmSections: useRef(null),
    AccessibilitySections1: useRef(null),
    AccessibilitySections2: useRef(null),
    AccessibilitySections3: useRef(null),
    AccessibilitySections4: useRef(null),
    AccessibilitySections5: useRef(null),
    AccessibilitySections6: useRef(null),
  };

  return (
    <AppContext.Provider
      value={{
        accessibility,
        setAccessibility,
        isResetModal,
        setisResetModal,
        isDeleteModal,
        setisDeleteModal,
        isDeleteCheckModal,
        setisDeleteCheckModal,
        totalMenuItems,
        sections,
        isLowScreen,
        setisLowScreen,
        isHighContrast,
        setisHighContrast,
        isCreditPayContent,
        setisCreditPayContent,
        tabs,
        commonScript,
        menuItems,
        selectedTab,
        setSelectedTab,
        quantities,
        setQuantities,
        handleIncrease,
        handleDecrease,
        calculateSum,
        calculateTotal,
        totalCount,
        totalSum,
        convertToKoreanQuantity,
        filterMenuItems,
        createOrderItems,
        isReturnModal,
        setisReturnModal,
        isAccessibilityModal,
        setisAccessibilityModal,
        isCallModal,
        setisCallModal,
        intervalTime,
        setintervalTime,
        introFlag,
        setintroFlag,
        // categoryInfo,
        // menuList,
        volume,
        setVolume,
        isBigSize,
        setisBigSize,
        readCurrentPage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const LayoutWithFooterOnly = () => (
  <FocusTrap>
    <div className="wrap">
      <Outlet />
      <Footer />
    </div>
  </FocusTrap>
);
const LayoutWithHeaderAndFooter = () => (
  <FocusTrap>
    <div className="wrap">
      <Header />
      <Outlet />
      <Footer />
    </div>
  </FocusTrap>
);

// 라우터 설정
// basename: BASE_PATH 환경 변수로 명시적으로 설정 (개발/배포 모두 .env에서 관리)
// 빌드 시점에 process.env가 번들러에 의해 값으로 치환됨
const getBasename = () => {
  // 환경 변수 사용 (빌드 시 define으로 주입됨)
  // 개발 모드: process가 없으므로 빈 문자열
  // 빌드 모드: process.env.BASE_PATH가 실제 값으로 치환됨
  if (typeof process !== 'undefined' && process.env?.BASE_PATH) {
    return process.env.BASE_PATH;
  }
  return "";
};

// 정적 자원 경로 헬퍼 함수 (BASE_PATH 포함)
const getAssetPath = (path) => {
  const basePath = getBasename();
  // 이미 절대 경로인 경우 그대로, 상대 경로면 basePath 추가
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // ./public/... → /public/... 정규화
  const normalizedPath = path.replace(/^\.\//, '/');
  return `${basePath}${normalizedPath}`;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutWithFooterOnly />,
    children: [{ index: true, element: <FirstPage /> }],
  },
  {
    path: "/second",
    element: <LayoutWithHeaderAndFooter />,
    children: [{ index: true, element: <SecondPage /> }],
  },
  {
    path: "/third",
    element: <LayoutWithHeaderAndFooter />,
    children: [{ index: true, element: <ThirdPage /> }],
  },
  {
    path: "/forth",
    element: <LayoutWithHeaderAndFooter />,
    children: [{ index: true, element: <ForthPage /> }],
  },
], {
  basename: getBasename()
});

const App = () => {
  // tts api용 indexedDB 초기화
  const { initDB } = useTextHandler();
  useEffect(() => {
    const initializeDatabase = async () => {
      await initDB();
    };
    initializeDatabase();
  }, [initDB]);


  // 전역적으로 button click에 비프음 추가 (내부 요소에 pointer-events:none 추가하기)
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      updateTimer();
      if (
        target.tagName === "BUTTON" ||
        target.getAttribute("role") === "button"
      ) {
        // 마우스 또는 터치로 클릭된 경우만 실행
        if (event.detail !== 0) {
          document.querySelector("#beapSound").volume = 0.5;
          document.querySelector("#beapSound").play();
        }
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener('touchstart', function(e){
      e.target.classList.add('pressed');
    });
    document.addEventListener('touchend', function(e){
      e.target.classList.remove('pressed');
    });
    document.addEventListener("touchend", handleClick);
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault(); 
    });
   


  }, []);



  return (
    <AppProvider>
      <audio
        id="audioPlayer"
        src=""
        controls
        style={{
          width: "1px",
          height: "1px",
          position: "absolute",
          margin: "-1px",
          background: "none",
          border: "none",
          zIndex: -1,
        }}
      ></audio>
      <audio
        id="beapSound"
        src={getAssetPath("./public/sound/beap_sound2.mp3")}
        controls
        style={{
          width: "1px",
          height: "1px",
          position: "absolute",
          margin: "-1px",
          background: "none",
          border: "none",
          zIndex: -1,
        }}
      ></audio>
      <RouterProvider router={router} />
    </AppProvider>
  );
};

export default App;
