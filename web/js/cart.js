// DOM 요소
const emptyEl = document.getElementById("cart-empty");
const listEl = document.getElementById("cart-list");
const itemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const orderBtn = document.getElementById("order-btn");

// 모달 관련 요소
const modalOverlay = document.getElementById("modal-overlay");
const modalText = document.getElementById("modal-text");
const modalBtnYes = document.getElementById("modal-btn-yes");
const modalBtnNo = document.getElementById("modal-btn-no");
const modalCloseX = document.getElementById("modal-close-x");

let cartItems = []; // 장바구니 상태 저장 (서버 데이터 형식에 맞춤)

document.addEventListener("DOMContentLoaded", loadCart);

/**
 * 장바구니 데이터 로드 (로그인 확인)
 */
async function loadCart() {
  // 1. 로그인 체크: 로그인 안 되어 있으면 로그인 페이지로 튕겨내기
  if (!Utils.isLoggedIn()) {
    alert("로그인이 필요한 서비스입니다.");
    location.href = "signin.html"; // 로그인 페이지 파일명에 맞게 수정
    return;
  }

  // 초기 상태 설정
  emptyEl.style.display = "block";
  listEl.style.display = "none";

  // 2. 로그인 상태이므로 서버 API만 호출
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
    li.className = "cart-item"; // 스타일링을 위한 클래스 추가
    li.dataset.id = item.id;

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
  // 전체 선택 체크박스 가져오기
  const checkAll = document.getElementById("check-all");
  const itemChecks = itemsEl.querySelectorAll(".item-check");

  // 0. 전체 선택 체크박스 로직 추가
  if (checkAll) {
    checkAll.onchange = () => {
      itemChecks.forEach((chk) => {
        chk.checked = checkAll.checked; // 상단 체크박스 상태를 모든 아이템에 복사
      });
      updateTotalPrice();
    };
  }

  // 1. 수량 플러스 버튼
  itemsEl.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.onclick = onIncrease;
  });

  // 2. 수량 마이너스 버튼
  itemsEl.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.onclick = onDecrease;
  });

  // 3. 삭제 버튼
  itemsEl.querySelectorAll(".item-delete-btn").forEach((btn) => {
    btn.onclick = onDelete;
  });

  // 4. 개별 체크박스 변경 (기능 보완)
  itemChecks.forEach((chk) => {
    chk.onchange = () => {
      // 개별 체크박스가 하나라도 해제되면 전체 선택도 해제, 모두 체크되면 전체 선택도 체크
      if (checkAll) {
        const allChecked = Array.from(itemChecks).every((c) => c.checked);
        checkAll.checked = allChecked;
      }
      updateTotalPrice();
    };
  });

  // 5. 하단 주문하기 버튼
  if (orderBtn) orderBtn.onclick = moveToOrder;
}
/**
 * 수량 변경 로직
 */
function updateQuantity(id, newQuantity) {
  // 비로그인 체크 없이 바로 PATCH 호출
  fetch(`${API_URL}/cart/${id}`, {
    method: "PATCH",
    headers: Utils.getAuthHeaders(),
    body: JSON.stringify({ quantity: newQuantity }),
  }).then(loadCart);
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
 * 합계 계산
 */ function updateTotalPrice() {
  let total = 0;
  itemsEl.querySelectorAll("li").forEach((li) => {
    const checked = li.querySelector(".item-check").checked;
    if (!checked) return;
    const id = li.dataset.id;
    const item = cartItems.find((i) => i.id == id);
    if (item) total += item.product.price * item.quantity;
  });

  const formattedPrice = Utils.formatNumber(total);
  totalPriceEl.textContent = formattedPrice;

  // 피그마 디자인의 '결제 예정 금액' 부분도 업데이트
  const finalPriceEl = document.getElementById("final-price");
  if (finalPriceEl) finalPriceEl.textContent = formattedPrice;
}
/**
 * 이미지 가이드와 동일한 모달 노출 함수
 * @param {string} message - 표시할 문구
 * @param {function} onYes - 확인 클릭 시 실행할 함수
 * @param {string} yesText - 확인 버튼 텍스트 (기본: 확인)
 * @param {string} noText - 취소 버튼 텍스트 (기본: 취소)
 */ function openModal(message, onYes, yesText = "확인", noText = "취소") {
  modalText.innerText = message;
  modalBtnYes.innerText = yesText;

  // 취소 버튼 텍스트가 있으면 보여주고, 없으면 숨김
  if (noText) {
    modalBtnNo.innerText = noText;
    modalBtnNo.style.display = "block"; // 다시 보이게 설정
  } else {
    modalBtnNo.style.display = "none";
  }

  modalOverlay.style.display = "flex";

  modalBtnYes.onclick = () => {
    onYes();
    closeModal();
  };

  modalBtnNo.onclick = closeModal;
  modalCloseX.onclick = closeModal;
  modalOverlay.onclick = (e) => {
    // 클릭된 대상이 흰색 컨테이너가 아니라 검은 배경(overlay)일 때만 닫기
    if (e.target === modalOverlay) {
      closeModal();
    }
  };
}

function closeModal() {
  modalOverlay.style.display = "none";
}

// --- 실제 사용 예시 ---

/**
 * 케이스 1: 상품 삭제 시
 */ function onDelete(e) {
  const id = e.target.closest("li").dataset.id;

  openModal("상품을 삭제하시겠습니까?", () => {
    fetch(`${API_URL}/cart/${id}`, {
      method: "DELETE",
      headers: Utils.getAuthHeaders(),
    }).then(loadCart);
  });
}

/**
 * 케이스 2: 주문하기 클릭 시 (로그인 체크)
 */
function moveToOrder() {
  if (!Utils.isLoggedIn()) {
    openModal(
      "로그인이 필요한 서비스입니다.\n로그인 하시겠습니까?",
      () => {
        location.href = "signin.html";
      },
      "예",
      "아니오"
    );
    return;
  }

  // 로그인 된 경우 주문 로직 진행...
  const selectedIds = [];
  itemsEl.querySelectorAll("li").forEach((li) => {
    if (li.querySelector(".item-check").checked)
      selectedIds.push(li.dataset.id);
  });

  if (selectedIds.length === 0) {
    openModal("주문할 상품을 선택해주세요.", () => {}, "확인", "");
    modalBtnNo.style.display = "none"; // 버튼이 하나만 필요한 경우
    return;
  }

  localStorage.setItem("order_items", JSON.stringify(selectedIds));
  location.href = "order.html";
}
