/* ==========================================================
   1. 전역 변수 및 요소 선택
   ========================================================== */
const containerEl = document.getElementById("cart-container"); // 장바구니 메인 박스
const emptyEl = document.getElementById("cart-empty"); // 상품 없을 때 보여줄 섹션
const listEl = document.getElementById("cart-list"); // 상품 있을 때 보여줄 섹션
const itemsEl = document.getElementById("cart-items"); // <li> 태그들이 삽입될 <ul>
const totalPriceEl = document.getElementById("total-price"); // 합계 금액 출력 위치
const finalPriceEl = document.getElementById("final-price"); // 최종 결제 금액 출력 위치
const orderBtn = document.getElementById("order-btn"); // [전체 주문] 버튼

// 서버에서 받아온 원본 데이터를 보관하는 '데이터 저장소' 역할을 합니다.
let cartItems = [];

// 브라우저가 HTML을 다 읽자마자 초기 데이터를 불러오는 loadCart 실행
document.addEventListener("DOMContentLoaded", loadCart);

/* ==========================================================
   2. 데이터 연동 (Server Connection)
   ========================================================== */
async function loadCart() {
  // [인증 확인] Utils.isLoggedIn()은 로컬스토리지의 토큰 유무를 판단
  if (!Utils.isLoggedIn()) {
    Modal.open({
      message:
        "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?",
      onConfirm: () => {
        location.href = "signin.html";
      },
      onCancel: () => {
        location.href = "index.html";
      }, // 비로그인 시 장바구니 접근 차단
      confirmText: "로그인",
    });
    return;
  }
  try {
    const res = await fetch(`${API_URL}/cart/`, {
      headers: Utils.getAuthHeaders(),
    });
    const data = await res.json();

    // 만약 'cart'가 없으면 이전 구조인 'results'를 확인합니다.
    cartItems = data.cart || data.results || [];

    console.log("📡 서버 최신 데이터 동기화 완료:", cartItems.length, "개");

    sessionStorage.setItem("cartData", JSON.stringify(cartItems));

    containerEl.classList.remove("is-hidden");

    // 데이터가 0개보다 많아야 리스트를 그립니다.
    if (cartItems.length > 0) {
      renderCartList();
    } else {
      renderEmpty();
    }
  } catch (err) {
    console.error("로딩 실패:", err);
    containerEl.classList.remove("is-hidden");
    renderEmpty();
  }
}
/* ==========================================================
   3. UI 렌더링 (View Generation)
   ========================================================== */
function renderEmpty() {
  emptyEl.classList.remove("is-hidden"); // 1. 숨겨져 있던 '비어있음' 메시지를 보여줌
  listEl.classList.add("is-hidden"); // 2. 혹시 떠 있을지 모르는 '리스트' 영역을 숨김
}
function renderCartList() {
  emptyEl.classList.add("is-hidden");
  listEl.classList.remove("is-hidden");

  // 기존 화면을 비우고 다시 그립니다. (수량 변경 시 화면 갱신을 위해 필요)
  itemsEl.innerHTML = "";

  cartItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-item";

    // [중요] HTML 요소에 데이터를 숨겨둡니다(dataset).
    // 나중에 버튼을 클릭했을 때 이 값을 읽어서 "어떤 상품인지" 서버에 알려줄 수 있습니다.
    li.dataset.id = item.id; // 장바구니 내 고유 PK (삭제/수정용)
    li.dataset.productId = item.product.id; // 실제 상품 고유 ID (수량 수정 시 필수 값)

    li.innerHTML = `
      <div class="col-info">
        <label class="check-container">
          <input type="checkbox" class="item-check" checked />
          <span class="custom-checkbox"></span>
        </label>
        <img src="${item.product.image}" alt="${
      item.product.name
    }" class="cart-img" />
        <div class="product-text">
          <span class="seller">${item.product.seller.store_name}</span>
          <strong class="name">${item.product.name}</strong>
          <span class="price">${Utils.formatNumber(item.product.price)}원</span>
        </div>
      </div>
      <div class="col-qty">
        <div class="qty-stepper">
          <button type="button" class="qty-minus" aria-label="수량 감소">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button type="button" class="qty-plus" aria-label="수량 증가">+</button>
        </div>
      </div>
      <div class="col-price">
        <span class="item-total-price">${Utils.formatNumber(
          item.product.price * item.quantity
        )}원</span>
        <button type="button" class="order-item-btn">주문하기</button>
      </div>
      <button type="button" class="item-delete-btn" aria-label="${
        item.product.name
      } 삭제">&times;</button>
    `;
    itemsEl.appendChild(li);
  });

  // HTML이 생성된 '직후'에 버튼들에게 클릭 이벤트를 붙여줍니다.
  bindEvents();
  // 체크된 상품들의 금액을 합산하여 하단 요약 영역을 갱신합니다.
  updateTotalPrice();
}

