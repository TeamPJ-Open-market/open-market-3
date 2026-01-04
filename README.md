# 여기에 발표자료를 작성해 주세요.

[발표자료 안내](https://www.notion.so/2-2be53392dbc080a992feefb1089d413a?source=copy_link)


### 폴더 구조 ###

web/
├── index.html              # 메인 페이지
├── header.html             # 상단 헤더
├── footer.html             # 하단 푸터
├── signin.html             # 로그인
├── signup.html             # 회원가입
├── detail.html             # 상품 상세
├── cart.html               # 장바구니
├── order.html              # 주문/결제
├── error.html              # 404 에러 페이지
│
├── js/
│   ├── api/
│   │   ├── config.js       # API URL, 상수, 유틸리티 함수
│   ├── common/
│   │   ├── header.js       # 헤더 공통 로직 (로그인 상태별 UI)
│   │   └── validation.js   # Validation 공통 모듈
│   ├── index.js            # 메인 페이지
│   ├── signin.js           # 로그인
│   ├── signup.js           # 회원가입
│   ├── detail.js           # 상품 상세
│   ├── cart.js             # 장바구니
│   ├── order.js            # 주문/결제
│   ├── seller-center.js    # 판매자 센터
│   └── product-upload.js   # 상품 등록/수정
│
├── styles/
│   ├── base/
│   │   ├── reset.css       # CSS 초기화
│   │   ├── variables.css   # CSS 변수
│   │   └── typography.css  # 타이포그래피
│   ├── components/
│   │   ├── modal.css       # 모달 스타일
│   │   ├── header.css      # 헤더 스타일
│   │   └── footer.css      # 푸터 스타일
│   └── pages/
│       ├── index.css       # 메인 페이지
│       ├── cart.css        # 장바구니
│       ├── detail.css      # 상품 상세
│       ├── error.css       # 404 에러 페이지
│       ├── order.css       # 주문/결제
│       ├── signin.css      # 로그인
│       ├── signup.css      # 회원가입
│       └── ...
└── assets/
    ├── icons/
    │   └── sprite.svg      # SVG 아이콘 스프라이트
    └── images/
        └── Logo-jadu.png   # 로고 이미지