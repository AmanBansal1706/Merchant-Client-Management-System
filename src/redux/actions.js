import axios from "axios";
import { toast } from "react-toastify";

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const FETCH_CLIENTS = "FETCH_CLIENTS";
export const PAGINATION = "PAGINATION";
export const FETCH_FILTERED_CLIENTS = "FETCH_FILTERED_CLIENTS";
export const CLIENTS_LIST = "CLIENTS_LIST";
export const STORE_FILTER_DATA = "STORE_FILTER_DATA";
export const IS_BTN_DISABLED = "IS_BTN_DISABLED";
export const ADD_CLIENT = "ADD_CLIENT";
export const UPDATE_BALANCE = "UPDATE_BALANCE";
export const DELETE_CLIENT = "DELETE_CLIENT";
export const FETCH_HISTORY = "FETCH_HISTORY";
export const UPDATE_CLIENT = "UPDATE_CLIENT";
export const UPDATE_PURCHASE = "UPDATE_PURCHASE";

const API_URL = "http://localhost:5000/api";
const config = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const multipartConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
});

const errorToastStyle = { background: "#f44336", color: "#fff" };
const successToastStyle = { background: "#4caf50", color: "#fff" };

export const addClient = (token, clientData) => async (dispatch) => {
  if (!token) {
    toast.error("No authentication token found", { style: errorToastStyle });
    throw new Error("Missing token");
  }
  if (!clientData?.client?.name) {
    toast.error("Client name is required", { style: errorToastStyle });
    throw new Error("Missing client name");
  }
  try {
    const clientFormData = new FormData();
    clientFormData.append("name", clientData.client.name);
    if (clientData.client.address)
      clientFormData.append("address", clientData.client.address);
    if (clientData.client.photos && Array.isArray(clientData.client.photos)) {
      if (clientData.client.photos.length > 15) {
        toast.error("Cannot upload more than 15 photos", {
          style: errorToastStyle,
        });
        throw new Error("Cannot upload more than 15 photos");
      }
      clientData.client.photos.forEach((photo) =>
        clientFormData.append("photos", photo)
      );
    }
    const clientRes = await axios.post(
      `${API_URL}/clients`,
      clientFormData,
      multipartConfig(token)
    );
    const newClient = { ...clientRes.data, items: clientRes.data.items || [] };

    if (clientData.purchases && Array.isArray(clientData.purchases)) {
      for (const purchase of clientData.purchases) {
        if (!purchase.item_name || !purchase.price) {
          toast.warn(
            `Skipping invalid purchase: ${purchase.item_name || "Unnamed"}`
          );
          continue;
        }
        const purchaseFormData = new FormData();
        purchaseFormData.append("client_id", clientRes.data.id);
        purchaseFormData.append("item_name", purchase.item_name);
        const price = Number(purchase.price);
        const remainingBalance = Number(purchase.remaining_balance || 0);
        purchaseFormData.append("price", price);
        purchaseFormData.append("remaining_balance", remainingBalance);

        if (purchase.images && Array.isArray(purchase.images)) {
          if (purchase.images.length > 15) {
            toast.error("Cannot upload more than 15 images per purchase", {
              style: errorToastStyle,
            });
            throw new Error("Cannot upload more than 15 images per purchase");
          }
          purchase.images.forEach((image) =>
            purchaseFormData.append("images", image)
          );
        }

        const purchaseRes = await axios.post(
          `${API_URL}/purchases`,
          purchaseFormData,
          multipartConfig(token)
        );
        const fixedPurchase = {
          ...purchaseRes.data,
          price: parseInt(purchaseRes.data.price, 10),
          remaining_balance: parseInt(purchaseRes.data.remaining_balance, 10),
        };
        newClient.items.push(fixedPurchase);
        await dispatch(fetchHistory(token, fixedPurchase.id));
      }
    }
    dispatch({ type: ADD_CLIENT, payload: newClient });
    toast.success("Client added successfully", { style: successToastStyle });
    return newClient;
  } catch (error) {
    const message =
      error.response?.data?.error || error.message || "Failed to add client";
    console.error("[actions] addClient error:", message);
    toast.error(message, { style: errorToastStyle });
    throw error;
  }
};

export const login = (username, password) => async (dispatch) => {
  if (!username || !password) {
    toast.error("Username and password are required", {
      style: errorToastStyle,
    });
    throw new Error("Missing credentials");
  }
  try {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    dispatch({ type: LOGIN_SUCCESS, payload: res.data.token });
    localStorage.setItem("token", res.data.token);
    toast.success("Logged in successfully!", { style: successToastStyle });
    return res.data.token;
  } catch (error) {
    const message = error.response?.data?.error || "Login failed";
    console.error("[actions] login error:", message);
    toast.error(message, { style: errorToastStyle });
    throw error;
  }
};

