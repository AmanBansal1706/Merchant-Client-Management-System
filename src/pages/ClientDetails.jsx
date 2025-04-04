import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { fetchClients, fetchHistory } from "../redux/actions";
import {
  selectAuthToken,
  selectClientById,
  selectTotalsByClientId,
  selectHistoryByClientId,
} from "../redux/selectors";
import { FiArrowLeft } from "react-icons/fi";

const DetailsContainer = styled.div`
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  border: 1px solid var(--border);
`;

const BackButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  &:hover {
    color: var(--accent);
  }
`;

const Heading = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 20px;
  text-align: center;
`;

const DetailSection = styled.div`
  display: grid;
  gap: 15px;
  padding: 15px;
  background: var(--bg-primary);
  border-radius: 6px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 4px;
`;

const Label = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Value = styled.span`
  font-size: 0.9rem;
  color: var(--text-primary);
`;

const PhotoGallery = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border);
`;

const ItemSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: var(--bg-primary);
  border-radius: 6px;
`;

const ItemHeading = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 10px;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ItemCard = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border);
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
`;

const ItemDetails = styled.div`
  flex-grow: 1;
`;

const ItemName = styled.h4`
  font-size: 1rem;
  color: #2196f3;
  margin: 0;
`;

const ItemPrice = styled.p`
  font-size: 0.9rem;
  color: #4caf50;
  margin: 3px 0 0;
`;

const ItemBalance = styled.p`
  font-size: 0.9rem;
  color: #f44336;
  margin: 3px 0 0;
`;

const HistorySection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: var(--bg-primary);
  border-radius: 6px;
`;

const HistoryHeading = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 10px;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
`;

const HistoryItem = styled.li`
  padding: 5px 0;
  border-bottom: 1px solid var(--border);
`;

const HistoryTimestamp = styled.div`
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  color: #1a1a1a;
`;

const HistoryHeader = styled.th`
  font-weight: bold;
  color: #000;
  font-size: 0.9rem;
  padding: 5px;
  text-align: left;
  border-bottom: 1px solid #333;
