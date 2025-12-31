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
// 클릭하면 배너 내용이 넘기기
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".banner-slide");
  const prevBtn = document.querySelector(".banner-btn.prev");
  const nextBtn = document.querySelector(".banner-btn.next");

  if (!slides.length || !prevBtn || !nextBtn) return;

  let current = 0;

  function renderSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });
  }

  prevBtn.addEventListener("click", () => {
    current = (current - 1 + slides.length) % slides.length;
    renderSlide(current);
  });

  nextBtn.addEventListener("click", () => {
    current = (current + 1) % slides.length;
    renderSlide(current);
  });
});

const dots = document.querySelectorAll(".banner-indicator .dot");

function renderSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("is-active", i === index);
  });
}

/* 점 클릭 시 해당 배너로 이동 */
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    current = index;
    renderSlide(current);
  });
});
