function getCartData() {
  const cartData = sessionStorage.getItem("orderData");

  if (!cartData) {
    return [];
  }

  return JSON.parse(cartData);
}

function renderCart(cart) {
  const orderList = document.getElementById("order-list");
  const totalPriceEl = document.getElementById("total-price");

  orderList.innerHTML = "";
  let totalPrice = 0;

  if (cart.length === 0) {
    orderList.innerHTML = "<p>장바구니가 비어 있습니다.</p>";
    totalPriceEl.textContent = "0원";
    return;
  }

  cart.forEach((item) => {
    const itemTotal = Number(item.product.price) * Number(item.quantity);

    totalPrice += itemTotal;

    const row = document.createElement("div");
    row.className = "order-item";

    /* 수정된 renderCart 내부 row.innerHTML 부분 */
    row.innerHTML = `
    <div class="col-info">
      <div class="product-box">
        <img src="${item.product.image}" class="product-img" />
        <div class="product-text">
          <p class="name">${item.product.name}</p>
          <span class="qty">수량 : ${item.quantity}개</span>
        </div>
      </div>
    </div>
    <div class="col-discount">-</div>
    <div class="col-delivery">무료배송</div>
    <div class="col-price">${itemTotal.toLocaleString()}원</div>
  `;

    orderList.appendChild(row);
  });

  totalPriceEl.textContent = totalPrice.toLocaleString() + "원";
}

const agreeCheckbox = document.querySelector(".agree input");
const payBtn = document.querySelector(".pay-btn");

/* 처음엔 비활성화 */
payBtn.disabled = true;

/* 체크박스 클릭 시 */
agreeCheckbox.addEventListener("change", () => {
  if (agreeCheckbox.checked) {
    payBtn.disabled = false;
    payBtn.classList.add("active");
  } else {
    payBtn.disabled = true;
    payBtn.classList.remove("active");
  }
});

/* 결제 버튼 클릭 */
payBtn.addEventListener("click", () => {
  if (!agreeCheckbox.checked) return;

  alert("결제되었습니다.");

  sessionStorage.setItem("paymentComplete", "true");
  sessionStorage.removeItem("orderData");
});
const postBtn = document.querySelector(".btn-post");

postBtn.addEventListener("click", () => {
  alert("우편번호 조회 입니다.");
});

document.addEventListener("DOMContentLoaded", () => {
  const cartData = getCartData();
  renderCart(cartData);
});
