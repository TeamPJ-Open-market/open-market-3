function getOrderData() {
  return JSON.parse(sessionStorage.getItem("orderData")) || [];
}

function getReceiverPhone() {
  const p1 = document.getElementById("order-phone1").value;
  const p2 = document.getElementById("order-phone2").value;
  const p3 = document.getElementById("order-phone3").value;
  return `${p1}${p2}${p3}`;
}

function getAddress() {
  return document.getElementById("address").value.trim();
}

function getAddressMessage() {
  return document.getElementById("address-message").value.trim();
}

function calculateTotal() {
  const totalText = document
    .querySelector(".final-payment .total-price strong")
    .textContent.replace(/[^\d]/g, "");
  return Number(totalText);
}

// 🔹 상품 단건 조회 (바로구매 대응)
async function fetchProductById(productId) {
  const res = await Utils.fetchWithAuth(`/products/${productId}`);
  if (!res.ok) throw new Error("상품 조회 실패");
  return res.json();
}

async function renderCart(cart) {
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

  orderList.innerHTML = "";
  let productTotal = 0;

  if (cart.length === 0) {
    orderList.innerHTML = "<p>장바구니가 비어 있습니다.</p>";
    totalPriceEl.textContent = "0원";
    return;
  }

  for (const item of cart) {
    let product = item.product;

    // 🔴 바로구매인 경우 (product 없음)
    if (!product && item.product_id) {
      product = await fetchProductById(item.product_id);
    }

    const price = Number(product?.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const itemTotal = price * quantity;
    productTotal += itemTotal;

    const row = document.createElement("div");
    row.className = "order-item";

    row.innerHTML = `
      <div class="col-info">
        <div class="product-box">
          <img src="${
            product?.image || "./images/product3.png"
          }" class="product-img" />
          <div class="product-text">
            <p class="name">${product?.name || "상품명 없음"}</p>
            <span class="qty">수량 : ${quantity}개</span>
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

  const discount = 0; // 추후 쿠폰 가능
  const delivery = 0; // 무료배송
  const finalTotal = productTotal - discount + delivery;

  productAmountEl.textContent = productTotal.toLocaleString() + "원";
  discountAmountEl.textContent = discount.toLocaleString() + "원";
  deliveryAmountEl.textContent = delivery.toLocaleString() + "원";
  finalAmountEl.textContent = finalTotal.toLocaleString() + "원";
}

/* ===== 결제 동의 / 버튼 ===== */
const agreeCheckbox = document.querySelector(".agree input");
const payBtn = document.querySelector(".pay-btn");

payBtn.disabled = true;

agreeCheckbox.addEventListener("change", () => {
  // 🔹 검증식: 결제 동의 여부 확인
  payBtn.disabled = !agreeCheckbox.checked;
  payBtn.classList.toggle("active", agreeCheckbox.checked);
});

payBtn.addEventListener("click", async () => {
  // 🔹 검증식: 결제 동의 체크 확인
  if (!agreeCheckbox.checked) {
    alert("결제 동의가 필요합니다.");
    return;
  }

  // 🔹 검증식: 주문 폼 필수 항목 확인
  if (!validateOrderForm()) return;

  const requestBody = await buildOrderData();

  try {
    const res = await requestOrder(requestBody);

    if (res.ok) {
      alert("🎉 구매가 완료되었습니다!");
      sessionStorage.removeItem("orderData");
      if (requestBody.order_type === "cart_order") {
        sessionStorage.removeItem("cartData");
      }
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

/* 우편번호 버튼 */
document.querySelector(".btn-post").addEventListener("click", () => {
  alert("우편번호 조회");
});

/* 페이지 로드 */
document.addEventListener("DOMContentLoaded", async () => {
  const cartData = getOrderData();
  await renderCart(cartData);
  fillOrdererInfoFromLocal();
});

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

function validateOrderForm() {
  // 🔹 주문자 정보
  const name = document.getElementById("orderer-name")?.value.trim();
  const email = document.getElementById("orderer-email")?.value.trim();

  // 🔹 결제 동의
  if (!agreeCheckbox.checked) {
    alert("결제 동의가 필요합니다.");
    return false;
  }

  // 🔹 이름 / 이메일
  if (!name || !email) {
    alert("주문자 정보를 확인해주세요.");
    return false;
  }

  // 🔹 휴대폰 번호 형식
  if (!/^010\d{8}$/.test(getReceiverPhone())) {
    alert("휴대폰 번호를 정확히 입력해주세요.");
    return false;
  }

  // 🔹 주소
  if (!getAddress()) {
    alert("배송 주소를 입력해주세요.");
    return false;
  }

  // 🔹 결제 수단
  const paymentChecked = document.querySelector(
    'input[name="payment"]:checked'
  );

  if (!paymentChecked) {
    alert("결제수단을 선택해주세요.");
    return false;
  }

  return true; // ✅ 모든 검증 통과
}

async function requestOrder(orderData) {
  console.log("보내는 주문 데이터:", orderData);
  const res = await Utils.fetchWithAuth(`/order/`, {
    method: "POST",
    body: JSON.stringify(orderData),
  });

  return res;
}

async function buildOrderData() {
  const orderItems = getOrderData();
  const firstItem = orderItems[0];

  // 🔹 검증식: 바로구매인지 장바구니 구매인지 확인
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

  // 🔹 검증식(개념): 서버가 요구하는 최종 결제 금액 확인
  const calculatedTotal = priceSum + deliverySum;
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
