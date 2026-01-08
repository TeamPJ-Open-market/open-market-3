<!--Banner-->
<img width="800" height="800" alt="코드한입로고" src="https://github.com/user-attachments/assets/ca46a326-dc4b-422c-a5b2-e0c667049967" />


## 프로젝트 개요

**주요 목표**: 오픈마켓 서비스를 피그마를 참고하여 디자인을 완성합니다.

### 1. 목표와 기능

#### 1.1. 목표

본 프로젝트는 notion에서 제시하는 요구사항과 figma 디자인을 참조하여 웹 퍼블리싱 페이지를 목표한 기간내에 만드는 것입니다.

#### 1.2. 기능

본 프로젝트에서 구현된 핵심 기능은 다음과 같습니다.

| 구분          | 주요 기능       | 상세 설명                                                                           |
| :------------ | :-------------- | :----------------------------------------------------------------------------------|
| **회원 인증** | 로그인/로그아웃 | JWT 토큰 기반의 인증을 처리하며, 로그인 성공 시 이전 페이지로 리다이렉트됩니다.           |
|               | 회원가입        | 아이디 중복 확인 API 연동 및 모든 입력값에 대한 유효성 검사를 수행합니다.                |
| **상품**      | 상품 목록 조회  | 메인 페이지에서 전체 상품 목록을 비동기적으로 불러와 동적 렌더링합니다.                   |
|               | 상품 상세 조회  | 상품 ID를 기반으로 특정 상품의 상세 정보를 불러와 렌더링합니다.                          |
| **장바구니**  | 장바구니 관리   | 상품 추가, 삭제, 수량 변경이 가능하며, 모든 변경사항은 실시간으로 반영됩니다.             |
|               | 금액 계산       | 상품 선택 여부와 수량에 따른 총 상품금액을 실시간으로 계산하여 표시합니다.               |
| **주문/결제** | 결제 프로세스   | 배송 정보 등 모든 필수 입력이 완료되어야 결제가 완료됩니다 .                       |

---

### 2. 개발 환경 및 API 명세

#### 2.1. 개발 환경

- **언어**:
      <div>
      <img  width=58 src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img  width=45 src="https://img.shields.io/badge/CSS-0078D7?style=for-the-badge&logo=CSS&logoColor=white"> <img width=85 src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img  width=64 src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">
      </div>
- **방식**: MPA (Multi-Page Application)
- **협업 도구**: Git, GitHub, Gitbash, Discord, Notion , Sourcetree, figma
- **코드 스타일**: Prettier

#### 2.2. 실행 방법

본 프로젝트는 배포를 통해 다음의 url을 이용하여 사용할 수 있습니다.
<p>
<img src='https://cdn.jsdelivr.net/npm/simple-icons@3.0.1/icons/github.svg' alt='github' height='40' style="display:inline-block; vertical-align:middle;margin-right:10px;"> <span style="display:inline-block; background-color:rgb(0,0,0,0.2); width:40px; text-align:center; border-radius:5px;">URL</span> (이곳에 배포 주소 입력)
</p>

#### 2.3. API 명세

본 프로젝트는 제공된 백엔드 서버의 API 명세를 기반으로 개발되었습니다. 주요 API 엔드포인트는 다음과 같습니다.

API

| 기능                       | HTTP Method | URL                            | 인증 필요 여부 |
| -------------------------- | ----------- | ------------------------------ | -------------- |
| 전체 상품 목록 조회        | GET         | `/products/`                   | ❌             |
| 상품 상세 정보 조회        | GET         | `/products/{product_id}/`      | ❌             |
| 로그인                     | POST        | `/accounts/login/`             | ❌             |
| 액세스 토큰 재발급         | POST        | `/accounts/token/refresh/`     | ❌             |
| 사용자 ID 중복 확인        | POST        | `/accounts/validate-username/` | ❌             |
| 구매자 회원가입            | POST        | `/accounts/buyer/signup/`      | ❌             |
| 장바구니 조회              | GET         | `/cart/`                       | ✅             |
| 장바구니 항목 상세 조회    | GET         | `/cart/{id}/`                  | ✅             |
| 장바구니에 상품 추가       | POST        | `/cart/`                       | ✅             |
| 장바구니 항목 수정         | PUT         | `/cart/{id}/`                  | ✅             |
| 장바구니 특정 항목 삭제    | DELETE      | `/cart/{id}`                   | ✅             |
| 장바구니 전체 비우기       | DELETE      | `/cart/`                       | ✅             |
| 상품 상세 → 직접 주문 요청 | POST        | `/order/`                      | ✅             |
| 장바구니 기반 주문 요청    | POST        | `/order/`                      | ✅             |

