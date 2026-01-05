// const userData = localStorage.getItem("User");

// if (!userData) {
//   alert("로그인이 필요합니다.");
//   location.href = "signin.html";
// }

// const user = JSON.parse(userData);

// // 이름
// document.getElementById("orderer-name").value = user.name;

// // 전화번호
// const phoneParts = user.phone.split("-");
// document.getElementById("order-phone1").value = phoneParts[0];
// document.getElementById("order-phone2").value = phoneParts[1];
// document.getElementById("order-phone3").value = phoneParts[2];

// // 이메일
// document.getElementById("orderer-email").value = user.email;

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
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    const row = document.createElement("div");
    row.className = "order-item";

    row.innerHTML = `
      <div class="product-info">
        <img src="${item.image}" />
        <div>
          <p class="name">${item.name}</p>
          <p>수량: ${item.quantity}개</p>
        </div>
      </div>
      <div>-</div>
      <div>무료배송</div>
      <div>${itemTotal.toLocaleString()}원</div>
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
