import { Validation } from "./common/validation.js";

// 탭 전환 (구매회원/판매회원)

const buyerTab = document.getElementById("buyer-tab");
const sellerTab = document.getElementById("seller-tab");

buyerTab.addEventListener("click", () => {
  buyerTab.classList.add("active");
  sellerTab.classList.remove("active");
  sellerFields.style.display = "none";
});

sellerTab.addEventListener("click", () => {
  sellerTab.classList.add("active");
  buyerTab.classList.remove("active");
  sellerFields.style.display = "block";
});

// 비밀번호 재확인

const passwordInput = document.getElementById("password");
const passwordConfirm = document.getElementById("passwordConfirm");
passwordInput.addEventListener("input", validatePassword);
passwordConfirm.addEventListener("input", validatePassword);

// 아이디(이메일) 중복 확인

document.addEventListener("DOMContentLoaded", () => {
  const checkBtn = document.getElementById("check-username-btn");
  checkBtn.addEventListener("click", checkUsername);
});

async function checkUsername() {
  const usernameInput = document.getElementById("username");
  const username = usernameInput.value;
  const usernameMessage = document.getElementById("username-message");

  if (!username) {
    Validation.showMessage(
      usernameInput,
      usernameMessage,
      "아이디를 입력해주세요.",
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
    const response = await fetch(
      "http://localhost:3000/api/accounts/validate-username",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }
    );

    const data = await response.json();

    if (response.ok && data.Success) {
      Validation.showMessage(
        usernameInput,
        usernameMessage,
        "사용 가능한 아이디입니다.",
        "success"
      );
      isUsernameChecked = true;
    } else {
      Validation.showMessage(
        usernameInput,
        usernameMessage,
        "이미 사용 중인 아이디입니다.",
        "error"
      );
      isUsernameChecked = false;
    }
  } catch (error) {
    console.error("아이디 중복 확인 오류:", error);
    alert("아이디 중복 확인에 실패했습니다.");
  }
}

// 비밀번호 Validation
function validatePassword() {
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value;
  const passwordConfirmInput = document.getElementById("passwordConfirm");
  const passwordConfirm = passwordConfirmInput.value;
  const passwordMessage = document.getElementById("passwordMessage");
  const passwordConfirmMessage = document.getElementById(
    "passwordConfirmMessage"
  );

  // 비밀번호 길이 체크
  if (0 < password.length && password.length < 8) {
    Validation.showMessage(
      passwordInput,
      passwordMessage,
      "비밀번호는 8자 이상이어야 합니다.",
      "error"
    );
    return false;
  } else {
    Validation.clearMessage(passwordInput, passwordMessage);
  }

  // 비밀번호 일치 확인
  if (passwordConfirm === "") {
    Validation.clearMessage(passwordConfirmInput, passwordConfirmMessage);
    return false;
  }

  if (password === passwordConfirm) {
    Validation.showMessage(
      passwordConfirmInput,
      passwordConfirmMessage,
      "비밀번호가 일치합니다.",
      "success"
    );
    return false;
  }

  Validation.showMessage(
    passwordConfirmInput,
    passwordConfirmMessage,
    "비밀번호가 일치하지 않습니다.",
    "error"
  );
  return true;
}

// 전화번호 Validation
function validatePhone() {
  const phone1 = document.getElementById("phone1").value;
  const phone2 = document.getElementById("phone2").value;
  const phone3 = document.getElementById("phone3").value;

  if (!Validation.isValidPhone(phone1, phone2, phone3)) {
    Validation.showMessage(
      phoneInput,
      phoneMessage,
      "올바른 전화번호 형식이 아닙니다.",
      "error"
    );
    return false;
  }

  return true;
}

// 구매회원 회원가입 제출
async function handleBuyerSignup(e) {
  e.preventDefault();

  // Validation 체크
  if (!isUsernameChecked) {
    alert("아이디 중복 확인을 해주세요.");
    return;
  }

  if (!validatePassword()) {
    return;
  }

  if (!validatePhone()) {
    return;
  }

  const formData = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    name: document.getElementById("name").value,
    phone_number: `${document.getElementById("phone1").value}-${
      document.getElementById("phone2").value
    }-${document.getElementById("phone3").value}`,
  };

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/buyer/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("회원가입이 완료되었습니다.");
      window.location.href = "signin.html";
    } else {
      throw new Error(data.detail || "회원가입에 실패했습니다.");
    }
  } catch (error) {
    console.error("회원가입 오류:", error);
    alert(error.message);
  }
}
