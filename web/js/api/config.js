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
