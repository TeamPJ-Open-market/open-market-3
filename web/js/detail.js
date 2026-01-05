console.log("🔥 detail.js 실행됨");

// ====================
// 1. 상수 / 환경 설정

// 회사 이름 -> UI 상수 (기획 고정값)
const BRAND_NAME = "백엔드글로벌";

// API Base URL (로컬 / 배포 분기)
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://open-market-jade.vercel.app/api";

// ====================
// 2. URL 파라미터

// URL에서 product_id 추출 (장바구니에 넣을 상품 = 이 id의 상품)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// ====================
// 3. DOM 요소

// 상품 정보 표시를 위한 DOM 요소들
const productImage = document.getElementById("product-image");
const productBrand = document.getElementById("product-brand");
const productTitle = document.getElementById("product-title");
const productPrice = document.getElementById("product-price");

// 수량 선택 및 총 금액 표시 DOM 요소들
const quantityInput = document.getElementById("quantity-input");
const quantityDecreaseBtn = document.getElementById("quantity-decrease");
const quantityIncreaseBtn = document.getElementById("quantity-increase");
const totalQuantityEl = document.getElementById("total-quantity");
const totalPriceEl = document.getElementById("total-price");

// 버튼들
const purchaseButton = document.getElementById("btn-purchase");
const addCartButton = document.getElementById("btn-add-cart");

// ====================
// 4. 상태 변수

// API에서 한 번 받아온 데이터 저장
let currentProduct = null;

// ====================
// 5. 상품 상세 조회

// 상품 정보, 상세 조회 + 화면 렌더링
async function loadProduct() {
  console.log("🟡 loadProduct 실행");

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) throw new Error("상품 조회 실패");

    const data = await response.json();
    console.log("🟢 상품 데이터:", data);

    currentProduct = data;

    // 화면 렌더링
    productImage.src = data.image;
    productImage.alt = data.name;
    // 회사 이름은 API가 아닌 기획 고정값
    productBrand.textContent = BRAND_NAME;
    productTitle.textContent = data.name;
    productPrice.textContent = `${Utils.formatNumber(data.price)}원`;

    // 최초 총 수량 / 총 금액 계산
    updateOrderSummary();
  } catch (error) {
    console.error("🔴 loadProduct 에러:", error);
    Modal.open({
      message: "상품 정보를 불러오는 중 오류가 발생했습니다.",
      cancelText: "",
    });
  }
}

// 페이지 진입 시 실행
loadProduct();

// ====================
// 6. 수량 / 총 금액

// 수량 가져오는 공통 함수
function getQuantity() {
  return Math.max(1, Number(quantityInput.value) || 1);
}

function updateOrderSummary() {
  if (!currentProduct) return;

  const quantity = getQuantity();
  totalQuantityEl.textContent = quantity;
  totalPriceEl.textContent = Utils.formatNumber(
    currentProduct.price * quantity
  );
}

// 수량 변경 이벤트 핸들러
// - 버튼
quantityDecreaseBtn.addEventListener("click", () => {
  if (getQuantity() > 1) {
    quantityInput.value = getQuantity() - 1;
    updateOrderSummary();
  }
});

// + 버튼
quantityIncreaseBtn.addEventListener("click", () => {
  quantityInput.value = getQuantity() + 1;
  updateOrderSummary();
});

// input 직접 수정 시
quantityInput.addEventListener("input", () => {
  quantityInput.value = getQuantity();
  updateOrderSummary();
});

// ====================
// 7. 공통 검증

