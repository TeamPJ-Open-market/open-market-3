/* ======================
   📦 공통 데이터 조회
====================== */

// 세션에 저장된 주문 데이터
function getOrderData() {
  return JSON.parse(sessionStorage.getItem("orderData")) || [];
}

// 수령자 휴대폰 번호 합치기
function getReceiverPhone() {
  const p1 = document.getElementById("order-phone1").value;
  const p2 = document.getElementById("order-phone2").value;
  const p3 = document.getElementById("order-phone3").value;
  return `${p1}${p2}${p3}`;
}

// 주소
function getAddress() {
  return document.getElementById("address").value.trim();
}

// 배송 메세지
function getAddressMessage() {
  return document.getElementById("address-message").value.trim();
}
/* ======================
   🛒 상품 관련 API
====================== */

// 상품 단건 조회 (바로구매용)
async function fetchProductById(productId) {
  const res = await Utils.fetchWithAuth(`/products/${productId}`);
  if (!res.ok) throw new Error("상품 조회 실패");
  return res.json();
}
/* ======================
   💰 가격 계산
====================== */

async function calculateOrderPrice(orderItems) {
  let productTotal = 0;
  let deliveryTotal = 0;

  for (const item of orderItems) {
    const product = await fetchProductById(item.product_id);

    const price = Number(product.price) || 0;
    const shippingFee = Number(product.shipping_fee) || 0;
    const quantity = Number(item.quantity) || 0;

    productTotal += price * quantity;
    deliveryTotal += shippingFee;
  }

  return {
    productTotal,
    deliveryTotal,
    finalTotal: productTotal + deliveryTotal,
  };
}
/* ======================
   🖥 장바구니 렌더링
====================== */

async function renderCart(cart) {
  const orderList = document.getElementById("order-list");

  if (cart.length === 0) {
    orderList.innerHTML = "<p>장바구니가 비어 있습니다.</p>";
    return;
  }

  orderList.innerHTML = "";

  for (const item of cart) {
    const product = item.product || (await fetchProductById(item.product_id));
    const quantity = Number(item.quantity);
    const itemTotal = product.price * quantity;

    const row = document.createElement("div");
    row.className = "order-item";

    row.innerHTML = `
      <div class="product-box">
        <img src="${product.image || "./images/product3.png"}" />
        <div>
          <p>${product.name}</p>
          <span>수량 : ${quantity}개</span>
        </div>
      </div>
      <div>${itemTotal.toLocaleString()}원</div>
    `;

    orderList.appendChild(row);
  }

  updatePriceUI(cart);
}
/* ======================
   💳 결제 금액 UI
====================== */

async function updatePriceUI(cart) {
  const { productTotal, deliveryTotal, finalTotal } = await calculateOrderPrice(
    cart
  );

  document.querySelector(".price-list li:nth-child(1) strong").textContent =
    productTotal.toLocaleString() + "원";

  document.querySelector(".price-list li:nth-child(2) strong").textContent =
    "0원";

  document.querySelector(".price-list li:nth-child(3) strong").textContent =
    deliveryTotal.toLocaleString() + "원";

  document.querySelector(".final-payment .total-price strong").textContent =
    finalTotal.toLocaleString() + "원";
}
/* ======================
   📤 주문 데이터 생성
====================== */

async function buildOrderData() {
  const orderItems = getOrderData();
  const isDirect = orderItems[0].order_type === "direct_order";

  const { finalTotal } = await calculateOrderPrice(orderItems);

  return {
    receiver: document.getElementById("receiver-name").value.trim(),
    receiver_phone_number: getReceiverPhone(),
    address: getAddress(),
    address_message: getAddressMessage(),
    total_price: finalTotal,
    payment_method: document.querySelector('input[name="payment"]:checked')
      ?.value,
    order_type: isDirect ? "direct_order" : "cart_order",
    cart_items: orderItems.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
    })),
  };
}