`;

const HistoryRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const HistoryCell = styled.td`
  padding: 5px;
  font-size: 0.85rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const PageButton = styled.button`
  padding: 5px 10px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ClientDetails = () => {
  const { id } = useParams();
  const clientId = parseInt(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector(selectAuthToken);
  const client = useSelector((state) => selectClientById(state, clientId));
  const { total_price: totalPrice, total_balance: totalBalance } = useSelector(
    (state) => selectTotalsByClientId(state, clientId)
  );
  const groupedHistory = useSelector((state) =>
    selectHistoryByClientId(state, clientId)
  );

  const [isLoading, setIsLoading] = useState(true);
  const [didFetchClients, setDidFetchClients] = useState(false);
  const [fetchedHistoryIds, setFetchedHistoryIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const refreshHistory = useCallback(async () => {
    if (!client || isLoading) {
      return;
    }
    const promises = client.items.map(async (item) => {
      try {
        await dispatch(fetchHistory(token, item.id));
        setFetchedHistoryIds((prev) => new Set([...prev, item.id]));
      } catch (error) {
        console.error(
          `[ClientDetails] Error fetching history for ${item.id}:`,
          error
        );
        toast.error(`Failed to fetch history for ${item.item_name || "Item"}`, {
          style: { background: "#f44336", color: "#fff" },
        });
      }
    });
    await Promise.all(promises);
  }, [client, isLoading, token, dispatch]);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const fetchClientsData = async () => {
      if (didFetchClients) return;
      setIsLoading(true);

      try {
        await dispatch(fetchClients(token));
        setDidFetchClients(true);
      } catch (error) {
        console.error("[ClientDetails] Fetch clients error:", error);
        toast.error("Failed to fetch client details", {
          style: { background: "#f44336", color: "#fff" },
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchClientsData();
  }, [dispatch, token, navigate, didFetchClients]);

  useEffect(() => {
    if (client && didFetchClients) {
      refreshHistory();
    }
  }, [client, didFetchClients, refreshHistory]);

  const formatHistory = () => {
    if (!groupedHistory || Object.keys(groupedHistory).length === 0) {
      return [<div key="no-history">No history available</div>];
    }

    const sortedEntries = Object.entries(groupedHistory).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEntries = sortedEntries.slice(startIndex, endIndex);

    return paginatedEntries.map(([dateKey, entries]) => {
      return (
        <div key={dateKey}>
          <HistoryTimestamp>{dateKey}</HistoryTimestamp>
          <HistoryTable>
            <thead>
              <tr>
                <HistoryHeader>Item</HistoryHeader>
                <HistoryHeader>Balance (Before → After)</HistoryHeader>
                <HistoryHeader>Price (Before → After)</HistoryHeader>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <HistoryRow key={idx}>
                  <HistoryCell>{entry.itemName}</HistoryCell>
                  <HistoryCell>
                    {entry.balanceBefore !== null
                      ? `$${entry.balanceBefore} → $${entry.balanceAfter}`
                      : "Unchanged"}
                  </HistoryCell>
                  <HistoryCell>
                    {entry.priceBefore !== null
                      ? `$${entry.priceBefore} → $${entry.priceAfter}`
                      : "Unchanged"}
                  </HistoryCell>
                </HistoryRow>
              ))}
            </tbody>
          </HistoryTable>
        </div>
      );
    });
  };

  const totalPages = Math.ceil(
    Object.keys(groupedHistory).length / itemsPerPage
  );

  if (isLoading || !client) {
    return <DetailsContainer>Loading...</DetailsContainer>;
  }

  return (
    <DetailsContainer>
      <BackButton onClick={() => navigate("/clients")}>
        <FiArrowLeft />
      </BackButton>
      <Heading>{client.name}'s Profile</Heading>
      <DetailSection>
        <DetailItem>
          <Label>Name</Label>
          <Value>{client.name}</Value>
        </DetailItem>
        <DetailItem>
          <Label>Address</Label>
          <Value>{client.address || "N/A"}</Value>
        </DetailItem>
        <DetailItem>
          <Label>Photos</Label>
          {client.photos && client.photos.length > 0 ? (
            <PhotoGallery>
              {client.photos.map((photo, index) => (
                <Photo
                  key={index}
                  src={`data:image/jpeg;base64,${photo}`}
                  alt={`Photo ${index}`}
                />
              ))}
            </PhotoGallery>
          ) : (
            <Value>No photos available</Value>
          )}
        </DetailItem>
        <DetailItem>
          <Label>Total Price</Label>
          <Value>${totalPrice || 0}</Value>
        </DetailItem>
        <DetailItem>
          <Label>Total Remaining Balance</Label>
          <Value>${totalBalance || 0}</Value>
        </DetailItem>
      </DetailSection>

      <ItemSection>
        <ItemHeading>Items</ItemHeading>
        <ItemList>
          {(client.items || []).map((item) => (
            <ItemCard key={item.id}>
              {item.images && item.images.length > 0 ? (
                <ItemImage
                  src={`data:image/jpeg;base64,${item.images[0]}`}
                  alt={item.item_name}
                />
              ) : (
                <ItemImage src="placeholder.jpg" alt="No Image" />
              )}
              <ItemDetails>
                <ItemName>{item.item_name}</ItemName>
                <ItemPrice>Price: ${item.price}</ItemPrice>
                <ItemBalance>
                  Remaining Balance: ${item.remaining_balance}
                </ItemBalance>
              </ItemDetails>
            </ItemCard>
          ))}
          {(!client.items || client.items.length === 0) && (
            <Value>No items available</Value>
          )}
        </ItemList>
      </ItemSection>

      <HistorySection>
        <HistoryHeading>History</HistoryHeading>
        <HistoryList>
          {formatHistory().map((entry, idx) => (
            <HistoryItem key={idx}>{entry}</HistoryItem>
          ))}
        </HistoryList>
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <PageButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </Pagination>
      </HistorySection>
    </DetailsContainer>
  );
};

export default ClientDetails;