// 버튼 클릭시 로그인 여부 판단 함수 (공통 검증 함수 활용: Utils)
function validateBeforeAction() {
  console.log("🟡 validateBeforeAction 실행");

  if (!Utils.isLoggedIn()) {
    console.log("🔴 로그인 안 됨");

    // 돌아올 페이지 저장
    localStorage.setItem("redirect_after_login", window.location.href);

    Modal.open({
      message: "로그인이 필요합니다. 로그인 페이지로 이동할까요?",
      confirmText: "로그인",
      cancelText: "취소",
      onConfirm: () => {
        window.location.href = "signin.html";
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

// ====================
// 8. sessionStorage 저장 함수

// ⚠️ DB가 source of truth
// sessionStorage는 화면 표시 / 페이지 이동용만 담당
function saveCartDataToSession(product, quantity) {
  const key = "cartData";
  const stored = sessionStorage.getItem(key);
  const cartData = stored ? JSON.parse(stored) : [];

  const existItem = cartData.find((item) => item.product_id === product.id);

  if (existItem) {
    // 누적 X → 현재 선택 수량만 반영
    existItem.quantity = quantity;
    existItem.total_price = existItem.quantity * existItem.price;
  } else {
    cartData.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.image,
      quantity,
      price: product.price,
      shipping_fee: 0,
      total_price: product.price * quantity,
    });
  }

  sessionStorage.setItem(key, JSON.stringify(cartData));
}

// ====================
// 9. "바로 구매" 클릭 시 로직

function handleDirectOrder() {
  console.log("🟢 handleDirectOrder 실행");

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

// TODO List
// "장바구니" 클릭 시
// 1. POST /api/cart/ 호출
// 2. 성공 시 sessionStorage에도 저장
// 3. 모달 표시 ("장바구니에 담았습니다") 후 cart.html 이동

// "장바구니" 클릭 시 로직
async function handleAddToCart() {
  console.log("🟢 handleAddToCart 실행");

  // 장바구니는 DB 기준이니까
  // 상세 페이지에서 중복 체크 후 PUT/POST 분기가 필요
  try {
    // 1️⃣ 내 장바구니 조회
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: Utils.getAuthHeaders(),
    });
    const data = await res.json();
    const cartItems = data.results;

    // 2️⃣ 같은 상품 있는지 확인
    const existItem = cartItems.find(
      (item) => item.product.id === currentProduct.id
    );

    // DB 기준 저장
    // 3️⃣ 있으면 → PUT (수량 증가)
    if (existItem) {
      await fetch(`${API_BASE_URL}/cart/${existItem.id}/`, {
        method: "PUT",
        headers: Utils.getAuthHeaders(),
        body: JSON.stringify({
          quantity: existItem.quantity + getQuantity(),
        }),
      });
    }
    // 4️⃣ 없으면 → POST
    else {
      await fetch(`${API_BASE_URL}/cart/`, {
        method: "POST",
        headers: Utils.getAuthHeaders(),
        body: JSON.stringify({
          product_id: currentProduct.id,
          quantity: getQuantity(),
        }),
      });
    }

    // 5️⃣ sessionStorage 저장 (UI용)
    saveCartDataToSession(currentProduct, getQuantity());

    // 6️⃣ 모달 표시
    Modal.open({
      message: "장바구니에 담았습니다.",
      confirmText: "장바구니 이동",
      cancelText: "",
      onConfirm: () => {
        window.location.href = "cart.html";
      },
    });
  } catch (error) {
    Modal.open({
      message: "장바구니 처리 중 오류가 발생했습니다.",
      cancelText: "",
    });
  }
}

// 버튼 이벤트 리스너 등록
// 바로 구매 버튼
purchaseButton.addEventListener("click", () => {
  console.log("👉 바로 구매 버튼 클릭됨");

  if (!validateBeforeAction()) return;
  handleDirectOrder();
});

// 장바구니 버튼
addCartButton.addEventListener("click", () => {
  console.log("👉 장바구니 버튼 클릭됨");

  if (!validateBeforeAction()) return;
  handleAddToCart();
});

// ====================
// 장바구니 추가 시 DB를 먼저 업데이트한 뒤 sessionStorage는 화면/이동용으로만 동기화.
// 실제 수량의 최종 판단은 cart.html에서 DB 기준으로 다시 맞춘다.
