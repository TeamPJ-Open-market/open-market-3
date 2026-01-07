/* ==================================================
     공통 유틸 함수
   - 화면 / 저장소에서 값 가져오기
================================================== */

// sessionStorage에 저장된 주문 데이터 가져오기
function getOrderData() {
  const raw = JSON.parse(sessionStorage.getItem("orderData"));

  if (!raw) return [];

  // 1️. 장바구니 주문 (cart.js 구조)
  if (raw.items && Array.isArray(raw.items)) {
    return raw.items.map((item) => ({
      order_type: raw.order_kind || "cart_order",
      product_id: item.product.id,
      quantity: item.quantity,
      product: item.product,
    }));
  }

  // 2️. 바로구매 (정상 배열)
  if (Array.isArray(raw)) {
    return raw;
  }

  // 3️. 바로구매가 객체로 온 경우 (안전장치)
  if (raw.product_id && raw.quantity) {
    return [
      {
        order_type: raw.order_type || "direct_order",
        product_id: raw.product_id,
        quantity: raw.quantity,
      },
    ];
  }

  return [];
}

// 휴대폰 번호 3칸을 하나로 합치기
function getReceiverPhone() {
  const p1 = document.getElementById("order-phone1").value;
  const p2 = document.getElementById("order-phone2").value;
  const p3 = document.getElementById("order-phone3").value;
  return `${p1}${p2}${p3}`;
}

// 배송 주소
function getAddress() {
  return document.getElementById("address").value.trim();
}

// 배송 메세지
function getAddressMessage() {
  return document.getElementById("address-message").value.trim();
}

// 화면에 표시된 최종 결제 금액을 숫자로 가져오기
function calculateTotal() {
  const totalText = document
    .querySelector(".final-payment .total-price strong")
    .textContent.replace(/[^\d]/g, "");

  return Number(totalText);
}
/* ==================================================
     상품 API
================================================== */

// 상품 단건 조회 (바로구매용)
async function fetchProductById(productId) {
  const res = await Utils.fetchWithAuth(`/products/${productId}`);

  if (!res.ok) throw new Error("상품 조회 실패");

  return res.json();
}
/* ==================================================
     장바구니 렌더링
   - 상품 목록 출력
   - 가격 계산
================================================== */