AuthAPI

| 기능                         | HTTP Method | URL                    | 인증 필요 여부 |
| ---------------------------- | ----------- | ---------------------- | -------------- |
| 로그인                       | POST        | `/accounts/login/`     | ❌             |
| 로그아웃                     | -           | - (로컬에서 토큰 제거) | ✅             |
| 로그인 상태 확인             | -           | -                      | ✅             |
| 토큰 상태 확인               | -           | -                      | ✅             |
| 장바구니 목록 조회           | GET         | `/cart/`               | ✅             |
| 장바구니 항목 상세 조회      | GET         | `/cart/{id}/`          | ✅             |
| 장바구니에 상품 추가         | POST        | `/cart/`               | ✅             |
| 장바구니 항목 수정           | PUT         | `/cart/{id}/`          | ✅             |
| 장바구니 항목 삭제           | DELETE      | `/cart/{id}`           | ✅             |
| 장바구니 전체 비우기         | DELETE      | `/cart/`               | ✅             |
| 상품 상세 페이지 → 직접 주문 | POST        | `/order/`              | ✅             |
| 장바구니 기반 전체 주문      | POST        | `/order/`              | ✅             |

💡 AuthAPI 특징

- 인증 토큰이 자동으로 관리됩니다.
- 액세스 토큰이 만료되면 자동으로 리프레시 토큰을 통해 재발급합니다.
- 리프레시 토큰이 없거나 만료되면 자동으로 로그아웃 처리됩니다.
- `fetchWithAuth`을 통해 인증이 필요한 요청에 항상 유효한 토큰을 전달합니다.
- API 호출 전 인증 필요 여부 ✅인 경우 자동으로 Bearer 토큰이 포함됩니다.

---

### 3. 주요 기능 구현


`config.js`는 공통으로 사용할 수 있는 함수를 호출해서 처리하도록 만들어 사용자간 반복되는 코딩을 최소화 했습니다.

`fetchWithAuth` 이 함수는 내부적으로 헤더를 만들 뿐만 아니라 실제로 API 요청을 보내고, 401 에러가 발생했을 때(토큰이 만료 되었을때) 토큰 재발급과 재시도 로직까지 포함합니다.

```javascript
// config.js
async fetchWithAuth(endpoint, options = {}) {
    //  URL 구성, 주소가 http로 시작하면 그대로, 아니면 기본 API_URL과 결합
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    // 로컬 스토리지에서 액세스 토큰 가져오기
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    // 기본 헤더 설정-> JSON 형식을 기본으로 하고, 토큰이 있으면 Authorization 헤더를 추가
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    try {
      //실제로 서버에 요청 보내기
      let response = await fetch(url, { ...options, headers });

      // 401 에러 시 토큰 재발급 로직
      // 응답 코드가 401이면 토큰이 만료 되었다는 것이니까 재발급을 위해 저장해둔 리프레쉬 토큰을 꺼냄
      if (response.status === 401) {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        // 만약 리프레쉬 토큰이 없으면 더 이상 진행 못하니까 에러 던짐
        if (!refreshToken) throw new Error("No refresh token");
        // 서버의 토큰 재발급 엔드포인트에 리프레시 토큰을 실어 보내기
        const refreshResponse = await fetch(
          `${API_URL}/accounts/token/refresh/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          }
        );
        // 재발급이 성공 했을때
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          //서버가 준 액세스 토큰을 로컬 스토리지에 다시 저장
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);

          // 새 토큰으로 헤더에 갈아 끼우고, 처음에 하려던 요청을 똑같이 다시 보냄
          return await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access}`, //새로 받은 토큰 적용
            },
          });
        } else {
          // 리프레시 실패 시 로그아웃 처리
          this.logout(); // 아래 logout 함수 활용
        }
      }
      if (!response.ok) {
        let message = "서버 요청에 실패했습니다.";
        try {
          const errorData = await response.json();
          // 서버 응답의 detail 또는 message 필드에서 에러 문구 추출
          message = errorData.detail || errorData.message || message;
        } catch (e) {
          /* JSON 파싱 실패 시 기본 메시지 유지 */
        }
        // 에러를 던져 호출한 곳의 catch 블록에서 잡히게 함
        throw new Error(message);
      }
      //모든 과정이 정상이라면, 재시도한 결과 응담을 반환
      return response;
    } catch (error) {
      // 예상치 못한 에러를 콘솔에 찍어주고 밖으로 던져줌
      console.error("Fetch 에러:", error);
      throw error;
    }
  }
```