/* ==========================================================
   4. 상호작용 (Event Binding)
   ========================================================== */
function bindEvents() {
  const checkAll = document.getElementById("check-all"); // 전체 선택 체크박스
  const itemChecks = itemsEl.querySelectorAll(".item-check"); // 개별 상품 체크박스들

  // [전체 선택 클릭] 모든 상품의 체크 상태를 부모와 일치시키고 합계 다시 계산
  if (checkAll) {
    checkAll.onchange = () => {
      itemChecks.forEach((chk) => (chk.checked = checkAll.checked));
      updateTotalPrice();
    };
  }

  // [각종 버튼 클릭] 생성된 DOM 요소에서 dataset 값을 읽어와 해당 핸들러 함수로 전달합니다.
  itemsEl
    .querySelectorAll(".qty-plus")
    .forEach((btn) => (btn.onclick = onIncrease));
  itemsEl
    .querySelectorAll(".qty-minus")
    .forEach((btn) => (btn.onclick = onDecrease));
  itemsEl.querySelectorAll(".item-delete-btn").forEach((btn) => {
    btn.onclick = (e) => {
      // 클릭된 버튼에서 ID를 먼저 추출합니다.
      const id = e.target.closest("li").dataset.id;
      // 추출한 '숫자 ID'를 onDelete 함수에 던져줍니다.
      onDelete(id);
    };
  });

  // [개별 체크 클릭] 모든 체크박스가 선택되면 전체 선택 버튼도 자동으로 체크합니다.
  itemChecks.forEach((chk) => {
    chk.onchange = () => {
      if (checkAll)
        checkAll.checked = Array.from(itemChecks).every((c) => c.checked);
      updateTotalPrice();
    };
  });

  // [하단 주문 버튼] 클릭 시 moveToOrder()를 실행하여 주문 데이터를 서버에 전송합니다.
  if (orderBtn) orderBtn.onclick = moveToOrder;

  // [상품별 개별 주문]

  // (bindEvents 함수 내부에서 호출될 내용)
  itemsEl.querySelectorAll(".order-item-btn").forEach((btn, index) => {
    btn.onclick = (e) => {
      // 클릭된 그 줄의 상품 정보만 가져옴
      const singleItem = cartItems[index];

      // 이 상품 하나만 담긴 배열을 만듦
      sessionStorage.setItem("orderData", JSON.stringify([singleItem]));
      sessionStorage.setItem("order_kind", "cart_order");
      // 주의: 개별 주문도 서버 API를 거쳐 pending_order_id를 받는 것이 정석이나,
      // 간단한 구현을 위해 바로 이동 후 order.html에서 처리하게 할 수도 있습니다.
      location.href = "order.html";
    };
  });
}

/* ==========================================================
   5. 수량 변경 및 연산 (Business Logic)
   ========================================================== */
async function updateQuantity(id, newQuantity) {
  try {
    const response = await fetch(`${API_URL}/cart/${id}/`, {
      method: "PUT", // 수량 수정은 PUT 방식
      headers: Utils.getAuthHeaders(), // Authorization: Bearer {token} 필수
      body: JSON.stringify({
        quantity: newQuantity, // 명세서 요구 필드
      }),
    });

    // 1. 성공 처리 (200 OK)
    if (response.ok) {
      console.log("✅ 수량 수정 완료");

      // 정석: 세션 데이터를 비우고 서버에서 최신 목록을 다시 가져옴
      sessionStorage.removeItem("cartData");
      await loadCart();
      return;
    }

    // 2. HTTP 상태 코드별 상세 오류 처리
    switch (response.status) {
      case 401: // 인증되지 않은 사용자
        Modal.open({
          message: "로그인이 필요합니다.",
          onConfirm: () => (location.href = "signin.html"),
          cancelText: "",
        });
        break;

      case 403: // 접근 권한 없음
        Modal.open({ message: "수정 권한이 없습니다.", cancelText: "" });
        break;

      case 404: // 상품을 찾을 수 없음
        Modal.open({
          message: "해당 상품 정보를 찾을 수 없습니다.",
          cancelText: "",
        });
        await loadCart();
        break;

      default:
        const errorData = await response.json();
        Modal.open({
          message: errorData.detail || "수정 중 오류가 발생했습니다.",
          cancelText: "",
        });
    }
  } catch (err) {
    console.error("수량 수정 통신 에러:", err);
    Modal.open({
      message: "서버와의 연결이 원활하지 않습니다.",
      cancelText: "",
    });
  }
}
// [+] 버튼 클릭 시
function onIncrease(e) {
  const li = e.target.closest("li");
  const id = li.dataset.id;
  const item = cartItems.find((i) => String(i.id) === String(id));
  if (item) updateQuantity(id, item.quantity + 1);
}

