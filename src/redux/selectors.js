import { createSelector } from "reselect";

const getRawClients = (state) => state.clientsList;
const getToken = (state) => state.token;
const getHistory = (state) => state.history;
const getClientId = (_, id) => id;

export const getEnrichedClients = createSelector(
  [getRawClients],
  (rawClients) =>
    rawClients.map((client) => ({
      ...client,
      items: client.items || [],
      total_price: (client.items || []).reduce(
        (sum, item) => sum + (item.price || 0),
        0
      ),
      total_balance: (client.items || []).reduce(
        (sum, item) => sum + (item.remaining_balance || 0),
        0
      ),
      itemsCount: (client.items || []).length,
    }))
);

export const getClientListData = createSelector(
  [getToken, getEnrichedClients],
  (token, enrichedClients) => ({ token, clients: enrichedClients })
);

export const selectClientById = createSelector(
  [getEnrichedClients, getClientId],
  (enrichedClients, id) => {
    const client = enrichedClients.find((c) => c.id === id);
    if (!client) return null;
    return {
      ...client,
      photos: client.photos || [],
      items: client.items || [],
    };
  }
);

export const selectTotalsByClientId = createSelector(
  [selectClientById],
  (client) => {
    if (!client) return { total_price: 0, total_balance: 0 };
    return {
      total_price: client.total_price,
      total_balance: client.total_balance,
    };
  }
);

export const selectHistoryByClientId = createSelector(
  [selectClientById, getHistory],
  (client, history) => {
    if (!client) return {};

    const allHistory = [];
    client.items.forEach((item) => {
      if (history[item.id]) {
        history[item.id].forEach((entry) => {
          allHistory.push({
            itemName: item.item_name,
            purchaseId: item.id,
            balanceBefore: entry.previous_amount,
            balanceAfter: entry.updated_amount,
            priceBefore: entry.previous_price,
            priceAfter: entry.updated_price,
            timestamp: entry.modification_date,
          });
        });
      }
    });

    // Sort by timestamp (latest first)
    allHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Group by timestamp
    const groupedHistory = {};
    allHistory.forEach((entry) => {
      const dateKey = new Date(entry.timestamp).toLocaleString();
      if (!groupedHistory[dateKey]) groupedHistory[dateKey] = {};

      const key = `${entry.purchaseId}-${entry.itemName}`;
      if (!groupedHistory[dateKey][key]) {
        groupedHistory[dateKey][key] = {
          itemName: entry.itemName,
          purchaseId: entry.purchaseId,
          balanceBefore: null,
          balanceAfter: null,
          priceBefore: null,
          priceAfter: null,
          timestamp: entry.timestamp,
        };
      }

      const existing = groupedHistory[dateKey][key];
      if (entry.balanceBefore !== null || entry.balanceAfter !== null) {
        existing.balanceBefore = entry.balanceBefore;
        existing.balanceAfter = entry.balanceAfter;
      }
      if (entry.priceBefore !== null || entry.priceAfter !== null) {
        existing.priceBefore = entry.priceBefore;
        existing.priceAfter = entry.priceAfter;
      }
    });

    const finalGroupedHistory = {};
    Object.entries(groupedHistory).forEach(([dateKey, items]) => {
      finalGroupedHistory[dateKey] = Object.values(items).map((item) => ({
        ...item,
        balanceChange:
          item.balanceBefore !== null && item.balanceAfter !== null
            ? `${item.balanceBefore} → ${item.balanceAfter}`
            : "Unchanged",
        priceChange:
          item.priceBefore !== null && item.priceAfter !== null
            ? `${item.priceBefore} → ${item.priceAfter}`
            : "Unchanged",
      }));
    });

    return finalGroupedHistory;
  }
);

export const selectAuthToken = createSelector([getToken], (token) => token);
