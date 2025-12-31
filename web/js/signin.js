function openTab(event, memberType) {
  // 1. 모든 탭 링크에서 'active' 클래스 제거
  const tabLinks = document.getElementsByClassName("tab-link");
  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].classList.remove("active");
  }

  // 2. 클릭한 버튼에 'active' 클래스 추가
  event.currentTarget.classList.add("active");

  // (참고) 필요하다면 여기서 memberType에 따라 폼의 action 주소나 텍스트를 변경할 수 있습니다.
  console.log(memberType + " 로그인 모드 활성화");
}