---

modal.js는 페이지에서 필요한 modal을 공통으로 사용하기 위해 만들었습니다.
사용자의 의도에 따라 메세지 내용을 자유롭게 수정할수 있게 하고, 버튼도 필요에 따라 수정할 수 있습니다.
그리고 x버튼 또는 모달창 밖을 클릭했을 때, 모달창이 사라지도록 구현하였습니다.

```javascript
// modal.js
const Modal = {
  // 모달에 필요한 HTML 구조를 페이지에 자동 주입
  init() {
    if (document.getElementById("modal-overlay")) return;

    const modalHtml = `
      <div id="modal-overlay">
        <div class="modal-container">
          <button id="modal-close-x" class="modal-close-x">&times;</button>
          <div class="modal-content">
            <p id="modal-text"></p>
          </div>
          <div class="modal-footer">
            <button id="modal-btn-no">취소</button>
            <button id="modal-btn-yes" class="btn-primary">확인</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  },

  /**
   * 모달 열기 함수
   * @param {Object} options - { message, onConfirm, onCancel, confirmText, cancelText }
   */
  open({
    message,
    onConfirm,
    onCancel,
    confirmText = "확인",
    cancelText = "취소",
  }) {
    this.init(); // HTML 주입 확인

    const overlay = document.getElementById("modal-overlay");
    const textEl = document.getElementById("modal-text");
    const btnYes = document.getElementById("modal-btn-yes");
    const btnNo = document.getElementById("modal-btn-no");
    const btnX = document.getElementById("modal-close-x");

    textEl.innerText = message;
    btnYes.innerText = confirmText;
    btnNo.innerText = cancelText;

    // 취소 버튼 노출 여부 (cancelText가 빈 문자열이면 숨김)
    btnNo.style.display = cancelText ? "block" : "none";

    // 클릭 이벤트 바인딩
    btnYes.onclick = () => {
      if (onConfirm) onConfirm();
      this.close();
    };

    const handleCancel = () => {
      if (onCancel) onCancel();
      this.close();
    };

    btnNo.onclick = handleCancel;
    btnX.onclick = handleCancel;
    overlay.onclick = (e) => {
      if (e.target === overlay) handleCancel();
    };

    overlay.style.display = "flex";
  },

  close() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.style.display = "none";
  },
};

```

---

laysout.js는 로그인/회원가입을 제외한 모든 페이지에서 헤더와 푸터를 호출하여 각각 위 아래 배치하게 하기위해 만든 모듈입니다.

```javascript
// layout.js
loadHTMLToBody("../header.html", false);
loadHTMLToBody("../footer.html", true);

loadCSS("../styles/pages/header.css");
loadCSS("../styles/pages/footer.css");
async function loadHTMLToBody(url, append) {
  try {
    const res = await fetch(url);
    if (!res.ok) return; // 파일이 없으면 그냥 종료 (오류 방지)

    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    if (append) {
      document.body.append(...doc.body.children);
    } else {
      document.body.prepend(...doc.body.children);
    }

    if (url.includes("header.html")) {
      window.dispatchEvent(new CustomEvent("headerRendered"));
    }
  } catch (err) {
    console.error("레이아웃 로드 중 오류:", err);
  }
}
// async/await 불필요
// css는 브라우저에서 link 태그를 비동기로 로드함
function loadCSS(url) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

