/**
 * 공통 모달 제어 시스템
 */
export const Modal = {
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
