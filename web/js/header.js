// header.js
window.addEventListener(
  "headerRendered",
  () => {
    renderHeader();
    const suggestionList = document.getElementById("search-suggestion");
    if (suggestionList) {
      const newSuggestionList = suggestionList.cloneNode(true);
      suggestionList.parentNode.replaceChild(newSuggestionList, suggestionList);
    }

    bindSearchEvents();
  },
  { once: false }
); // 상황에 따라 once: true를 고려해볼 수 있습니다.

function renderHeader() {
  console.log("1. renderHeader 실행");
  const userMenu = document.getElementById("header-user-menu");
  // 장바구니 페이지 활성화 상태 처리
  // cart.html 페이지일 때 장바구니 아이콘 활성화
  const cartLink = document.querySelector('a.action[href="./cart.html"]');
  const isCartPage = window.location.pathname.includes("cart.html");

  if (cartLink && isCartPage) {
    cartLink.classList.add("active"); // 활성화 클래스 추가
  }
  if (!userMenu) return;

  const token = localStorage.getItem("access_token");
  // 로컬스토리지에서 가져온 문자열을 객체로 변환 (변수 선언 확인!)
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  console.log("2. 로그인 상태 확인:", !!token);

  if (token && user) {
    // 로그인 상태일 때: 로그아웃 버튼으로 교체
    userMenu.innerHTML = `
      <button class="action btn-logout" id="logout-btn">
        <img src="./assets/icons/icon-user.svg" alt="" class="icon" />
        <span class="action-text">로그아웃</span>
      </button>
    `;

    if (user.user_type === "SELLER") {
      console.warn("판매자 계정 안내 모달 실행");
      Modal.open({
        message: "안녕하세요, 판매자님!\n판매자 센터는 현재 준비 중입니다.",
        cancelText: "",
      });
    }

    // 로그아웃 버튼 이벤트 바인딩
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

let debounceTimer;

function bindSearchEvents() {
  const searchInput = document.getElementById("q");
  const suggestionList = document.getElementById("search-suggestion");
  const searchForm = document.querySelector(".search");

  if (!searchInput || !suggestionList) return;

  // 1. 글자 입력 시 추천 리스트 보여주기 (디바운싱 적용)
  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();

    // ✅ [수정] 즉시 중단: 클릭으로 채워진 값인지 최우선 확인
    if (keyword === searchInput.dataset.lastSelected) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      // ✅ [추가] 서버 요청 직전, 클릭이 발생했는지 다시 확인
      if (document.activeElement !== searchInput) {
        return;
      }
      if (keyword === searchInput.dataset.lastSelected) return;

      try {
        const res = await Utils.fetchWithAuth(
          `/products/?search=${encodeURIComponent(keyword)}`
        );
        const data = await res.json();
        const items = data.results || [];

        // ✅ [추가] 서버 응답 직후, 그 사이 클릭이 발생했다면 리스트를 그리지 않음
        if (keyword === searchInput.dataset.lastSelected) return;

        if (items.length > 0) {
          suggestionList.innerHTML = items
            .slice(0, 8)
            .map((item) => `<li class="suggestion-item">${item.name}</li>`)
            .join("");
          suggestionList.classList.remove("is-hidden");
        } else {
          suggestionList.classList.add("is-hidden");
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
  });
  // 2. 추천 리스트 클릭 시 (mousedown)
  suggestionList.addEventListener("mousedown", (e) => {
    // e.preventDefault();
    e.stopPropagation();
    // if (document.activeElement !== searchInput) {
    //   return;
    // }
    const li = e.target.closest(".suggestion-item");
    if (li) {
      const selectedKeyword = li.textContent.trim();

      // ✅ [수정] 값을 먼저 넣고 포커스를 줘서 브라우저가 '타이핑'으로 오해하지 않게 함
      searchInput.dataset.lastSelected = selectedKeyword;
      searchInput.value = selectedKeyword;

      console.log("한 번에 클릭됨:", selectedKeyword);
      suggestionList.classList.add("is-hidden");
      suggestionList.innerHTML = "";

      // 강제로 input 이벤트를 한 번 더 발생시켜 dataset 비교를 유도
      searchInput.dispatchEvent(new Event("input"));
    }
  });

  // 3. 폼 제출(돋보기 클릭이나 엔터) 처리
  searchForm.onsubmit = async (e) => {
    e.preventDefault();
    const keyword = searchInput.value.trim();

    if (!keyword) {
      Modal.open({ message: "검색어를 입력해주세요.", cancelText: "" });
      return;
    }

    try {
      // 1. 서버에 이 검색어와 정확히 일치하는 상품이 있는지 먼저 확인해봅니다.
      const res = await Utils.fetchWithAuth(
        `/products/?search=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();
      const products = data.results || [];

      // 2. 검색 결과 중 상품명이 입력한 키워드와 '완전히 일치'하는 상품이 있는지 찾습니다.
      const exactMatch = products.find((p) => p.name === keyword);

      if (exactMatch) {
        //  [케이스 A] 정확히 일치하는 상품이 있으면 바로 상세 페이지로!
        location.href = `${PAGES.DETAIL}?id=${exactMatch.id}`;
      } else {
        //  [케이스 B] 일치하는게 없거나 여러 개면 검색 결과 리스트 페이지로!
        location.href = `${PAGES.HOME}?search=${encodeURIComponent(keyword)}`;
      }
    } catch (err) {
      console.error("검색 처리 중 오류:", err);
      // 에러 발생 시 안전하게 홈의 검색 결과로 보냅니다.
      location.href = `${PAGES.HOME}?search=${encodeURIComponent(keyword)}`;
    }
  };

  // 4. 검색창 바깥 클릭 시 리스트 숨기기
  document.addEventListener("mousedown", (e) => {
    // click 대신 mousedown 사용
    const searchForm = document.querySelector(".search");
    const suggestionList = document.getElementById("search-suggestion");

    // 클릭한 대상이 검색창 내부도 아니고, 추천 리스트 아이템도 아닐 때만 닫기
    if (searchForm && !searchForm.contains(e.target)) {
      suggestionList.classList.add("is-hidden");
    }
  });
}
