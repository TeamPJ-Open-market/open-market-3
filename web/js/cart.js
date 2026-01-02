// [DOM 요소]
const containerEl = document.getElementById("cart-container");
const emptyEl = document.getElementById("cart-empty");
const listEl = document.getElementById("cart-list");
const itemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const finalPriceEl = document.getElementById("final-price");
const orderBtn = document.getElementById("order-btn");

let cartItems = [];

document.addEventListener("DOMContentLoaded", loadCart);

/**
 * 장바구니 데이터 로드
 */
async function loadCart() {
  // 1. 로그인 체크 (공통 모달 사용)
  if (!Utils.isLoggedIn()) {
    Modal.open({
      message:
        "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?",
      onConfirm: () => {
        location.href = "signin.html";
      },
      onCancel: () => {
        location.href = "index.html";
      }, // X, 취소, 배경클릭 시 메인으로
      confirmText: "로그인",
    });
    return;
  }

  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: Utils.getAuthHeaders(),
    });
    const data = await res.json();
    cartItems = data.results;

    // 데이터 로드 완료 후 컨테이너 노출
    containerEl.classList.remove("is-hidden");

    if (cartItems && cartItems.length > 0) {
      renderCartList();
    } else {
      renderEmpty();
    }
  } catch (err) {
    console.error("데이터 로딩 실패:", err);
    containerEl.classList.remove("is-hidden");
    renderEmpty();
  }
}

/**
 * 화면 렌더링 함수들
 */
function renderEmpty() {
  emptyEl.classList.remove("is-hidden");
  listEl.classList.add("is-hidden");
}

function renderCartList() {
  emptyEl.classList.add("is-hidden");
  listEl.classList.remove("is-hidden");

  itemsEl.innerHTML = "";
  cartItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = item.id;
    li.dataset.productId = item.product.id; // 수량 수정을 위해 상품 ID 저장

    li.innerHTML = `
      <div class="col-info">
        <label class="check-container">
          <input type="checkbox" class="item-check" checked />
          <span class="custom-checkbox"></span>
        </label>
        <img src="${item.product.image}" class="cart-img" />
        <div class="product-text">
          <span class="seller">${item.product.seller_store}</span>
          <strong class="name">${item.product.name}</strong>
          <span class="price">${Utils.formatNumber(item.product.price)}원</span>
        </div>
      </div>
      <div class="col-qty">
        <div class="qty-stepper">
          <button class="qty-minus">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-plus">+</button>
        </div>
      </div>
      <div class="col-price">
        <span class="item-total-price">${Utils.formatNumber(
          item.product.price * item.quantity
        )}원</span>
        <button class="order-item-btn">주문하기</button>
      </div>
      <button class="item-delete-btn">&times;</button>
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
  const checkAll = document.getElementById("check-all");
  const itemChecks = itemsEl.querySelectorAll(".item-check");

  if (checkAll) {
    checkAll.onchange = () => {
      itemChecks.forEach((chk) => (chk.checked = checkAll.checked));
      updateTotalPrice();
    };
  }

  itemsEl
    .querySelectorAll(".qty-plus")
    .forEach((btn) => (btn.onclick = onIncrease));
  itemsEl
    .querySelectorAll(".qty-minus")
    .forEach((btn) => (btn.onclick = onDecrease));
  itemsEl
    .querySelectorAll(".item-delete-btn")
    .forEach((btn) => (btn.onclick = onDelete));

  itemChecks.forEach((chk) => {
    chk.onchange = () => {
      if (checkAll)
        checkAll.checked = Array.from(itemChecks).every((c) => c.checked);
      updateTotalPrice();
    };
  });

  if (orderBtn) orderBtn.onclick = moveToOrder;

  // 개별 상품 주문
  itemsEl.querySelectorAll(".order-item-btn").forEach((btn) => {
    btn.onclick = (e) => {
      const id = e.target.closest("li").dataset.id;
      localStorage.setItem("order_items", JSON.stringify([id]));
      location.href = "order.html";
    };
  });
}

/**
 * 수량 및 합계 로직
 */
async function updateQuantity(id, productId, newQuantity) {
  try {
    const response = await fetch(`${API_URL}/cart/${id}/`, {
      method: "PUT",
      headers: Utils.getAuthHeaders(),
      body: JSON.stringify({
        quantity: newQuantity,
        product_id: productId,
        is_active: true,
      }),
    });

    if (response.ok) loadCart();
    else {
      const errData = await response.json();
      Modal.open({
        message: "수량 수정 실패: " + (errData.message || "오류 발생"),
        cancelText: "",
      });
    }
  } catch (err) {
    console.error(err);
  }
}

function onIncrease(e) {
  const li = e.target.closest("li");
  const item = cartItems.find((i) => i.id == li.dataset.id);
  updateQuantity(li.dataset.id, li.dataset.productId, item.quantity + 1);
}

function onDecrease(e) {
  const li = e.target.closest("li");
  const item = cartItems.find((i) => i.id == li.dataset.id);
  if (item.quantity === 1) return;
  updateQuantity(li.dataset.id, li.dataset.productId, item.quantity - 1);
}

function updateTotalPrice() {
  let total = 0;
  itemsEl.querySelectorAll("li").forEach((li) => {
    if (li.querySelector(".item-check").checked) {
      const item = cartItems.find((i) => i.id == li.dataset.id);
      if (item) total += item.product.price * item.quantity;
    }
  });

  const formatted = Utils.formatNumber(total);
  if (totalPriceEl) totalPriceEl.textContent = formatted;
  if (finalPriceEl) finalPriceEl.textContent = formatted;
}

/**
 * 삭제 및 주문 이동
 */
function onDelete(e) {
  const id = e.target.closest("li").dataset.id;
  Modal.open({
    message: "상품을 삭제하시겠습니까?",
    onConfirm: () => {
      fetch(`${API_URL}/cart/${id}`, {
        method: "DELETE",
        headers: Utils.getAuthHeaders(),
      }).then(loadCart);
    },
  });
}

async function moveToOrder() {
  const selectedIds = Array.from(itemsEl.querySelectorAll("li"))
    .filter((li) => li.querySelector(".item-check").checked)
    .map((li) => li.dataset.id);

  if (selectedIds.length === 0) {
    Modal.open({ message: "주문할 상품을 선택해주세요.", cancelText: "" });
    return;
  }

  try {
    const response = await fetch(`${API_URL}/order/`, {
      method: "POST",
      headers: Utils.getAuthHeaders(),
      body: JSON.stringify({
        order_items: selectedIds,
        order_kind: "cart_order",
      }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("pending_order_id", data.id);
      location.href = "order.html";
    } else {
      Modal.open({
        message: "주문 생성 실패: " + (data.message || "다시 시도해주세요."),
        cancelText: "",
      });
    }
  } catch (err) {
    console.error(err);
  }
}
