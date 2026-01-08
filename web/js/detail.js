// ========================================
// 1. 상수 / 환경 설정

// 최대 구매 가능 상품 수량
const MAX_QUANTITY = 99;

// ========================================
// 2. URL 파라미터

// URL에서 product_id 추출 (장바구니에 넣을 상품 = 이 id의 상품)

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// ========================================
// 3. DOM 요소

// 상품 정보 표시
const productImage = document.getElementById("product-image");
const productBrand = document.getElementById("product-brand");
const productTitle = document.getElementById("product-title");
const productPrice = document.getElementById("product-price");

// 수량 선택 및 총 금액 표시
const quantityInput = document.getElementById("quantity-input");
const quantityDecreaseBtn = document.getElementById("quantity-decrease");
const quantityIncreaseBtn = document.getElementById("quantity-increase");
const totalQuantityEl = document.getElementById("total-quantity");
const totalPriceEl = document.getElementById("total-price");

// 버튼들
const purchaseButton = document.getElementById("btn-purchase");
const addCartButton = document.getElementById("btn-add-cart");

// 상품 상세 탭 영역 표시
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// ========================================
// 4. 상태 변수

// API에서 한 번 받아온 데이터 저장
let currentProduct = null;

// ========================================
// 5. 탭 UI 로직

// 상품 로직과 완전히 독립
// 화면 전환 + 접근성만 담당

function activateTab(button) {
  const tabName = button.getAttribute("data-tab");

  // 모든 탭 비활성화
  tabButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
    btn.setAttribute("tabindex", "-1");
  });

  tabContents.forEach((content) => {
    content.classList.remove("active");
    content.setAttribute("hidden", "");
  });

  // 선택된 탭 활성화
  button.classList.add("active");
  button.setAttribute("aria-selected", "true");
  button.setAttribute("tabindex", "0");
  button.focus();

  const targetContent = document.getElementById(`${tabName}-content`);
  targetContent.classList.add("active");
  targetContent.removeAttribute("hidden");
}

// 클릭 이벤트
tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button));
});

// 키보드 네비게이션
tabButtons.forEach((button, index) => {
  button.addEventListener("keydown", (e) => {
    let targetIndex;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        targetIndex = index === 0 ? tabButtons.length - 1 : index - 1;
        activateTab(tabButtons[targetIndex]);
        break;

      case "ArrowRight":
        e.preventDefault();
        targetIndex = index === tabButtons.length - 1 ? 0 : index + 1;
        activateTab(tabButtons[targetIndex]);
        break;

      case "Home":
        e.preventDefault();
        activateTab(tabButtons[0]);
        break;

      case "End":
        e.preventDefault();
        activateTab(tabButtons[tabButtons.length - 1]);
        break;
    }
  });
});

// ========================================
// 6. 상품 상세 조회

// 상품 정보, 상세 조회 + 화면 렌더링

async function loadProduct() {
  try {
    const response = await Utils.fetchWithAuth(`/products/${productId}`);
    const data = await response.json();
    currentProduct = data;

    // 화면 렌더링
    productImage.src = data.image;
    productImage.alt = data.name;
    // info: 기획상 브랜드/회사명 문구로 사용
    productBrand.textContent = data.info;
    productTitle.textContent = data.name;
    productPrice.textContent = Utils.formatNumber(data.price);

    // 최초 총 수량 / 총 금액 계산
    updateOrderSummary();
  } catch (error) {
    Modal.open({
      message: "상품 정보를 불러오는 중 오류가 발생했습니다.",
      cancelText: "",
    });
  }
}

// 페이지 진입 시 실행
loadProduct();

// ========================================
// 7. 수량 / 총 금액

// 수량 가져오는 공통 함수 (최소/최대 제한)

function setQuantity(nextValue) {
  let value = Number(nextValue);

  if (Number.isNaN(value)) value = 1; // 문자 입력 X → 1
  if (value < 1) value = 1; // 음수 X → 1
  if (value > MAX_QUANTITY) value = MAX_QUANTITY; // 99로 고정

  quantityInput.value = value;
  updateOrderSummary();
}

// “읽기 전용”으로 유지
function getQuantity() {
  return Number(quantityInput.value) || 1;
}

// 7-1. 수량 변경 이벤트 핸들러

// - 버튼
quantityDecreaseBtn.addEventListener("click", () => {
  setQuantity(getQuantity() - 1);
});

// + 버튼
quantityIncreaseBtn.addEventListener("click", () => {
  setQuantity(getQuantity() + 1);
});

// input 직접 수정 시
quantityInput.addEventListener("input", () => {
  setQuantity(quantityInput.value);
});

// 7-2. 총 수량 / 총 금액 업데이트 함수

function updateOrderSummary() {
  if (!currentProduct) return;

  const quantity = getQuantity();
  totalQuantityEl.textContent = quantity;
  totalPriceEl.textContent = Utils.formatNumber(
    currentProduct.price * quantity
  );
}

