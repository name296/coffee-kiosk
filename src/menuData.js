// ============================================================================
// 메뉴 데이터 - 네스티드 구조
// ID는 배열 인덱스 기반으로 자동 생성
// ============================================================================

const categories = [
  {
    name: "전체메뉴",
    items: [], // 전체메뉴는 모든 카테고리 아이템 합산
  },
  {
    name: "커피",
    items: [
      { name: "아메리카노 (아이스)", price: "2500", img: "item-americano.png" },
      { name: "콜드브루 디카페인", price: "2900", img: "item-cold-brew.png" },
      { name: "콜드브루 (아이스)", price: "2500", img: "item-cold-brew.png" },
      { name: "카라멜 마끼아또", price: "3000", img: "item-vanilla-latte.png" },
      { name: "아메리카노 (아이스)", price: "2500", img: "item-americano.png" },
      { name: "콜드브루 디카페인", price: "2900", img: "item-cold-brew.png" },
      { name: "콜드브루 (아이스)", price: "2500", img: "item-cold-brew.png" },
      { name: "카라멜 마끼아또", price: "3000", img: "item-vanilla-latte.png" },
      { name: "아메리카노 (아이스)", price: "2500", img: "item-americano.png" },
      { name: "콜드브루 디카페인", price: "2900", img: "item-cold-brew.png" },
      { name: "콜드브루 (아이스)", price: "2500", img: "item-cold-brew.png" },
      { name: "카라멜 마끼아또", price: "3000", img: "item-vanilla-latte.png" },
      { name: "아메리카노 (아이스)", price: "2500", img: "item-americano.png" },
      { name: "콜드브루 디카페인", price: "2900", img: "item-cold-brew.png" },
      { name: "콜드브루 (아이스)", price: "2500", img: "item-cold-brew.png" },
      { name: "카라멜 마끼아또", price: "3000", img: "item-vanilla-latte.png" },
      { name: "아메리카노 (아이스)", price: "2500", img: "item-americano.png" },
      { name: "콜드브루 디카페인", price: "2900", img: "item-cold-brew.png" },
      { name: "콜드브루 (아이스)", price: "2500", img: "item-cold-brew.png" },
      { name: "카라멜 마끼아또", price: "3000", img: "item-vanilla-latte.png" },
    ],
  },
  {
    name: "밀크티",
    items: [],
  },
  {
    name: "스무디",
    items: [],
  },
  {
    name: "차",
    items: [],
  },
  {
    name: "주스",
    items: [],
  },
  {
    name: "라떼",
    items: [
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
    ],
  },
  {
    name: "라떼",
    items: [
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
    ],
  },
  {
    name: "라떼",
    items: [
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
    ],
  },
  {
    name: "라떼",
    items: [
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
    ],
  },
  {
    name: "라떼",
    items: [
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
    ],
  },
  {
    name: "라떼",
    items: [
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "흑당라떼", price: "2500", img: "item-brown-sugar-latte.png" },
      { name: "딸기라떼", price: "2500", img: "item-strawberry-latte.png" },
      { name: "미숫가루 달고나라떼", price: "2500", img: "item-dalgona-latte.png" },
      { name: "바닐라라떼 (아이스)", price: "2500", img: "item-vanilla-latte.png" },
      { name: "딸기라떼 (아이스)", price: "2500", img: "item-strawberry-latte.png" },
      { name: "녹차라떼", price: "2800", img: "item-dalgona-latte.png" },
      { name: "헤이즐넛라떼", price: "2900", img: "item-cold-brew.png" },
    ],
  },
  {
    name: "버블티",
    items: [],
  },
  {
    name: "에이드",
    items: [],
  },
  {
    name: "기타",
    items: [],
  },
];

// ============================================================================
// 헬퍼: 기존 구조 호환용 (ID 자동 생성)
// ============================================================================

// 카테고리 정보 (cate_id = 배열 인덱스)
const categoryInfo = categories.map((cat, index) => ({
  cate_id: index,
  cate_name: cat.name,
}));

// 전체 메뉴 리스트 (id, cate_id 자동 생성)
let menuId = 1;
const menuList = categories
  .map((cat, catIndex) => ({ ...cat, cate_id: catIndex }))
  .filter(cat => cat.cate_id !== 0) // 전체메뉴 제외
  .flatMap(cat =>
    cat.items.map(item => ({
      id: menuId++,
      cate_id: cat.cate_id,
      ...item,
    }))
  );

// ============================================================================
// Export
// ============================================================================

const menuData = {
  categories,    // 네스티드 구조 (ID 없음)
  categoryInfo,  // 기존 호환: [{ cate_id, cate_name }, ...]
  menuList,      // 기존 호환: [{ id, cate_id, name, price, img }, ...]
};

export default menuData;
