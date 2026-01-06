// URL에서 product_id 추출 / detail에서 옴
const urlParams = new URLSearchParams(window.location.search);
const redirect = urlParams.get("redirect");

//로그인 유무확인
window.onload = function () {
  if (Utils.isLoggedIn()) {
    location.replace("/index.html");
  }
};

/// 탭 전환 (구매회원/판매회원)
const buyerTab = document.getElementById("buyer-tab");
const sellerTab = document.getElementById("seller-tab");
let userType = "BUYER";

buyerTab.addEventListener("click", () => {
  buyerTab.classList.add("active");
  sellerTab.classList.remove("active");
  userType = "BUYER";
});

sellerTab.addEventListener("click", () => {
  sellerTab.classList.add("active");
  buyerTab.classList.remove("active");
  userType = "SELLER";
});

/**
 * (변수일때 주석)
 * 로그인
 * usernameInput - 아이디
 * passwordInput - 비밀번호
 * usernameMessage - 경고 메세지
 */
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const usernameMessage = document.getElementById("username-message");

//경고메세지 영역 clear
const clearValidationMessage = () => {
  Validation.clearMessage(usernameInput, usernameMessage);
};

//경고메세지 영역 clear event 선언
usernameInput.addEventListener("input", clearValidationMessage);
passwordInput.addEventListener("input", clearValidationMessage);

// 로그인
// event (obj 값들)
// @param id
// @param password
async function handleSignin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const usernameMessage = document.getElementById("username-message");

  // 아이디 비밀번호 공백 경고 메세지
  if (!username || !password) {
    Validation.showMessage(
      usernameInput,
      usernameMessage,
      "아이디와 비밀번호를 입력해 주세요.",
      "error"
    );
    return;
  }
  if (!Validation.isValidEmail(username)) {
    Validation.showMessage(
      usernameInput,
      usernameMessage,
      "올바른 이메일 형식이 아닙니다.",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(`${API_URL}/accounts/signin/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Validation.showMessage(
        usernameInput,
        usernameMessage,
        "아이디 또는 비밀번호를 확인해주세요.",
        "error"
      );
    }

    // 사용자 타입 확인
    if (data.user.user_type !== userType) {
      alert(
        `${
          userType === "BUYER" ? "구매회원" : "판매회원"
        } 계정으로 로그인해주세요.`
      );
      return;
    }

    // LocalStorage에 토큰 및 사용자 정보 저장
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));

    // 요청페이지로 이동
    if (redirect) {
      window.location.href = redirect;
      return;
    }

    // 사용자 타입에 따라 페이지 이동
    if (data.user.user_type === "BUYER") {
      window.location.href = "index.html";
    } else if (data.user.user_type === "SELLER") {
      window.location.href = "seller-center.html";
    }
  } catch (error) {
    console.error("로그인 오류:", error);
    alert("로그인에 실패했습니다.");
  }
}

// 폼 제출 이벤트
const signinForm = document.getElementById("signin-form");
signinForm.addEventListener("submit", handleSignin);