// ========================================
// 8. 공통 검증

// 버튼 클릭시 로그인 여부 판단 함수 (공통 검증 함수 활용: Utils)

function validateBeforeAction() {
  if (!Utils.isLoggedIn()) {
    Modal.open({
      message: "로그인이 필요합니다. 로그인 페이지로 이동할까요?",
      confirmText: "로그인",
      cancelText: "취소",
      onConfirm: () => {
        window.location.href =
          // 로그인하고 다시 돌아올 때를 위해 productId 포함
          "signin.html?redirect=detail.html?id=" + productId;
      },
    });
    return false;
  }

  // 상품 정보 로드 여부 확인
  if (!currentProduct) {
    Modal.open({
      message: "상품 정보를 받지 못했습니다.",
      cancelText: "",
    });
    return false;
  }

  return true;
}

// ========================================
// 9. sessionStorage 저장 함수

// DB가 source of truth
// sessionStorage는 화면 표시 / 페이지 이동용만 담당

function saveCartDataToSession(product, quantity) {
  const key = "cartData";
  const prev = JSON.parse(sessionStorage.getItem(key)) || [];

  const exist = prev.find((item) => item.product.id === product.id);

  if (exist) {
    exist.quantity += quantity;
  } else {
    prev.push({
      id: "temp", // cart.html에서 key용으로만 쓰면 문제 없음
      quantity,
      product: {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      },
    });
  }

  sessionStorage.setItem(key, JSON.stringify(prev));
}

// ========================================
// 10. "바로 구매" 클릭 시 로직

function handleDirectOrder() {
  const orderData = [
    {
      order_type: "direct_order",
      product_id: currentProduct.id,
      quantity: getQuantity(),
      // ... 기타 정보
    },
  ];

  sessionStorage.setItem("orderData", JSON.stringify(orderData));
  window.location.href = "order.html";
}

// ========================================
// 11. "장바구니" 클릭 시 로직

async function handleAddToCart() {
  // 장바구니는 DB 기준이니까
  // 상세 페이지에서 중복 체크 후 PUT/POST 분기가 필요

  try {
    // ① DB 장바구니 조회
    const res = await Utils.fetchWithAuth(`/cart/`, {});

    const data = await res.json();
    const cartItems = data.results;

    // ② 같은 상품 있는지 확인
    const existItem = cartItems.find(
      (item) => item.product.id === currentProduct.id
    );

    // DB 기준 저장
    // ③ 있으면 → PUT (수량 증가)
    if (existItem) {
      await Utils.fetchWithAuth(`/cart/${existItem.id}/`, {
        method: "PUT",
        body: JSON.stringify({
          quantity: existItem.quantity + getQuantity(),
        }),
      });
    }
    // ④ 없으면 → POST
    else {
      await Utils.fetchWithAuth(`/cart/`, {
        method: "POST",
        body: JSON.stringify({
          product_id: currentProduct.id,
          quantity: getQuantity(),
        }),
      });
    }

    // ⑤ sessionStorage 저장 (UI용)
    saveCartDataToSession(currentProduct, getQuantity());

    //  모달 표시
    Modal.open({
      message: "장바구니에 담았습니다.",
      confirmText: "장바구니 이동",
      cancelText: "",
      onConfirm: () => {
        window.location.href = "cart.html";
      },
    });
  } catch (error) {
    console.error(error);
    Modal.open({
      message: error.message || "장바구니 처리 중 오류가 발생했습니다.",
      cancelText: "",
    });
  }
}

// ========================================
// 12. 버튼 이벤트 리스너 등록

// 바로 구매 버튼
purchaseButton.addEventListener("click", () => {
  if (!validateBeforeAction()) return;
  handleDirectOrder();
});

// 장바구니 버튼
addCartButton.addEventListener("click", () => {
  if (!validateBeforeAction()) return;
  handleAddToCart();
});

// ========================================
// 장바구니 추가 시 DB를 먼저 저장을 한 뒤 sessionStorage는 화면/이동용으로만 동기화.
// 실제 수량의 최종 판단은 cart.html에서 DB 기준으로 다시 맞춘다.

// detail.js 역할
// - 상품 조회
// - 수량 선택
// - DB에 장바구니 반영
// - cart.html로 넘길 최소 데이터만 sessionStorage에 저장

// cart.html 역할
// - sessionStorage로 화면 먼저 그림
// - DB 장바구니 조회
// - sessionStorage 완전 덮어쓰기
// - 이후 모든 로직은 cartData 기준

// 수량 선택
// → 장바구니 클릭
// → DB 저장 (PUT / POST)
// → sessionStorage 저장 (DB 구조)
// → cart.html 이동
// → sessionStorage로 즉시 렌더링
// → DB 재조회
// → sessionStorage 덮어쓰기
