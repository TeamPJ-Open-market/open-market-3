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

    // ⭐ 신호 보내기 (이걸 듣는 파일이 없어도 오류 안 남)
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
