const BASE_URL = "/api/cart";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

export const cartApi = {
  getList() {
    return fetch(BASE_URL + "/", {
      headers: getAuthHeaders(),
    }).then((res) => res.json());
  },

  add(productId, quantity) {
    return fetch(BASE_URL + "/", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  updateQuantity(cartItemId, quantity) {
    return fetch(`${BASE_URL}/${cartItemId}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
  },

  remove(cartItemId) {
    return fetch(`${BASE_URL}/${cartItemId}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  clear() {
    return fetch(BASE_URL + "/", {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },
};
