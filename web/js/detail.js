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
    const response = await fetch(
      `http://localhost:3000/api/products/${productId}`
    );

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
quantityInput.addEventListener("input", updateOrderSummary);

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
      message: "상품 정보가 아직 로드되지 않았습니다.",
      cancelText: "",
    });
    return false;
  }

  return true;
}

// "바로 구매" 클릭 시 로직
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
    const res = await fetch("http://localhost:3000/api/cart", {
      headers: Utils.getAuthHeaders(),
    });
    const data = await res.json();
    const cartItems = data.results;

    // 2️⃣ 같은 상품 있는지 확인
    const existItem = cartItems.find(
      (item) => item.product.id === currentProduct.id
    );

    // 3️⃣ 있으면 → PUT (수량 증가)
    if (existItem) {
      await fetch(`http://localhost:3000/api/cart/${existItem.id}/`, {
        method: "PUT",
        headers: Utils.getAuthHeaders(),
        body: JSON.stringify({
          product_id: currentProduct.id,
          quantity: existItem.quantity + getQuantity(),
          is_active: true,
        }),
      });
    }
    // 4️⃣ 없으면 → POST
    else {
      await fetch("http://localhost:3000/api/cart/", {
        method: "POST",
        headers: Utils.getAuthHeaders(),
        body: JSON.stringify({
          product_id: currentProduct.id,
          quantity: getQuantity(),
        }),
      });
    }

    // 5️⃣ 모달 표시
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

// 1. 버튼 클릭 시 로그인 여부를 먼저 판단하고,
// 2. 인증된 경우에만 로직 함수를 호출하도록 구조를 정리.
// 3. 각 함수는 하나의 책임만 가지도록 분리.

// 4. fetchProduct 함수를 만들어, 상품 정보를 서버에서 다시 조회하도록 변경.
//    - 이는 장바구니 및 주문에 사용되는 데이터의 신뢰성을 높이기 위함.
// 5. 불필요한 전역 변수를 제거하고, 함수 내에서 필요한 데이터를 처리하도록 수정.
// 6. 주석을 추가하여 코드의 의도를 명확히 함.
// 7. 중복된 로그인 체크 로직을 이벤트 리스너 내부로 이동하여 코드 중복 최소화.
// 8. alert 대신 모달 창을 사용하는 방식으로 사용자 경험 개선 고려 가능.

// 9. 에러 핸들링 추가 고려 (네트워크 오류, 서버 오류 등)
// 10. 수량 변경 기능 추가 고려 (현재는 고정된 수량 1로 설정)
// 11. 모달 창 구현 고려 (장바구니에 담았습니다 메시지 등)

// 로그인 여부를 판단하는 기준이 필요해 accessToken 존재 여부를 체크하는 공통 함수를 정의했다.
// 이후 모든 버튼 액션에서 동일한 기준으로 로그인 상태를 판단한다.

// 버튼의 역할에 따라
// 바로 구매는 order.html로,
// 장바구니는 cart.html로 분기 처리한다.
