// 현재 페이지 경로
const path = window.location.pathname;

// 헤더는 모든 페이지에 삽입
fetch("/components/header.html")
  .then((res) => res.text())
  .then((html) => {
    document.body.insertAdjacentHTML("afterbegin", html);
  });

// 로그인 / 회원가입 페이지가 아니면 footer 삽입
if (!path.includes("login") && !path.includes("signup")) {
  fetch("/components/footer.html")
    .then((res) => res.text())
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
    });
}
