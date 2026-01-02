console.log("index.js loaded");

// ===== 공통 레이아웃 로딩 =====
const path = window.location.pathname;

// header
fetch("./header.html")
  .then((res) => res.text())
  .then((html) => document.body.insertAdjacentHTML("afterbegin", html));

// footer (로그인/회원가입 제외)
if (!path.includes("login") && !path.includes("signup")) {
  fetch("./footer.html")
    .then((res) => res.text())
    .then((html) => document.body.insertAdjacentHTML("beforeend", html));
}

// ===== 상품 데이터 =====
const products = [
  {
    id: 1,
    img: "./assets/images/product1.png",
    meta: "우당탕탕 라이캣의 실험실",
    name: "Hack Your Life 개발자 노트북 파우치",
    price: "29,000원",
  },
  {
    id: 2,
    img: "./assets/images/product2.png",
    meta: "제주코딩베이스캠프",
    name: "네 개발잡니다 개발자키링 금속키링",
    price: "29,000원",
  },
  {
    id: 3,
    img: "./assets/images/product3.png",
    meta: "백엔드글로벌",
    name: "딥러닝 개발자 무릎 담요",
    price: "29,000원",
  },
  {
    id: 4,
    img: "./assets/images/product4.png",
    meta: "코딩앤유",
    name: "우당탕탕 라이캣의 실험실 스티커 팩",
    price: "29,000원",
  },
  {
    id: 5,
    img: "./assets/images/product5.png",
    meta: "파이썬스쿨",
    name: "버그를 Java라 버그잡는 개리씨 키링 개발자키링...",
    price: "29,000원",
  },
];

// ✅ 함수 이름: renderProducts (이걸 호출해야 함)
function renderProducts(list) {
  const grid = document.querySelector("#productGrid");
  if (!grid) return;

  grid.innerHTML = list
    .map(
      (p) => `
      <li class="card">
        <a href="./detail.html?id=${p.id}" class="product-link">
          <img src="${p.img}" alt="${p.name}" />
          <p class="product-meta">${p.meta}</p>
          <p class="product-name">${p.name}</p>
          <p class="product-price">${p.price}</p>
        </a>
      </li>
    `
    )
    .join("");
}

// ===== 메인 배너 =====
function initBanner() {
  const slides = document.querySelectorAll(".banner-slide");
  const dots = document.querySelectorAll(".banner-indicator .dot");
  const prevBtn = document.querySelector(".banner-btn.prev");
  const nextBtn = document.querySelector(".banner-btn.next");

  if (!slides.length || !prevBtn || !nextBtn || !dots.length) return;

  let current = 0;

  function renderSlide(index) {
    slides.forEach((slide, i) =>
      slide.classList.toggle("is-active", i === index)
    );
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  prevBtn.addEventListener("click", () => {
    current = (current - 1 + slides.length) % slides.length;
    renderSlide(current);
  });

  nextBtn.addEventListener("click", () => {
    current = (current + 1) % slides.length;
    renderSlide(current);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      current = index % slides.length;
      renderSlide(current);
    });
  });

  renderSlide(current);
}

// ✅ DOMContentLoaded는 딱 1번만
document.addEventListener("DOMContentLoaded", () => {
  initBanner();
  renderProducts(products);
});
