console.log("index.js loaded");

const API_ORIGIN = "http://localhost:3000";
const API_BASE = `${API_ORIGIN}/api`;

// ===== 공통 레이아웃 로딩 =====
const path = window.location.pathname;

fetch("./header.html")
  .then((res) => res.text())
  .then((html) => document.body.insertAdjacentHTML("afterbegin", html));

if (!path.includes("login") && !path.includes("signup")) {
  fetch("./footer.html")
    .then((res) => res.text())
    .then((html) => document.body.insertAdjacentHTML("beforeend", html));
}

// ===== 상품 목록 불러오기 =====
async function loadProducts() {
  const grid = document.querySelector("#productGrid");
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error("products fetch failed");

    const data = await res.json();
    const list = data.results ?? [];

    renderProducts(list);
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<li>상품을 불러오지 못했습니다.</li>`;
  }
}

function renderProducts(list) {
  const grid = document.querySelector("#productGrid");
  if (!grid) return;

  grid.innerHTML = list
    .map((p) => {
      const imgUrl = p.image;

      const meta = p.info ?? "";
      const storeName = p.seller?.store_name ?? "";
      const priceText = `${Number(p.price).toLocaleString()}원`;

      return `
        <li class="card">
          <a class="product-link" href="./detail.html?id=${p.id}">
            <img src="${imgUrl}" alt="${p.name}" />
            <p class="product-meta">${meta}</p>
            <p class="product-name">${p.name}</p>
            <p class="product-price">${priceText}</p>
          </a>
        </li>
      `;
    })
    .join("");
}

function initBanner() {
  const slides = document.querySelectorAll(".banner-slide");
  const dots = document.querySelectorAll(".banner-indicator .dot");
  const prevBtn = document.querySelector(".banner-btn.prev");
  const nextBtn = document.querySelector(".banner-btn.next");

  if (!slides.length || !prevBtn || !nextBtn || !dots.length) return;

  let current = 0;

  function renderSlide(index) {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
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

document.addEventListener("DOMContentLoaded", () => {
  initBanner();
  loadProducts();
});
