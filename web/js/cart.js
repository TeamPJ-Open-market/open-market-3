import { cartApi } from "../../api/cart.api.js";

cartApi.getList().then((data) => {
  console.log("장바구니 응답:", data);
});
async function loadCart() {
  const data = await cartApi.getCart();

  if (data.count === 0) {
    showEmptyMessage();
    return;
  }

  renderCartItems(data.results);
  renderTotalPrice(data.results);
}

function renderTotalPrice(items) {
  const total = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  document.querySelector("#total-price").textContent =
    total.toLocaleString() + "원";
}

document.addEventListener("DOMContentLoaded", loadCart);
