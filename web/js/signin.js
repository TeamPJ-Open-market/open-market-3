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