async function renderCart(cart) {
  /* === 화면 요소 가져오기 === */
  const orderList = document.getElementById("order-list");

  const totalPriceEl = document.getElementById("total-price");

  const productAmountEl = document.querySelector(
    ".price-list li:nth-child(1) strong"
  );
  const discountAmountEl = document.querySelector(
    ".price-list li:nth-child(2) strong"
  );
  const deliveryAmountEl = document.querySelector(
    ".price-list li:nth-child(3) strong"
  );
  const finalAmountEl = document.querySelector(
    ".final-payment .total-price strong"
  );

  // 기존 목록 초기화
  orderList.innerHTML = "";
  let productTotal = 0;

  /* === 장바구니 비어있을 때 === */
  if (cart.length === 0) {
    orderList.innerHTML = "<p>장바구니가 비어 있습니다.</p>";
    totalPriceEl.textContent = "0원";
    return;
  }

  /* === 상품 하나씩 출력 === */
  for (const item of cart) {
    let product = item.product;

    // 바로구매인 경우: 서버에서 상품 조회
    if (!product && item.product_id) {
      product = await fetchProductById(item.product_id);
    }

    const price = Number(product?.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const itemTotal = price * quantity;

    productTotal += itemTotal;

    // 상품 한 줄 생성
    const row = document.createElement("div");
    row.className = "order-item";

    row.innerHTML = `
      <div class="col-info">
        <div class="product-box">
          <img src="${
            product?.image || "./images/product3.png"
          }" class="product-img" />
          <div class="product-text">
            <p class="col-brand text-size-sm">${
              product?.info || "회사명 없음"
            }</p>
            <p class="col-name text-size-md">${
              product?.name || "상품명 없음"
            }</p>
            <p class="col-qty text-size-sm">수량 : ${quantity}개</p>
          </div>
        </div>
      </div>
      <div class="col-discount">-</div>
      <div class="col-delivery">무료배송</div>
      <div class="col-price">${itemTotal.toLocaleString()}원</div>
    `;

    orderList.appendChild(row);
  }

  totalPriceEl.textContent = productTotal.toLocaleString() + "원";

  /* === 금액 계산 & 표시 === */
  const discount = 0;
  const delivery = 0;
  const finalTotal = productTotal - discount + delivery;

  productAmountEl.textContent = productTotal.toLocaleString() + "원";
  discountAmountEl.textContent = discount.toLocaleString() + "원";
  deliveryAmountEl.textContent = delivery.toLocaleString() + "원";
  finalAmountEl.textContent = finalTotal.toLocaleString() + "원";
}
/* ==================================================
     결제 동의 & 버튼 제어
================================================== */

const agreeCheckbox = document.querySelector(".agree input");
const payBtn = document.querySelector(".pay-btn");

payBtn.disabled = true;

// 동의 체크 시 버튼 활성화
agreeCheckbox.addEventListener("change", () => {
  payBtn.disabled = !agreeCheckbox.checked;
  payBtn.classList.toggle("active", agreeCheckbox.checked);
});
payBtn.addEventListener("click", async () => {
  // 1️. 결제 동의 확인
  if (!agreeCheckbox.checked) {
    alert("결제 동의가 필요합니다.");
    return;
  }

  // 2️. 폼 검증
  if (!validateOrderForm()) return;

  // 3️. 주문 데이터 생성
  const requestBody = await buildOrderData();

  try {
    // 4️. 서버로 주문 요청
    const res = await requestOrder(requestBody);

    if (res.ok) {
      alert("구매가 완료되었습니다!");

      sessionStorage.clear();

      window.location.href = PAGES.HOME;
    } else if (res.status === 400) {
      alert("입력한 정보를 다시 확인해주세요.");
    } else if (res.status === 401) {
      alert("로그인이 필요합니다.");
    } else {
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  } catch (err) {
    console.error(err);
    alert("서버 연결에 실패했습니다.");
  }
});

/* ==================================================
    페이지 초기화, 우편번호 조회
================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const cartData = getOrderData();
  await renderCart(cartData);
  fillOrdererInfoFromLocal();

  //  우편번호 버튼 이벤트
  const postBtn = document.querySelector(".btn-post");
  if (postBtn) {
    postBtn.addEventListener("click", () => {
      alert("우편번호 팝업창입니다.");
    });
  }
});

/* ==================================================
    주문자 정보 자동 입력
================================================== */

function fillOrdererInfoFromLocal() {
  const userData = localStorage.getItem("user");
  if (!userData) return;

  const user = JSON.parse(userData);

  const nameInput = document.getElementById("orderer-name");
  nameInput.value = user.name || "";
  nameInput.readOnly = true;

  const emailInput = document.getElementById("orderer-email");
  emailInput.value = user.username || "";
  emailInput.readOnly = true;

  if (user.phone_number) {
    const phone = user.phone_number.replace(/-/g, "");

    const p1 = document.getElementById("order-phone1");
    const p2 = document.getElementById("order-phone2");
    const p3 = document.getElementById("order-phone3");

    p1.value = phone.slice(0, 3);
    p2.value = phone.slice(3, 7);
    p3.value = phone.slice(7, 11);

    p1.readOnly = true;
    p2.readOnly = true;
    p3.readOnly = true;
  }
}
/* ==================================================
    주문 폼 검증
================================================== */

function validateOrderForm() {
  const name = document.getElementById("orderer-name")?.value.trim();
  const email = document.getElementById("orderer-email")?.value.trim();

  if (!agreeCheckbox.checked) {
    alert("결제 동의가 필요합니다.");
    return false;
  }

  if (!name || !email) {
    alert("주문자 정보를 확인해주세요.");
    return false;
  }

  if (!/^010\d{8}$/.test(getReceiverPhone())) {
    alert("휴대폰 번호를 정확히 입력해주세요.");
    return false;
  }

  if (!getAddress()) {
    alert("배송 주소를 입력해주세요.");
    return false;
  }

  const paymentChecked = document.querySelector(
    'input[name="payment"]:checked'
  );

  if (!paymentChecked) {
    alert("결제수단을 선택해주세요.");
    return false;
  }

  return true;
}
/* ==================================================
    주문 요청
================================================== */

async function requestOrder(orderData) {
  console.log("보내는 주문 데이터:", orderData);
  const res = await Utils.fetchWithAuth(`/order/`, {
    method: "POST",
    body: JSON.stringify(orderData),
  });

  return res;
}

/* ==================================================
    서버로 보낼 주문 데이터 생성
================================================== */

async function buildOrderData() {
  const orderItems = getOrderData();

  if (orderItems.length === 0) {
    alert("주문할 상품 정보가 없습니다.");
    throw new Error("orderItems is empty");
  }

  const firstItem = orderItems[0];
  const isDirect = firstItem.order_type === "direct_order";

  let priceSum = 0;
  let deliverySum = 0;

  for (const item of orderItems) {
    const product = await fetchProductById(item.product_id);

    const price = Number(product.price) || 0;
    const shippingFee = Number(product.shipping_fee) || 0;
    const quantity = Number(item.quantity) || 0;
    priceSum += price * quantity;
    deliverySum += shippingFee;
  }
  const calculatedTotal = priceSum;
  console.log(calculatedTotal);
  const finalOrderData = {
    receiver:
      document.getElementById("receiver-name")?.value.trim() || "이름 없음",
    receiver_phone_number: getReceiverPhone(),
    address: document.getElementById("address")?.value.trim() || "주소 미입력",
    address_message:
      document.getElementById("address-message")?.value.trim() || "",
    total_price: calculatedTotal,
    payment_method:
      document.querySelector('input[name="payment"]:checked')?.value || "card",
    order_type: isDirect ? "direct_order" : "cart_order",
    cart_items: orderItems.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
    })),
  };
  if (isDirect) {
    finalOrderData.product_id = Number(firstItem.product_id);
    finalOrderData.quantity = Number(firstItem.quantity);
  }

  console.log("서버로 보내는 최종 데이터:", finalOrderData);
  return finalOrderData;
}
