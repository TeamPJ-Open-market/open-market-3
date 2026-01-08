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

// // ===== 메인 배너 =====
// function initBanner() {
//   const slides = [...document.querySelectorAll(".banner-slide")];
//   const dots = [...document.querySelectorAll(".banner-indicator .dot")];
//   const prevBtn = document.querySelector(".banner-btn.prev");
//   const nextBtn = document.querySelector(".banner-btn.next");

//   if (!slides.length || !prevBtn || !nextBtn) return;

//   const useDots = dots.length === slides.length;

//   let current = slides.findIndex((s) => s.classList.contains("is-active"));
//   if (current < 0) current = 0;

//   function renderSlide(index) {
//     slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
//     if (useDots)
//       dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
//   }

//   prevBtn.addEventListener("click", () => {
//     current = (current - 1 + slides.length) % slides.length;
//     renderSlide(current);
//   });

//   nextBtn.addEventListener("click", () => {
//     current = (current + 1) % slides.length;
//     renderSlide(current);
//   });

//   if (useDots) {
//     dots.forEach((dot, index) => {
//       dot.addEventListener("click", () => {
//         current = index;
//         renderSlide(current);
//       });
//     });
//   }

//   renderSlide(current);
// }

// // 실행 순서 보장
// document.addEventListener("DOMContentLoaded", async () => {

//   initBanner();
//   loadProducts();
// });
const track = document.querySelector(".carousel-track");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const slide = document.querySelectorAll(".slide");
const indicatorContainer = document.querySelector(".indicator-container");
let index = 0;
let slideCount = 0;

//슬라이드 갯수만큼 점 만들기
for (let i = 0; i < slideCount; i++) {
  // 점 만들기
  const dot = document.createElement("div");
  // 만든 점에 클래스 추가
  dot.classList.add("dot");
  // 첫번째 점 활성화
  if (i === 0) dot.classList.add("active");

  dot.addEventListener("click", () => {
    index = i;
    updateSlide();
  });
  //점 컨테이너에 점 추가
  indicatorContainer.appendChild(dot);
}

function initCarousel(items) {
  track.innerHTML = items
    .map(
      (item) => `
    <div class="slide">
      <img src="${item.img}" alt="배너">
    </div>
  `
    )
    .join("");
  slideCount = items.length;
  // (2) 인디케이터 점들도 데이터 개수만큼 생성
  renderDots(items.length);

  // (3) 이제부터 우리가 만든 '동작' 코드들이 작동합니다!
}

function renderDots() {
  indicatorContainer.innerHTML = "";
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      index = i;
      updateSlide();
    });
    indicatorContainer.appendChild(dot);
  }
}
function updateSlide() {
  track.style.transform = `translateX(-${index * 100}%)`;
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}
nextBtn.addEventListener("click", () => {
  if (index < slideCount - 1) {
    index++;
  } else {
    index = 0; // 마지막이면 첫 번째로 리셋
  }
  updateSlide();
});

prevBtn.addEventListener("click", () => {
  if (index > 0) {
    index--;
  } else {
    index = slideCount - 1; // 첫 번째면 마지막으로 이동
  }
  updateSlide();
});
// setInterval(() => {
//   if (index < slideCount - 1) {
//     index++;
//   } else {
//     index = 0;
//   }
//   updateSlide();
// }, 5000);
async function getBannerData() {
  try {
    const res = await Utils.fetchWithAuth("/products", {
      method: "GET",
    });
    if (!res.ok) throw new Error("products fetch failed");
    const data = await res.json();
    console.log("서버에서 받은 데이터:", data);
    const bannerArray = data.results;
    const proceessedData = bannerArray.map((item) => ({
      img: item.image,
    }));
    initCarousel(proceessedData);
  } catch (e) {
    console.error("데이터 가져오기 실패!", e);
  }
}
getBannerData();
