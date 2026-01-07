// ===== 공통: 검색 API 호출 공통화 =====
async function fetchProductsByKeyword(keyword) {
  const res = await Utils.fetchWithAuth(
    `/products/?search=${encodeURIComponent(keyword)}`
  );

  if (!res.ok) {
    throw new Error(`products search fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return data.results || [];
}

// ===== 헤더 렌더 완료 이벤트 =====
window.addEventListener("headerRendered", () => {
  renderHeader();
  bindSearchEventsOnce();
});

// ===== 헤더 렌더링 (로그인/활성화 처리) =====
function renderHeader() {
  const userMenu = document.getElementById("header-user-menu");
  if (!userMenu) return;

  // cart.html 페이지일 때 장바구니 활성화
  const cartLink = document.querySelector('a.action[href="./cart.html"]');
  const isCartPage = window.location.pathname.includes("cart.html");
  if (cartLink) cartLink.classList.toggle("active", isCartPage);

  const token = localStorage.getItem("access_token");
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  // 로그인 상태일 때: 로그아웃 버튼으로 교체
  if (token && user) {
    userMenu.innerHTML = `
      <button class="action btn-logout" id="logout-btn" type="button">
        <!-- 선택1: 기존 img 유지 -->
        <img src="./assets/icons/icon-user.svg" alt="" class="icon" />
        
        <!-- 선택2: sprite로 바꾸려면 위 img 지우고 아래로 교체
        <svg class="icon" aria-hidden="true">
          <use href="./assets/icons/sprite.svg#icon-user"></use>
        </svg>
        -->
        <span class="action-text">로그아웃</span>
      </button>
    `;

    if (user.user_type === "SELLER") {
      Modal.open({
        message: "안녕하세요, 판매자님!\n판매자 센터는 현재 준비 중입니다.",
        cancelText: "",
      });
    }

    document
      .getElementById("logout-btn")
      ?.addEventListener("click", handleLogout);
  }
}

function handleLogout() {
  Modal.open({
    message: "로그아웃 하시겠습니까?",
    onConfirm: () => {
      Utils.logout();
    },
  });
}

// ===== 검색 이벤트: 중복 바인딩 방지 =====
let isSearchBound = false;

function bindSearchEventsOnce() {
  if (isSearchBound) return;
  isSearchBound = true;
  bindSearchEvents();
}

let debounceTimer;

function bindSearchEvents() {
  const searchInput = document.getElementById("q");
  const suggestionList = document.getElementById("search-suggestion");
  const searchForm = document.querySelector(".search");

  if (!searchInput || !suggestionList || !searchForm) return;

  // 1) 입력 시 추천 리스트 (디바운스)
  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();

    // 클릭으로 선택된 값이면 요청하지 않음
    if (keyword === searchInput.dataset.lastSelected) return;

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      // 요청 직전: 포커스 유지 확인(클릭으로 빠졌으면 중단)
      if (document.activeElement !== searchInput) return;
      if (!keyword) {
        suggestionList.classList.add("is-hidden");
        suggestionList.innerHTML = "";
        return;
      }
      if (keyword === searchInput.dataset.lastSelected) return;

      try {
        const items = await fetchProductsByKeyword(keyword);

        // 응답 후: 그 사이 선택이 발생했다면 그리지 않음
        if (keyword === searchInput.dataset.lastSelected) return;

        if (items.length > 0) {
          suggestionList.innerHTML = items
            .slice(0, 8)
            .map((item) => `<li class="suggestion-item">${item.name}</li>`)
            .join("");
          suggestionList.classList.remove("is-hidden");
        } else {
          suggestionList.classList.add("is-hidden");
          suggestionList.innerHTML = "";
        }
      } catch (err) {
        console.error(err);
        suggestionList.classList.add("is-hidden");
      }
    }, 300);
  });

  // 2) 추천 클릭(mousedown)으로 선택
  suggestionList.addEventListener("mousedown", (e) => {
    e.stopPropagation();

    const li = e.target.closest(".suggestion-item");
    if (!li) return;

    const selectedKeyword = li.textContent.trim();

    searchInput.dataset.lastSelected = selectedKeyword;
    searchInput.value = selectedKeyword;

    suggestionList.classList.add("is-hidden");
    suggestionList.innerHTML = "";

    // input 이벤트 트리거(기존 로직 유지)
    searchInput.dispatchEvent(new Event("input"));
  });

  // 3) 폼 제출(엔터/돋보기)
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const keyword = searchInput.value.trim();
    if (!keyword) {
      Modal.open({ message: "검색어를 입력해주세요.", cancelText: "" });
      return;
    }

    try {
      const products = await fetchProductsByKeyword(keyword);

      // 정확 일치 상품이면 상세로
      const exactMatch = products.find((p) => p.name === keyword);

      if (exactMatch) {
        location.href = `${PAGES.DETAIL}?id=${exactMatch.id}`;
      } else {
        location.href = `${PAGES.HOME}?search=${encodeURIComponent(keyword)}`;
      }
    } catch (err) {
      console.error("검색 처리 중 오류:", err);
      location.href = `${PAGES.HOME}?search=${encodeURIComponent(keyword)}`;
    }
  });

  // 4) 검색창 바깥 클릭 시 리스트 닫기
  document.addEventListener("mousedown", (e) => {
    // 검색 영역 밖 클릭이면 닫기
    if (!searchForm.contains(e.target)) {
      suggestionList.classList.add("is-hidden");
    }
  });
}
