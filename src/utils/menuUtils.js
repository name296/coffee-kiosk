import { getAssetPath } from './pathUtils';

export const tabs = [
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

export const totalMenuItems = [
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

export const categorizeMenu = (totalMenuItems, selectedTab) => {
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
  } else {
    return [
      {
        id: 13,
        name: "추가예정",
        price: "0",
        img: getAssetPath("./public/images/item-아메리카노.svg"),
      },
    ];
  }
};

export const calculateSum = (quantities) => {
  return Number(
    Object.values(quantities).reduce((sum, value) => sum + value, 0)
  );
};

export const calculateTotal = (quantities, menuItems) => {
  return Object.entries(quantities)
    .filter(([key, value]) => value !== 0)
    .reduce((sum, [key, value]) => {
      const priceObj = menuItems[key - 1];
      const price = priceObj ? priceObj.price : 0;
      return Number(sum) + Number(value) * Number(price);
    }, 0);
};

export const filterMenuItems = (menuItems, quantities) => {
  return menuItems.filter((item) => quantities[item.id] !== 0);
};

export const createOrderItems = (menuItems, quantities) => {
  return menuItems
    .filter((item) => quantities[item.id] !== 0) // 개수가 0이 아닌 메뉴만 필터링
    .map((item) => ({
      ...item,
      quantity: quantities[item.id], // 메뉴 정보에 수량을 추가
    }));
};

