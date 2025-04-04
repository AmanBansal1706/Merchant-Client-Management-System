import {
  LOGIN_SUCCESS,
  FETCH_CLIENTS,
  PAGINATION,
  FETCH_FILTERED_CLIENTS,
  CLIENTS_LIST,
  STORE_FILTER_DATA,
  IS_BTN_DISABLED,
  ADD_CLIENT,
  UPDATE_BALANCE,
  DELETE_CLIENT,
  FETCH_HISTORY,
  UPDATE_CLIENT,
  UPDATE_PURCHASE,
} from "./actions";

const initialState = {
  token: localStorage.getItem("token") || null,
  clients: [],
  filteredClients: [],
  clientsList: [],
  history: {},
  currentPage: 0,
  filterData: {
    filterType: "",
    filterValue: "",
    createdDate: "",
    updatedDate: "",
  },
  btnDisabled: {
    btnNext: true,
    btnPrev: true,
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "RESET_STATE":
      return { ...initialState, token: null, clients: [], history: {} }

    case LOGIN_SUCCESS:
      return { ...state, token: action.payload }

    case FETCH_CLIENTS:
      return {
        ...state,
        clients: Array.isArray(action.payload) ? action.payload : [],
      }

    case PAGINATION:
      return { ...state, currentPage: action.payload }

    case FETCH_FILTERED_CLIENTS:
      return {
        ...state,
        filteredClients: Array.isArray(action.payload) ? action.payload : [],
      }

    case STORE_FILTER_DATA:
      return {
        ...state,
        filterData: action.payload,
      }

    case CLIENTS_LIST:
      return {
        ...state,
        clientsList: Array.isArray(action.payload) ? action.payload : [],
      }

    case IS_BTN_DISABLED:
      return {
        ...state,
        btnDisabled: action.payload,
      }

    case ADD_CLIENT:
      const newClient = {
        ...action.payload,
        items: Array.isArray(action.payload.items) ? action.payload.items : [],
      };
      return { ...state, clients: [...state.clients, newClient] };

    case UPDATE_BALANCE:
      return {
        ...state,
        clients: state.clients.map((client) => ({
          ...client,
          items: (client.items || []).map((item) =>
            item.id === action.payload.purchaseId
              ? { ...item, remaining_balance: action.payload.newBalance }
              : item
          ),
        })),
      };

    case DELETE_CLIENT:
      const deletedClient = state.clients.find((c) => c.id === action.payload);
      if (deletedClient) {
        return {
          ...state,
          clients: state.clients.filter(
            (client) => client.id !== action.payload
          ),
          history: Object.fromEntries(
            Object.entries(state.history).filter(
              ([purchaseId]) =>
                !deletedClient.items.some(
                  (item) => item.id === parseInt(purchaseId)
                )
            )
          ),
        };
      }
      return state;

    case FETCH_HISTORY:
      const { purchaseId, history, overwrite } = action.payload;
      const newHistory = Array.isArray(history) ? history : [];
      const updatedHistory = overwrite
        ? newHistory
        : [
          ...(state.history[purchaseId] || []),
          ...newHistory.filter(
            (newEntry) =>
              !state.history[purchaseId]?.some(
                (existing) =>
                  existing.id === newEntry.id &&
                  existing.modification_date === newEntry.modification_date
              )
          ),
        ];
      return {
        ...state,
        history: { ...state.history, [purchaseId]: updatedHistory },
      };

    case UPDATE_CLIENT:
      const { id, updatedClient } = action.payload;
      return {
        ...state,
        clients: state.clients.map((client) =>
          client.id === id
            ? {
              ...client,
              ...updatedClient,
              items: Array.isArray(updatedClient.items)
                ? updatedClient.items
                : client.items || [],
            }
            : client
        ),
      };

    case UPDATE_PURCHASE:
      return {
        ...state,
        clients: state.clients.map((client) => ({
          ...client,
          items: (client.items || []).map((item) =>
            item.id === action.payload.purchaseId
              ? { ...item, ...action.payload.updatedPurchase }
              : item
          ),
        })),
      };

    default:
      return state;
  }
};

export default reducer;