// [-] 버튼 클릭 시
function onDecrease(e) {
  const li = e.target.closest("li");
  const id = li.dataset.id;
  const item = cartItems.find((i) => String(i.id) === String(id));
  if (item && item.quantity > 1) updateQuantity(id, item.quantity - 1);
}
// [합계 계산] 체크박스가 켜진 상품들만 골라서 (가격 * 수량)을 더합니다.
function updateTotalPrice() {
  let total = 0;
  itemsEl.querySelectorAll("li").forEach((li) => {
    // UI 상의 체크 여부를 판단합니다.
    if (li.querySelector(".item-check").checked) {
      // 전역 변수 'cartItems'에서 해당 ID의 실제 가격 정보를 찾아 연산합니다.
      const item = cartItems.find((i) => i.id == li.dataset.id);
      if (item) total += item.product.price * item.quantity;
    }
  });

  const formatted = Utils.formatNumber(total);
  if (totalPriceEl) totalPriceEl.textContent = formatted;
  if (finalPriceEl) finalPriceEl.textContent = formatted;
}

/* ==========================================================
   6. 주문 및 삭제 (Final Action)
   ========================================================== */
async function onDelete(id) {
  if (!id) return;

  Modal.open({
    message: "상품을 삭제하시겠습니까?",
    onConfirm: async () => {
      try {
        const response = await fetch(`${API_URL}/cart/${id}/`, {
          method: "DELETE",
          headers: Utils.getAuthHeaders(),
        });

        // 1. 성공 처리 (200 OK)
        if (response.ok) {
          console.log("✅ 서버 삭제 성공");
          sessionStorage.removeItem("cartData");
          await loadCart();
          return;
        }

        // 2. HTTP 상태 코드별 상세 오류 처리
        switch (response.status) {
          case 401: // 인증되지 않은 사용자
            Modal.open({
              message: "로그인이 만료되었습니다. 다시 로그인해주세요.",
              onConfirm: () => (location.href = "signin.html"),
              cancelText: "",
            });
            break;

          case 403: // 접근 권한 없음
            Modal.open({
              message: "본인의 장바구니 상품만 삭제할 수 있습니다.",
              cancelText: "",
            });
            break;

          case 404: // 장바구니 상품을 찾을 수 없음
            Modal.open({
              message: "이미 삭제되었거나 존재하지 않는 상품입니다.",
              cancelText: "",
            });
            // 목록에 없으므로 데이터 동기화 시도
            await loadCart();
            break;

          default:
            const errorData = await response.json();
            Modal.open({
              message: errorData.detail || "삭제 중 오류가 발생했습니다.",
              cancelText: "",
            });
        }
      } catch (err) {
        console.error("네트워크 에러:", err);
        Modal.open({
          message: "서버와의 연결이 원활하지 않습니다.",
          cancelText: "",
        });
      }
    },
  });
}
/**
 * 7. "주문하기" 클릭 시 실행되는 함수
 */
function moveToOrder() {
  // 1. 체크박스가 선택된 상품들만 필터링
  const selectedCartItems = cartItems.filter((item, index) => {
    const checkBoxes = itemsEl.querySelectorAll(".item-check");
    return checkBoxes[index] && checkBoxes[index].checked;
  });

  // 2. 선택된 상품이 없는 경우 방어 로직을 실행
  if (selectedCartItems.length === 0) {
    Modal.open({ message: "주문할 상품을 선택해주세요.", cancelText: "" });
    return;
  }

  // 3.  서버 호출 없이 선택된 데이터를 세션에 즉시 저장
  // 이렇게 하면 order.html에서 데이터를 꺼내 화면을 그릴 수 있다.
  sessionStorage.setItem("orderData", JSON.stringify(selectedCartItems));

  // 4. 주문 종류를 저장하여 order.html에서 참조
  sessionStorage.setItem("order_kind", "cart_order");

  // 5. 주문서 페이지로 즉시 이동
  console.log("🚚 데이터 저장 완료, 주문서로 이동합니다.");
  location.href = "order.html";
}
