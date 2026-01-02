// DOM 요소
const emptyEl = document.getElementById("cart-empty");
const listEl = document.getElementById("cart-list");
const itemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const orderBtn = document.getElementById("order-btn");
const containerEl = document.getElementById("cart-container");
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
  // [STEP 1] 로그인 체크
  if (!Utils.isLoggedIn()) {
    // HTML/CSS에서 이미 container가 is-hidden 상태이므로
    // 여기서는 아무것도 노출하지 않고 모달만 띄웁니다.
    openModal(
      "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?",
      () => {
        location.href = "signin.html";
      },
      "로그인하기",
      "취소"
    );

    // 모달에서 '취소'를 누를 경우의 처리
    modalBtnNo.onclick = () => {
      location.href = "index.html";
    };
    // 2. 상단 X 버튼을 눌렀을 때도 메인으로!
    modalCloseX.onclick = () => {
      location.href = "index.html";
    };

    // 3. 모달 배경(어두운 부분)을 클릭했을 때도 메인으로!
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) {
        location.href = "index.html";
      }
    };
    return; // 이후 로직 실행 중단
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

    // [STEP 3] 데이터 로드 완료 후 화면 노출
    // 데이터가 성공적으로 왔으니 부모 컨테이너의 숨김을 해제합니다.
    containerEl.classList.remove("is-hidden");

    if (cartItems && cartItems.length > 0) {
      renderCartList();
    } else {
      renderEmpty();
    }
  } catch (err) {
    console.error("데이터 로딩 실패:", err);
    // 에러 발생 시에도 컨테이너는 보여주되 빈 화면이나 에러 문구를 노출
    containerEl.classList.remove("is-hidden");
    renderEmpty();
  }
}
/**
 * 빈 장바구니 화면
 */
function renderEmpty() {
  emptyEl.classList.add("is-hidden");
  listEl.classList.remove("is-hidden");
}

/**
 * 장바구니 리스트 렌더링
 */
function renderCartList() {
  emptyEl.classList.add("is-hidden");
  listEl.classList.remove("is-hidden");

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

  // 6. 개별 상품 '주문하기' 버튼 이벤트 추가
  itemsEl.querySelectorAll(".order-item-btn").forEach((btn) => {
    btn.onclick = (e) => {
      // 클릭한 버튼이 속한 li 요소에서 상품 ID 추출
      const id = e.target.closest("li").dataset.id;

      // 해당 상품 ID 하나만 배열에 담아 로컬 스토리지에 저장
      localStorage.setItem("order_items", JSON.stringify([id]));

      // 주문서 페이지로 이동
      location.href = "order.html";
    };
  });
}
/**
 * 수량 변경 로직
 */
// 장바구니 상품 수량 수정
async function updateQuantity(id, newQuantity) {
  try {
    const response = await fetch(`${API_URL}/cart/${id}/`, {
      method: "PUT", // 명세서 규칙에 의해 PUT으로
      headers: Utils.getAuthHeaders(), // 인증 헤더 포함 (자물쇠 아이콘 대응)
      body: JSON.stringify({
        quantity: newQuantity,
        product_id: productId, // 상품의 원본 ID
        is_active: true, // 현재 활성화 상태 전달
      }),
    });

    if (response.ok) {
      // 수정 성공 시 최신 데이터를 서버에서 다시 불러와 화면 갱신
      loadCart();
    } else {
      const errorData = await response.json();
      console.error("수량 수정 실패:", errorData);
    }
  } catch (err) {
    console.error("네트워크 오류 발생:", err);
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
 * 케이스 2: 주문하기 클릭 시 주문창으로 이동및 장바구니 정보 서버에 전달
 */ async function moveToOrder() {
  const selectedIds = [];
  // 현재 체크박스에 선택된 장바구니 아이템 ID 수집
  itemsEl.querySelectorAll("li").forEach((li) => {
    if (li.querySelector(".item-check").checked) {
      selectedIds.push(li.dataset.id);
    }
  });

  if (selectedIds.length === 0) {
    openModal("주문할 상품을 선택해주세요.", () => {}, "확인", "");
    return;
  }

  try {
    // [명세서 규칙] POST /order/ 호출하여 주문 생성
    const response = await fetch(`${API_URL}/order/`, {
      method: "POST",
      headers: Utils.getAuthHeaders(), // 자물쇠 아이콘에 따른 인증 헤더 포함
      body: JSON.stringify({
        order_items: selectedIds, // 선택된 장바구니 아이템 PK 리스트
        order_kind: "cart_order", // 주문 종류 (장바구니 주문)
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // 서버에서 발급한 주문 PK를 저장하고 주문서 페이지로 이동
      // 명세서의 GET /order/{order_pk}/ 조회를 위해 ID 보관
      localStorage.setItem("pending_order_id", data.id);
      location.href = "order.html";
    } else {
      alert("주문 생성 실패: " + (data.message || "다시 시도해주세요."));
    }
  } catch (err) {
    console.error("네트워크 오류:", err);
  }
}
