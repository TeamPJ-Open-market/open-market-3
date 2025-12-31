// 1. URL에서 product_id 추출 (장바구니에 넣을 상품 = 이 id의 상품)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
const quantity = 1; // 기본 수량 설정

// 2. GET /api/products/:product_id 호출하여 상세 정보 표시
// 장바구니 및 주문에 사용되는 데이터의 신뢰성을 위해
// URL에서 받은 id로 서버에서 상품 정보를 다시 조회하는 것.
async function fetchProduct() {
  const response = await fetch(
    `http://localhost:3000/api/products/${productId}`
  );
  return response.json();
}

// 3. "바로 구매" 클릭 시
async function handleDirectOrder() {
  const product = await fetchProduct();

  const orderData = [
    {
      order_type: "direct_order",
      product_id: product.id,
      quantity: quantity,
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

// 4. 장바구니 담기
async function handleAddToCart() {
  const product = await fetchProduct();

  await fetch("http://localhost:3000/api/cart/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: product.id,
      quantity: quantity,
    }),
  });

  sessionStorage.setItem(
    "cartMessage",
    JSON.stringify({ message: "장바구니에 담았습니다" })
  );

  alert("장바구니에 담았습니다");
}