```

---

`handleAddToCart()`는 사용자가 장바구니에 상품을 담았을 때, 이미 상품이 담겨있거나 혹은 상품이 없는경우를 구분하여 있으면 상품 숫자를 더해주고, 없으면 상품정보를 추가해서 DB와, Session storaged에 담아 cart로 전달하는 함수입니다.

```javascript
// detail.js
async function handleAddToCart() {
  // 장바구니는 DB 기준이니까
  // 상세 페이지에서 중복 체크 후 PUT/POST 분기가 필요

  try {
    // Step 1️. DB 장바구니 조회
    const res = await Utils.fetchWithAuth(`/cart`, {});

    const data = await res.json();
    const cartItems = data.results;

    // Step 2️. 같은 상품 있는지 확인
    const existItem = cartItems.find(
      (item) => item.product.id === currentProduct.id
    );

    // DB 기준 저장
    // Step 3️. 있으면 → PUT (수량 증가)
    if (existItem) {
      await Utils.fetchWithAuth(`/cart/${existItem.id}/`, {
        method: "PUT",
        body: JSON.stringify({
          quantity: existItem.quantity + getQuantity(),
        }),
      });
    }
    // Step 4️. 없으면 → POST
    else {
      await Utils.fetchWithAuth(`/cart/`, {
        method: "POST",
        body: JSON.stringify({
          product_id: currentProduct.id,
          quantity: getQuantity(),
        }),
      });
    }

    // Step 5️. sessionStorage 저장 (UI용)
    saveCartDataToSession(currentProduct, getQuantity());

    // Step 6️. 모달 표시
    Modal.open({
      message: "장바구니에 담았습니다.",
      confirmText: "장바구니 이동",
      cancelText: "",
      onConfirm: () => {
        window.location.href = "cart.html";
      },
    });
  } catch (error) {
    console.error(error);
    Modal.open({
      message: error.message || "장바구니 처리 중 오류가 발생했습니다.",
      cancelText: "",
    });
  }
}
```

#### 3.3. 주요 기능 흐름

**index.js**: 상품 정보를 서버에서 호출하여 카드형식으로 랜더링 하고, 클릭 하여 상품 detail페이지로 이동 합니다.

**detail.js**: index에서 요청한 ID정보를 읽어들여 랜더링, 바로구매/장바구니 버튼을 누르면 로그인 여부를 확인 해서, 로그인 후 order데이터를 카트 혹은 결제 페이지로 전달

**cart.js**: 로그인 유무를 확인 후 detail페이지 에서 보낸 cartData를 랜더링하고, 주문을 누르면 orderData 담아서 order페이지로 요청 전달 

**order.js**: 받아들인 order데이터를 화면에 랜더링후 폼 작성 후, 결제 버튼을 누르면 폼 데이터를 서버에 호출후 결제 완료 모달을 띄우고 장바구니의 정보를 삭제함

**signin.js**: 구매자/판매자 탭으로 user_type을 지정, 로그인 버튼을 누르면 아이디 비밀번호 작성여부를 확인후 서버에 로그인 요청을 보내고, 유저 정보 및 토큰을 발급받음

**signup.js**: 구매자/판매자 탭으로 user_type을 지정, 이메일, 비밀번호, 전화번호 검증식을 걸쳐 체크박스에 동의 했을 때, 버튼이 활성화됨, 버튼은 누르면 폼 제작에 빈 내용이 있는지 확인후 검증식에 맞는 조건이면 회원가입 성공

---

### 4. 프로젝트 구조와 개발 일정

#### 4.1. 프로젝트 구조

```
web/
├── index.html              # 메인 페이지
├── header.html             # 상단 헤더
├── footer.html             # 하단 푸터
├── signin.html             # 로그인
├── signup.html             # 회원가입
├── detail.html             # 상품 상세
├── cart.html               # 장바구니
├── order.html              # 주문/결제
├── 404.html                # 404 에러 페이지
│
├── js/
│   ├── api/
│   │   ├── config.js       # API URL, 상수, 유틸리티 함수
│   ├── common/
│   │   ├── modal.js        # 헤더 공통 로직 (로그인 상태별 UI)
│   │   └── validation.js   # Validation 공통 모듈
│   ├── index.js            # 메인 페이지
│   ├── signin.js           # 로그인
│   ├── signup.js           # 회원가입
│   ├── detail.js           # 상품 상세
│   ├── cart.js             # 장바구니
│   ├── order.js            # 주문/결제
│   ├── header.js           # 헤더
│   └── layout.js           # 헤더/푸터 호출
│
├── styles/
│   ├── base/
│   │   ├── reset.css       # CSS 초기화
│   │   ├── variables.css   # CSS 변수
│   │   └── typography.css  # 타이포그래피
│   ├── components/
│   │   └── modal.css       # 모달
│   └── pages/
│       ├── index.css       # 메인 페이지
│       ├── cart.css        # 장바구니
│       ├── detail.css      # 상품 상세
│       ├── error.css       # 404 에러 페이지
│       ├── order.css       # 주문/결제
│       ├── signin.css      # 로그인
│       ├── signup.css      # 회원가입
│       ├── header.css      # 헤더
│       └── footer.css      # 푸터
│ 
└── assets/
    ├── icons/
    │   ├── icon-facebook.svg         # 404 에러 페이지
    │   ├── icon-group.svg            # 주문/결제
    │   ├── icon-instagram.svg        # 인스타그램
    │   ├── icon-shopping-cart.svg    # 쇼핑카트
    │   ├── icon-user.svg             # 유저
    │   ├── icon-youtube.svg          # 유튜브
    │   ├── search.svg                # 검색
    │   ├── sprite.svg                # SVG 아이콘 스프라이트
    │   └── README.MD                 # 스프라이트 사용법
    └── images/
        ├── error-404.png             # 404 에러 페이지
        ├── Logo-jadu-lg.png          # 자두 로고 대형
        ├── Logo-jadu.png             # 자두 로고
        ├── product1.png              # 상품 1번
        ├── product2.png              # 상품 2번
        ├── product3.png              # 상품 3번
        ├── product4.png              # 상품 4번
        └── product5.png              # 상품 5번