export const fetchClients = (token) => async (dispatch) => {
  if (!token) {
    toast.error("Please log in to fetch clients", { style: errorToastStyle });
    throw new Error("Missing token");
  }
  try {
    const res = await axios.get(`${API_URL}/clients`, config(token));
    const fixedClients = res.data.map((client) => ({
      ...client,
      items: (client.items || []).map((item) => ({
        ...item,
        price: parseInt(item.price, 10),
        remaining_balance: parseInt(item.remaining_balance, 10),
      })),
    }));
    dispatch({ type: FETCH_CLIENTS, payload: fixedClients });

    const itemIds = fixedClients.flatMap((client) =>
      client.items.map((item) => item.id)
    );
    await Promise.all(itemIds.map((id) => dispatch(fetchHistory(token, id))));

    return fixedClients;
  } catch (error) {
    const message =
      error.response?.status === 404
        ? "Clients endpoint not found"
        : "Failed to fetch clients";
    console.error("[actions] fetchClients error:", message);
    toast.error(message, { style: errorToastStyle });
    dispatch({ type: FETCH_CLIENTS, payload: [] });
    throw error;
  }
};

export const pagination = (currPage) => async (dispatch) => {
  dispatch({
    type: PAGINATION,
    payload: currPage < 0 ? 0 : currPage,
  });
};

export const storeFilterData = (filterData) => async (dispatch) => {
  dispatch({
    type: STORE_FILTER_DATA,
    payload: filterData,
  });
};

export const isBtnDisabled = (filterData) => async (dispatch) => {
  dispatch({
    type: IS_BTN_DISABLED,
    payload: filterData,
  });
};

export const clientsList = (bufferData) => async (dispatch) => {
  dispatch({ type: CLIENTS_LIST, payload: bufferData })
};

export const fetchFilteredClients = (token, filterName, filterValue, page = 0) => async (dispatch) => {
  if (!token) {
    toast.error("Please log in to fetch clients", { style: errorToastStyle });
    throw new Error("Missing token");
  }
  try {
    const filterURL = filterName ? `${filterName}/${filterValue}` : "";
    const res = await axios.get(`${API_URL}/clients/${page}/${filterURL}`, config(token));
    const fixedClients = res.data.map((client) => ({
      ...client,
      items: (client.items || []).map((item) => ({
        ...item,
        price: parseInt(item.price, 10),
        remaining_balance: parseInt(item.remaining_balance, 10),
      })),
    }));
    await dispatch({ type: FETCH_FILTERED_CLIENTS, payload: fixedClients });
    const itemIds = fixedClients.flatMap((client) =>
      client.items.map((item) => item.id)
    );
    await Promise.all(itemIds.map((id) => dispatch(fetchHistory(token, id))));
    return fixedClients;
  } catch (error) {
    const message =
      error.response?.status === 404
        ? "Clients endpoint not found"
        : "Failed to fetch clients";
    console.error("[actions] fetchClients error:", message);
    toast.error(message, { style: errorToastStyle });
    dispatch({ type: FETCH_CLIENTS, payload: [] });
    throw error;
  }
};

export const updateClient =
  (token, clientId, clientData) => async (dispatch) => {
    if (!token) {
      toast.error("No authentication token found", { style: errorToastStyle });
      throw new Error("Missing token");
    }
    if (!clientData?.name) {
      toast.error("Client name is required", { style: errorToastStyle });
      throw new Error("Missing client name");
    }
    try {
      const clientFormData = new FormData();
      clientFormData.append("name", clientData.name);
      if (clientData.address)
        clientFormData.append("address", clientData.address);
      if (clientData.photos && Array.isArray(clientData.photos)) {
        clientData.photos.forEach((photo) =>
          clientFormData.append("photos", photo)
        );
      }
      clientFormData.append(
        "existingPhotos",
        JSON.stringify(clientData.existingPhotos || [])
      );
      const clientRes = await axios.put(
        `${API_URL}/clients/${clientId}`,
        clientFormData,
        multipartConfig(token)
      );
      let updatedClient = {
        ...clientRes.data,
        items: clientRes.data.items || [],
      };

      const submittedItems = clientData.items || [];
      const itemPromises = submittedItems.map(async (item) => {
        const purchaseFormData = new FormData();
        purchaseFormData.append("item_name", item.item_name);
        const newPrice = Number(item.price);
        purchaseFormData.append("price", newPrice);
        purchaseFormData.append(
          "remaining_balance",
          Number(item.remaining_balance)
        );
        if (item.images && Array.isArray(item.images)) {
          item.images.forEach((image) =>
            purchaseFormData.append("images", image)
          );
        }
        purchaseFormData.append(
          "existingImages",
          JSON.stringify(item.existingImages || [])
        );

        if (item.purchaseId) {
          const purchaseRes = await axios.put(
            `${API_URL}/purchases/${item.purchaseId}`,
            purchaseFormData,
            multipartConfig(token)
          );
          const fixedPurchase = {
            ...purchaseRes.data,
            price: parseInt(purchaseRes.data.price, 10),
            remaining_balance: parseInt(purchaseRes.data.remaining_balance, 10),
          };
          await dispatch(fetchHistory(token, item.purchaseId));
          return fixedPurchase;
        } else {
          purchaseFormData.append("client_id", clientId);
          const purchaseRes = await axios.post(
            `${API_URL}/purchases`,
            purchaseFormData,
            multipartConfig(token)
          );
          const fixedPurchase = {
            ...purchaseRes.data,
            price: parseInt(purchaseRes.data.price, 10),
            remaining_balance: parseInt(purchaseRes.data.remaining_balance, 10),
          };
          await dispatch(fetchHistory(token, fixedPurchase.id));
          return fixedPurchase;
        }
      });

      const allItemsToDelete = Array.isArray(clientData.itemsToDelete)
        ? clientData.itemsToDelete.filter((id) => id)
        : [];
      if (allItemsToDelete.length > 0) {
        await Promise.all(
          allItemsToDelete.map((purchaseId) =>
            axios.delete(`${API_URL}/purchases/${purchaseId}`, config(token))
          )
        );
      }

      updatedClient.items = await Promise.all(itemPromises);
      dispatch({
        type: UPDATE_CLIENT,
        payload: { id: parseInt(clientId), updatedClient },
      });
      toast.success("Client updated successfully", {
        style: successToastStyle,
      });
      return updatedClient;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to update client";
      console.error("[actions] updateClient error:", message);
      toast.error(message, { style: errorToastStyle });
      throw error;
    }
  };

