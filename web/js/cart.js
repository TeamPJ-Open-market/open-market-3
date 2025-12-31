// ==============================
// cart.js
// ==============================

// DOM 요소
const emptyEl = document.getElementById("cart-empty");
const listEl = document.getElementById("cart-list");
const itemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const orderBtn = document.getElementById("order-btn");

let cartItems = []; // 장바구니 상태 저장 (서버 데이터 형식에 맞춤)

document.addEventListener("DOMContentLoaded", loadCart);

/**
 * 장바구니 데이터 로드 (로그인/비로그인 분기)
 */
async function loadCart() {
  // 초기 상태 설정
  emptyEl.style.display = "block";
  listEl.style.display = "none";

  if (Utils.isLoggedIn()) {
    // 1. 로그인 상태: 서버 API 호출
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: Utils.getAuthHeaders(),
      });
      const data = await res.json();
      cartItems = data.results;

      if (cartItems && cartItems.length > 0) {
        renderCartList();
      } else {
        renderEmpty();
      }
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
      renderEmpty();
    }
  } else {
    // 2. 비로그인 상태: localStorage(guest_cart) 사용
    const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");

    if (guestCart.length > 0) {
      try {
        // 상세 정보를 채우기 위해 각 상품 API 호출 (병렬 처리)
        const promises = guestCart.map(async (item) => {
          const res = await fetch(`${API_URL}/products/${item.product_id}`);
          const productData = await res.json();
          return {
            id: item.product_id, // 비로그인은 product_id를 키로 사용
            product: productData,
            quantity: item.quantity,
          };
        });

        cartItems = await Promise.all(promises);
        renderCartList();
      } catch (err) {
        console.error("비로그인 상품 정보 로딩 실패:", err);
        renderEmpty();
      }
    } else {
      renderEmpty();
    }
  }
}

/**
 * 빈 장바구니 화면
 */
function renderEmpty() {
  emptyEl.style.display = "block";
  listEl.style.display = "none";
}

/**
 * 장바구니 리스트 렌더링
 */
function renderCartList() {
  emptyEl.style.display = "none";
  listEl.style.display = "block";

  itemsEl.innerHTML = "";
  cartItems.forEach((item) => {
    const li = document.createElement("li");
    li.dataset.id = item.id;

    li.innerHTML = `
      <input type="checkbox" class="item-check" checked />
      <strong>${item.product.name}</strong><br/>
      가격: ${Utils.formatNumber(item.product.price)}원<br/>
      <button class="qty-minus">−</button>
      <span class="qty">${item.quantity}</span>
      <button class="qty-plus">+</button>
      <button class="delete-btn">삭제</button>
    `;
    itemsEl.appendChild(li);
  });

  bindEvents();
  updateTotalPrice();
}

/**
 * 이벤트 바인딩
 */
function bindEvents() {
  itemsEl
    .querySelectorAll(".qty-plus")
    .forEach((btn) => (btn.onclick = onIncrease));
  itemsEl
    .querySelectorAll(".qty-minus")
    .forEach((btn) => (btn.onclick = onDecrease));
  itemsEl
    .querySelectorAll(".delete-btn")
    .forEach((btn) => (btn.onclick = onDelete));
  itemsEl
    .querySelectorAll(".item-check")
    .forEach((chk) => (chk.onchange = updateTotalPrice));
  orderBtn.onclick = moveToOrder;
}

/**
 * 수량 변경 로직 (로그인/비로그인 통합)
 */
function updateQuantity(id, newQuantity) {
  if (Utils.isLoggedIn()) {
    // 로그인: PATCH API 호출
    fetch(`${API_URL}/cart/${id}`, {
      method: "PATCH",
      headers: Utils.getAuthHeaders(),
      body: JSON.stringify({ quantity: newQuantity }),
    }).then(loadCart);
  } else {
    // 비로그인: localStorage 수정
    const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
    const item = guestCart.find((i) => i.product_id == id);
    if (item) {
      item.quantity = newQuantity;
      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      loadCart();
    }
  }
}

function onIncrease(e) {
  const id = e.target.closest("li").dataset.id;
  const item = cartItems.find((i) => i.id == id);
  updateQuantity(id, item.quantity + 1);
}

function onDecrease(e) {
  const id = e.target.closest("li").dataset.id;
  const item = cartItems.find((i) => i.id == id);
  if (item.quantity === 1) return;
  updateQuantity(id, item.quantity - 1);
}

/**
 * 삭제 로직 (로그인/비로그인 통합)
 */
function onDelete(e) {
  const id = e.target.closest("li").dataset.id;
  if (!confirm("삭제하시겠습니까?")) return;

  if (Utils.isLoggedIn()) {
    fetch(`${API_URL}/cart/${id}`, {
      method: "DELETE",
      headers: Utils.getAuthHeaders(),
    }).then(loadCart);
  } else {
    let guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
    guestCart = guestCart.filter((i) => i.product_id != id);
    localStorage.setItem("guest_cart", JSON.stringify(guestCart));
    loadCart();
  }
}

/**
 * 합계 계산
 */
function updateTotalPrice() {
  let total = 0;
  itemsEl.querySelectorAll("li").forEach((li) => {
    const checked = li.querySelector(".item-check").checked;
    if (!checked) return;
    const id = li.dataset.id;
    const item = cartItems.find((i) => i.id == id);
    total += item.product.price * item.quantity;
  });
  totalPriceEl.textContent = Utils.formatNumber(total);
}

/**
 * 주문 이동 (결제 시 로그인 체크 필수)
 */
function moveToOrder() {
  if (!Utils.isLoggedIn()) {
    alert("결제는 로그인 후 가능합니다.");
    location.href = "signin.html";
    return;
  }

  const selectedIds = [];
  itemsEl.querySelectorAll("li").forEach((li) => {
    if (li.querySelector(".item-check").checked) {
      selectedIds.push(li.dataset.id);
    }
  });

  if (selectedIds.length === 0) {
    alert("주문할 상품을 선택하세요.");
    return;
  }

  localStorage.setItem("order_items", JSON.stringify(selectedIds));
  location.href = "order.html";
}
