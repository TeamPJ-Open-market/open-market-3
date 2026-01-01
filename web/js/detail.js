// URL에서 product_id 추출 (장바구니에 넣을 상품 = 이 id의 상품)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// 상품 정보 표시를 위한 DOM 요소들
const productImage = document.getElementById("product-image");
const productBrand = document.getElementById("product-brand");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productDelivery = document.getElementById("product-delivery");

const quantityInput = document.querySelector(".product-quantity input");

// API에서 한 번 받아온 데이터 저장
let currentProduct = null;

// 상품 정보, 상세 조회 + 화면 렌더링
async function loadProduct() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${productId}`
    );

    if (!response.ok) {
      throw new Error("상품 정보를 불러오지 못했습니다.");
    }

    const data = await response.json();
    currentProduct = data;

    // 화면 렌더링
    productImage.src = data.image;
    productImage.alt = data.name;
    productBrand.textContent = data.brand;
    productName.textContent = data.name;
    productPrice.textContent = data.price.toLocaleString();
    productDelivery.textContent = data.delivery;
  } catch (error) {
    console.error(error);
    alert("상품 정보를 불러오는 중 오류가 발생했습니다.");
  }
}

// 페이지 진입 시 실행
loadProduct();

// 로그인 여부 판단 함수
function isLoggedIn() {
  return !!localStorage.getItem("accessToken");
}

// 수량 관리
function getQuantity() {
  return Number(quantityInput.value);
}

// GET /api/products/:product_id 호출하여 상세 정보 표시
// 장바구니 및 주문에 사용되는 데이터의 신뢰성을 위해
// URL에서 받은 id로 서버에서 상품 정보를 다시 조회하는 것.
async function fetchProduct() {
  const response = await fetch(
    `http://localhost:3000/api/products/${productId}`
  );
  return response.json();
}

// "바로 구매" 클릭 시
function handleDirectOrder() {
  const orderData = [
    {
      order_type: "direct_order",
      product_id: product.id,
      quantity: quantity,

      // product_id: currentProduct.id,
      // quantity: getQuantity(),
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
// 3. 모달 표시 ("장바구니에 담았습니다")

// "장바구니" 클릭 시
async function handleAddToCart() {
  await fetch("http://localhost:3000/api/cart/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify({
      product_id: product.id,
      quantity: quantity,

      // product_id: currentProduct.id,
      // quantity: getQuantity(),
      // ... 기타 정보
    }),
  });

  alert("장바구니에 담았습니다");
  window.location.href = "cart.html";
}

// 이벤트 리스너 등록
// 바로 구매 버튼
document.querySelector(".btn-buy").addEventListener("click", () => {
  if (!isLoggedIn()) {
    window.location.href = "signin.html";
    return;
  }

  handleDirectOrder();
});
// 장바구니 버튼
document.querySelector(".btn-cart").addEventListener("click", () => {
  if (!isLoggedIn()) {
    window.location.href = "signin.html";
    return;
  }

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

// 12. CSS 변수 이름 오타 수정 (positive-text-colo -> positive-text-color)
// 13. 버튼 스타일 개선 (배경색 및 테두리 색상 변경, 좌우 버튼 모서리 둥글게 처리)
// 14. 불필요한 CSS 속성 제거 (배경색 #fff 제거)
// 15. CSS 변수 사용으로 일관된 테마 적용
// 16. CSS 클래스명 명확화 (btn-left, btn-right)

// 로그인 여부를 판단하는 기준이 필요해 accessToken 존재 여부를 체크하는 공통 함수를 정의했다.
// 이후 모든 버튼 액션에서 동일한 기준으로 로그인 상태를 판단한다.

// 버튼의 역할에 따라
// 바로 구매는 order.html로,
// 장바구니는 cart.html로 분기 처리한다.