export const updatePurchase =
  (token, purchaseId, purchaseData) => async (dispatch) => {
    if (!token) {
      toast.error("No authentication token found", { style: errorToastStyle });
      throw new Error("Missing token");
    }
    try {
      const purchaseFormData = new FormData();
      purchaseFormData.append("item_name", purchaseData.item_name);
      const newPrice = Number(purchaseData.price);
      purchaseFormData.append("price", newPrice);
      purchaseFormData.append(
        "remaining_balance",
        Number(purchaseData.remaining_balance)
      );
      if (purchaseData.images)
        purchaseFormData.append("images", purchaseData.images);
      if (purchaseData.existingImages)
        purchaseFormData.append(
          "existingImages",
          JSON.stringify(purchaseData.existingImages)
        );

      const purchaseRes = await axios.put(
        `${API_URL}/purchases/${purchaseId}`,
        purchaseFormData,
        multipartConfig(token)
      );
      const fixedPurchase = {
        ...purchaseRes.data,
        price: parseInt(purchaseRes.data.price, 10),
        remaining_balance: parseInt(purchaseRes.data.remaining_balance, 10),
      };

      dispatch({
        type: UPDATE_PURCHASE,
        payload: { purchaseId, updatedPurchase: fixedPurchase },
      });
      await dispatch(fetchHistory(token, purchaseId));
      toast.success("Purchase updated successfully", {
        style: successToastStyle,
      });
      return fixedPurchase;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to update purchase";
      console.error("[actions] updatePurchase error:", message);
      toast.error(message, { style: errorToastStyle });
      throw error;
    }
  };

export const updateBalance =
  (token, purchaseId, newBalance) => async (dispatch) => {
    if (!token) {
      toast.error("No authentication token found", { style: errorToastStyle });
      throw new Error("Missing token");
    }
    const newBalanceNum = Number(newBalance);
    if (isNaN(newBalanceNum) || newBalanceNum < 0) {
      toast.error("Invalid balance value", { style: errorToastStyle });
      throw new Error("Invalid balance");
    }
    try {
      await axios.put(
        `${API_URL}/purchases/${purchaseId}`,
        { remaining_balance: newBalanceNum },
        config(token)
      );
      dispatch({
        type: UPDATE_BALANCE,
        payload: { purchaseId, newBalance: newBalanceNum },
      });
      await dispatch(fetchHistory(token, purchaseId));
      toast.success("Balance updated successfully", {
        style: successToastStyle,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Failed to update balance";
      console.error("[actions] updateBalance error:", message);
      toast.error(message, { style: errorToastStyle });
      throw error;
    }
  };

export const deleteClient = (token, clientId) => async (dispatch) => {
  if (!token) {
    toast.error("No authentication token found", { style: errorToastStyle });
    throw new Error("Missing token");
  }
  try {
    await axios.delete(`${API_URL}/clients/${clientId}`, config(token));
    dispatch({ type: DELETE_CLIENT, payload: clientId });
    toast.success("Client deleted successfully", { style: successToastStyle });
  } catch (error) {
    const message = error.response?.data?.error || "Failed to delete client";
    console.error("[actions] deleteClient error:", message);
    toast.error(message, { style: errorToastStyle });
    throw error;
  }
};

export const fetchHistory = (token, purchaseId) => async (dispatch) => {
  if (!token) {
    toast.error("No authentication token found", { style: errorToastStyle });
    throw new Error("Missing token");
  }
  try {
    const res = await axios.get(
      `${API_URL}/purchases/${purchaseId}/history`,
      config(token)
    );
    dispatch({
      type: FETCH_HISTORY,
      payload: { purchaseId, history: res.data, overwrite: true },
    });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.error || "Failed to fetch history";
    console.error("[actions] fetchHistory error:", message);
    toast.error(message, { style: errorToastStyle });
    throw error;
  }
};