```

#### 4.2. 개발 일정

**진행 기간**: 2025.12.30 ~ 2026.01.08

프로젝트의 상세 일정 및 작업 분배는 Notion,디스코드를 통해 관리되었습니다. 일별 목표와 개인별 할당 작업 내역을 회의록에 기록해 확인하고, 디스코드로 실시간 작업 상황을 공유하며 진행 상황을 추적했습니다.

[🌐노션 링크](https://www.notion.so/3-2cd53392dbc080d8ba9ecce5ddb59c81)
<img width="1316" height="995" alt="스크린샷 2026-01-07 225204" src="https://github.com/user-attachments/assets/a7a0d53b-cf5e-42ce-8025-9d00e6446afe" />
<img width="1320" height="999" alt="스크린샷 2026-01-07 225227" src="https://github.com/user-attachments/assets/0ac4f507-ef8a-4046-a814-cdc2a9ef5554" />
<img width="1325" height="994" alt="스크린샷 2026-01-07 225246" src="https://github.com/user-attachments/assets/a35d0f70-bcdc-4e4d-b2b6-4cf321bdd698" />

---

### 5. 프로젝트 시연 영상

(이곳에 시연 git 참조)

---

### 6. 역할 분담

각 팀원은 다음과 같은 목표와 의도를 가지고 역할을 수행했습니다.

- **박재영 (팀장, 로그인/회원가입)**: 
1. 팀장으로서 팀원들을 이끌어 프로젝트를 주도하였습니다
   - 매일 팀원들의 진행사항을 파악, 인원간 작업 내용 배분 및 전체 일정을 조정하였습니다.
2. 로그인/회원가입 페이지 개발
   - 로그인 페이지에 폼으로  작성된 내용을 검증식을 통해 확인 후 서버에 호출하여 로그인/회원가입을 하는 기능 개발
- **조예린 (메인페이지/공통페이지)**: 
1. index.html / index.css / index.js를 포함하여 header, footer, 404 페이지까지 프로젝트 전반의 기본 페이지 및 공통 레이아웃 파일을 직접 구성함
2. 공통 header·footer 영역의 HTML·CSS·JS 구조를 설계하여, 페이지 간 일관된 UI와 재사용 가능한 레이아웃 구조를 구축함
3. 레이아웃, 간격, 정렬, 반응형 동작 등 UI 디테일을 세밀하게 조정하여 완성도 높은 화면 구현에 기여함
4. 헤더 아이콘을 기존 이미지 방식에서 SVG Sprite 구조로 전환하여, 아이콘 관리 효율 및 유지보수성을 개선함
5. 공통 컴포넌트 구조를 정리하고 파일 단위로 역할을 분리하여, 이후 기능 확장 및 협업에 용이한 프론트엔드 구조를 마련함

- **김연화 (상품정보 페이지)**:
- 김연화 (상세 페이지 / 상품 정보 및 사용자 진입 흐름) :
1. 페이지 구조 및 유지보수성을 고려한 프론트엔드 구현
  - HTML 구조와 클래스 네이밍을 역할 중심으로 정리하여, 가독성과 유지보수성을 고려한 마크업을 작성했습니다.
  - CSS와 JavaScript의 책임을 명확히 분리하고, 공통 유틸 및 팀 규칙에 맞춰 코드 스타일을 통일했습니다.
  - 기능 단위로 코드를 구성하여 추후 기능 확장 및 협업 시 충돌을 최소화하도록 작업했습니다.
2. 상품 목록 및 상세 페이지 데이터 렌더링
  - 상품 리스트 페이지에서 API 데이터를 기반으로 상품 카드 UI를 동적으로 생성하고, 가격·브랜드·이미지 등의 정보를 일관된 형식으로 출력했습니다.
  - 상품 상세 페이지에서는 단일 상품 정보, 옵션 선택, 수량 조절, 총 금액 계산 등 핵심 구매 정보를 직관적으로 확인할 수 있도록 구조를 설계했습니다.
  - 숫자 포맷팅, 기본 수량 처리 등 사용자 경험에 직접적으로 영향을 주는 요소를 세밀하게 구현했습니다.
3. 사용자 중심의 상품 탐색 흐름 설계 및 구현
  - 서비스 진입 시 사용자가 자연스럽게 상품을 탐색할 수 있도록 로그인 → 상품 목록 → 상품 상세 페이지로 이어지는 전체 사용자 흐름을 설계했습니다.
  - URL 파라미터 기반 상품 ID 처리 및 API 연동을 통해 상품 데이터를 안정적으로 렌더링하고, 페이지 이동 시에도 사용자 맥락이 유지되도록 구현했습니다.
  - 초기 진입 장벽을 낮추고 이탈을 최소화하기 위해 UI 흐름과 데이터 로딩 순서를 고려한 화면 구성에 집중했습니다.

- **배준우 (장바구니 페이지/공통JS)**: 
1. 팀원들과 협력하여 전역 인증 시스템 인터셉터 및 통신 규격 설계 했습니다.
    - JWT 인증 자동화: fetch API를 래핑한 인증 인터셉터를 구현하여, 모든 API 요청에 인증 헤더가 자동으로 주입되도록 표준화했습니다.
    - Silent Refresh 로직 구현: 액세스 토큰 만료(401 에러) 발생 시 리프레시 토큰을 이용한 자동 토큰 갱신 및 요청 재시도(Retry) 프로세스를 설계하여, 사용자 이탈 없는 매끄러운 인증 UX를 제공했습니다.
    - config.js 내에 경로 상수화, 숫자 포맷팅, 세션 스토리지 관리 유틸 함수를 구축하여 팀원 간 코드 중복을 최소화하고 개발 생산성을 향상시켰습니다.
2. 재사용 가능한 공통 컴포넌트 및 인터페이스 개발
    - 커스텀 모달 컴포넌트 설계: 프로젝트 디자인 가이드를 준수하는 확장형 모달 시스템을 구축하여, 다양한 사용 시나리오에 대응 가능한 공통 UI 로직을 구현했습니다.
    - 인터랙티브 헤더 구현: 로그인 상태에 따라 아이콘을 동적으로 렌더링하고, 상품 탐색을 위한 검색 엔진 인터페이스를 구현했습니다.
3. 장바구니 시스템
    - 요구사항에 최적화된 상품 리스트, 수량 조절 컴포넌트, 선택 상품 필터링 기능을 전담하여 구현했습니다.

- **나기영 (주문 페이지)**:
1. 결제 페이지(Order Page) 전반을 단독으로 설계 및 구현하여, 바로구매와 장바구니 주문을 모두 지원하는 통합 주문 흐름을 구축 했습니다.
2. sessionStorage 기반 주문 데이터 구조를 설계하고, 장바구니(cart_order)와 바로구매(direct_order) 케이스를 단일 인터페이스로 정규화하여 처리 했습니다.
3. 주문 페이지 진입 시 저장된 주문 데이터를 파싱하여 상품 정보 렌더링, 수량·금액 계산, 최종 결제 금액 산출 로직을 구현 했습니다.
4. 서버 API 스펙에 맞춰 주문 요청 Payload를 동적으로 생성하는 로직을 구현하여 주문 타입별(cart/direct) 분기 처리를 했습니다.
5. 결제 동의, 배송 정보, 결제 수단 선택 등 폼 검증 로직을 구현하여 잘못된 주문 요청을 사전에 차단 했습니다.
6. 인증 인터셉터 기반 API 구조와 연동하여, 인증 상태를 고려한 주문 요청 및 에러 처리(401, 400 등) UX를 설계 했습니다.
7. 주문 완료 후 sessionStorage 정리 및 페이지 이동 처리로 결제 흐름 종료까지의 사용자 경험을 안정적으로 구성 했습니다.

---

### 7. 화면 설계

프로젝트의 전체적인 UI/UX 디자인은 제공된 피그마(Figma) 시안을 기반으로 구현되었습니다.
[🌐피그마 링크](https://www.figma.com/design/86GxsHTa7nXPKM8S15WOVw/EST_SECURITY_FE_%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%B2?node-id=110560-1244&t=eZKxQTYs3VIS2UzT-0)

---

### 8. 데이터베이스 모델링

본 프로젝트는 백엔드 API가 이미 구축된 상태에서 시작되었으므로, 팀에서 직접 데이터베이스를 모델링하지 않았습니다. API 응답 데이터 구조 분석을 통해 `User`, `Product`, `CartItem` 등의 데이터 관계를 파악하여 개발을 진행했습니다.

---

### 9. 협업 방식

- **Git-flow Strategy**: `main`과 `develop` 브랜치를 중심으로, 각자 자신의 브랜치를 생성하여 작업하는 Git-flow 전략을 사용했습니다. 모든 코드는 Pull Request와 동료 리뷰를 통해서만 `develop` 브랜치에 병합되었습니다.
- **커밋 메세지 관리**: `feat:`, `fix:`, `style:` 등 정해진 커밋 메세지를 따라 커밋 히스토리의 가독성을 확보했습니다.
- **커뮤니케이션**: Notion으로 전체 업무 계획을 수립하고, Discord를 통해 각자의 작업 완료 내용을 실시간으로 공유하며 진행 상황을 투명하게 관리했습니다.

---

### 10. 개발하며 느낀점 (프로젝트 회고)

#### 10.1. 주요 성과

- 실전과 같은 팀 프로젝트를 통해 조원들간 소통 및 의견 제시를 주고받음으로써, 협업능력을 향상했다.

- API 데이터 교환을 이용한 웹 퍼블리싱의 기술을 연마하고 부족한 코딩기술을 상향시켰다.

#### 10.2. 개선점

- 처음 작업을 시작할때 공통css를 먼저 잘 선언하고 어떤 방식으로 font-size를 조절할지 조정을 하지 않아서 서로간 페이지가 일관성이 없었다.

- 서로의 데이터 전달 방법을 맞추지 않아서 그걸 개선하는데 시간이 많이 걸렸었다. 전체적 구성을 파악하는 시간을 가지는것이 좋을것 같다.

---

### Devloper pages

>[박재영](https://github.com/wodud2626)
 [김연화](https://github.com/yeonaa95) 
 [배준우](https://github.com/bjw9415-oss) 
 [나기영](https://github.com/Deco4710)
 [조예린](https://github.com/yealin00)
