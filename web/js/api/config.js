const API_URL = "http://localhost:3000/api";
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
};

const Utils = {
  getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
};
// 1. 인증 헤더 자동 생성 (getAuthHeaders)
// 명세서에서 자물쇠 아이콘이 있는 보안 API를 호출할 때 가장 중요.

// localStorage에서 access_token을 매번 수동으로 꺼내올 필요가 없게 된다.

// 함수 하나로 "Authorization": "Bearer {token}" 형식을 만들어주어 코드가 깔끔.

// 2. 로그인 상태 통합 관리 (isLoggedIn, getUser)
// 여러 페이지에서 사용자의 상태를 확인할 때 기준을 하나로 통일.

// isLoggedIn(): 토큰 존재 여부를 확인해 장바구니 담기나 주문 가능 여부를 판단.

// getUser(): 저장된 사용자 정보(구매자/판매자 구분 등)를 객체 형태로 안전하게 가져오기.

// 3. 데이터 포맷팅 (formatNumber)
// 사용자에게 보여줄 데이터를 보기 좋게 가공.

// 숫자 데이터를 17,500원처럼 세 자리마다 콤마(,)를 찍어주는 기능을 모든 페이지에서 공통으로 사용합니다.

// 재발급 로직이 포함된 공통 함수
async function fetchWithAuth(endpoint, options = {}) {
  // 1. URL 결합 (endpoint가 /로 시작하면 제거 후 결합)
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  // 2. 기본 헤더 설정
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // 3. 401 에러(토큰 만료) 발생 시
    if (response.status === 401) {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      // 리프레시 토큰 요청 (서버 주소에 맞게 수정 필요)
      const refreshResponse = await fetch(
        `${API_URL}/accounts/token/refresh/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        // 기존에 정의한 STORAGE_KEYS.ACCESS_TOKEN 사용
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);

        // 4. 새 토큰으로 원래 요청 재시도
        return await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access}`,
          },
        });
      } else {
        // 리프레시 실패 시 로그아웃 처리
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = "signin.html";
      }
    }

    return response;
  } catch (error) {
    console.error("Fetch 에러:", error);
    throw error;
  }
}
