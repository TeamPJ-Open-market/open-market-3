// Validation 공통 모듈
export const Validation = {
  showMessage(inputElement, messageElement, message, type) {
    inputElement.classList.remove("error", "success");
    messageElement.classList.remove("error", "success");

    if (type === "error" || type === "success") {
      inputElement.classList.add(type);
      messageElement.classList.add(type);
    }

    messageElement.textContent = message;
  },

  clearMessage(inputElement, messageElement) {
    inputElement.classList.remove("error", "success");
    messageElement.classList.remove("error", "success");
    messageElement.textContent = "";
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPhone(phone1, phone2, phone3) {
    return (
      /^\d{3}$/.test(phone1) && /^\d{4}$/.test(phone2) && /^\d{4}$/.test(phone3)
    );
  },
};

// 설명:
// 이 Validation 모듈은 웹 애플리케이션에서 자주 쓰이는 입력 검증과 메시지 표시 기능을
// 하나로 묶어놓은 공통 유틸리티입니다. 주로 로그인, 회원가입, 프로필 수정 같은 폼에서
// 사용됩니다.
// 1. showMessage (결과 표시)
// 입력창(inputElement)과 그 아래 메시지 창(messageElement)에 색깔과 문구를 넣어주는 핵심 함수입니다.

// error일 때: 입력창 테두리를 빨갛게 만들고 "아이디를 입력하세요" 같은 경고를 띄웁니다.

// success일 때: 입력창 테두리를 초록색으로 만들고 "사용 가능한 아이디입니다" 같은 메시지를 띄웁니다.

// 2. clearMessage (초기화)
// 사용자가 오타를 수정하려고 다시 입력을 시작할 때, 기존에 떠 있던 빨간 테두리나 에러 문구를 싹 지워주는
// 역할을 합니다. (보통 input 이벤트에 연결해서 씁니다.)

// 3. isValidEmail, isValidPhone (형식 검사)
// 서버로 데이터를 보내기 전, 브라우저에서 먼저 "이게 진짜 이메일 형식이 맞아?" 혹은 **"전화번호 숫자가
//  제대로 입력됐어?"**를 정규표현식(Regex)으로 검사합니다.
