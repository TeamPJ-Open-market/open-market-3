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
          <p class="qty">수량: ${item.quantity}개</p>
        </div>
      </div>
      <div class="discount">-</div>
      <div class="shipping">무료배송</div>
      <div class="price">${itemTotal.toLocaleString()}원</div>
    `;

    orderList.appendChild(row);
  });

  totalPriceEl.textContent = totalPrice.toLocaleString() + "원";
}

function init() {
  const cart = getCartData();
  renderCart(cart);
}

init();
