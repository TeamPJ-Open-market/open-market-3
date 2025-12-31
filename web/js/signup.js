// 1. 모든 탭 버튼 요소를 선택합니다.
const tabLinks = document.querySelectorAll(".tab-link");

// 2. 각 버튼마다 클릭 이벤트 리스너를 등록합니다.
tabLinks.forEach((button) => {
  button.addEventListener("click", function (event) {
    // 3. 모든 버튼에서 'active' 클래스를 제거합니다.
    tabLinks.forEach((btn) => btn.classList.remove("active"));

    // 4. 클릭된 바로 그 버튼(this 또는 event.currentTarget)에 'active'를 추가합니다.
    this.classList.add("active");

    // 5. 아까 HTML에 적어둔 data-type 값을 가져와 확인합니다.
    const memberType = this.getAttribute("data-type");
    console.log(memberType + " 로그인 모드 활성화");
  });
});
