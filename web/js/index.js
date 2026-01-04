console.log("index.js loaded");

const API_ORIGIN = "http://localhost:3000";
const API_BASE = `${API_ORIGIN}/api`;

const path = window.location.pathname;

// // ===== 공통 레이아웃 로딩 =====
// async function loadLayout() {
//   try {
//     const headerRes = await fetch("./header.html");
//     const headerHtml = await headerRes.text();
//     document.body.insertAdjacentHTML("afterbegin", headerHtml);
//   } catch (e) {
//     console.error("header load failed", e);
//   }

//   if (!path.includes("login") && !path.includes("signup")) {
//     try {
//       const footerRes = await fetch("./footer.html");
//       const footerHtml = await footerRes.text();
//       document.body.insertAdjacentHTML("beforeend", footerHtml);
//     } catch (e) {
//       console.error("footer load failed", e);
//     }
//   }
// }

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

// ✅ 실행 순서 보장
document.addEventListener("DOMContentLoaded", async () => {
  await loadLayout(); // header/footer 먼저
  initBanner(); // 배너는 DOM 있어야 함
  loadProducts(); // 상품 렌더링
});
