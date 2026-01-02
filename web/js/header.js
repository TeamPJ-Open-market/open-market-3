// header.js
document.addEventListener("DOMContentLoaded", () => {
  // layout.js의 비동기 작업 시간을 고려해 0.1초 뒤에 실행
  setTimeout(() => {
    renderHeader();
  }, 100);
});

function renderHeader() {
  console.log("1. renderHeader 실행");
  const userMenu = document.getElementById("header-user-menu");

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

    // 36번 줄 근처에서 에러가 났던 부분: 안전하게 옵셔널 체이닝(?.) 사용
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
      localStorage.clear();
      sessionStorage.clear();
      location.href = "index.html";
    },
  });
}
