console.log("index.js loaded");

const path = window.location.pathname;


// ===== 상품 목록 불러오기 =====
async function loadProducts() {
  const grid = document.querySelector("#productGrid");
  if (!grid) return;

  try {
    const res = await Utils.fetchWithAuth("/products", {
      method: "GET",
    });
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
      const imgUrl = p.image?.startsWith("http")
        ? p.image
        : new URL(p.image, window.location.href).href;

      const meta = p.info ?? "";
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

// ===== 메인 배너 =====
function initBanner() {
  const slides = [...document.querySelectorAll(".banner-slide")];
  const dots = [...document.querySelectorAll(".banner-indicator .dot")];
  const prevBtn = document.querySelector(".banner-btn.prev");
  const nextBtn = document.querySelector(".banner-btn.next");

  if (!slides.length || !prevBtn || !nextBtn) return;

  const useDots = dots.length === slides.length;

  let current = slides.findIndex((s) => s.classList.contains("is-active"));
  if (current < 0) current = 0;

  function renderSlide(index) {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
    if (useDots)
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

  if (useDots) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        current = index;
        renderSlide(current);
      });
    });
  }

  renderSlide(current);
}

// 실행 순서 보장
document.addEventListener("DOMContentLoaded", async () => {

  initBanner(); 
  loadProducts(); 
});
