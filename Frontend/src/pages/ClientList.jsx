import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import {
  fetchClients,
  deleteClient,
  fetchFilteredClients,
  pagination,
  clientsList,
  storeFilterData,
  isBtnDisabled,
  isInitialLoad,
} from "../redux/actions";
import { getClientListData } from "../redux/selectors";
import {
  FiMoreVertical,
  FiImage,
  FiFilter,
  FiUser,
  FiMapPin,
  FiShoppingBag,
  FiEdit,
  FiLogOut,
  FiList,
} from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
`;

const Loader = styled.div`
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const PageWrapper = styled.div`
  max-width: 1600px;
  margin: 0px 60px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Fix heading spacing */
`;

const Heading = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  text-align: center;
  margin-bottom: 15px;
  margin-top: 10px;
`;

const ClientListContainer = styled.div`
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  padding-bottom: 60px; /* Added to give space for pagination */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const FilterWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FilterIcon = styled.div`
  position: absolute;
  left: 10px;
  color: var(--text-primary);
  font-size: 1.2rem;
`;

const FilterSelect = styled.select`
  padding: 8px 10px 8px 35px;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 150px;
  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 5px rgba(42, 157, 143, 0.5);
  }
`;

const FilterInput = styled.input`
  padding: 8px;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 200px;
  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 5px rgba(42, 157, 143, 0.5);
  }
`;

const TableWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
  border-radius: 8px 8px 0 0;
  table-layout: fixed;
`;

const Thead = styled.thead`
  background: linear-gradient(135deg, var(--accent), #1f8a7b);
  color: var(--ivory);
`;

const Th = styled.th`
  padding: 12px 8px;
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  vertical-align: middle;
  &:nth-child(1) {
    width: 8%;
  } // Photo
  &:nth-child(2) {
    width: 15%;
  } // Name
  &:nth-child(3) {
    width: 18%;
  } // Address
  &:nth-child(4) {
    width: 12%;
  } // Items
  &:nth-child(5) {
    width: 11%;
  } // No of Items
  &:nth-child(6) {
    width: 12%;
  } // Total Price
  &:nth-child(7) {
    width: 12%;
  } // Total Balance
  &:nth-child(8) {
    width: 13%;
  } // Actions
`;

const Icon = styled.span`
  margin-right: 6px;
  vertical-align: middle;
`;

const DataContainer = styled.div`
  max-height: calc(100vh - 245px);
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  background: var(--bg-primary);
  border-radius: 0 0 8px 8px;
  padding-bottom: 40px;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const DataRow = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: rgba(42, 157, 143, 0.15);
  }
`;

const DataCell = styled.div`
  padding: 12px 15px;
  font-size: 0.95rem;
  &:nth-child(1) {
    width: 8%;
  } // Photo
  &:nth-child(2) {
    width: 15%;
  } // Name
  &:nth-child(3) {
    width: 18%;
  } // Address
  &:nth-child(4) {
    width: 12%;
  } // Items
  &:nth-child(5) {
    width: 10%;
  } // No of Items
  &:nth-child(6) {
    width: 12%;
  } // Total Price
  &:nth-child(7) {
    width: 12%;
  } // Total Balance
  &:nth-child(8) {
    width: 13%;
  } // Actions
`;

const NameCell = styled(DataCell)`
  color: #212121;
`;
const AddressCell = styled(DataCell)`
  color: #212121;
`;
const BalanceCell = styled(DataCell)`
  color: #f44336;
`;
const ItemCell = styled(DataCell)`
  color: #2196f3;
`;
const PriceCell = styled(DataCell)`
  color: #4caf50;
`;
const ItemsCountCell = styled(DataCell)`
  color: #ff9800;
`;

const PhotoIcon = styled(FiImage)`
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--accent);
  transition: color 0.2s ease;
  &:hover {
    color: var(--highlight);
  }
`;

const ClientImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border);
  cursor: pointer;
`;

const MenuWrapper = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s ease;
  &:hover {
    color: var(--accent);
  }
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--accent);
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  display: ${({ open }) => (open ? "block" : "none")};
  z-index: 150;
  min-width: 120px;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 8px 20px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  &:hover {
    background: var(--accent);
    color: var(--ivory);
  }
`;

const AddClientLink = styled(Link)`
  margin-left: 600px;
  padding: 5px;
  background: var(--accent);
  color: var(--ivory);
  text-decoration: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  height: 36px;
  width: 120px;
  transition: background 0.2s ease, transform 0.2s ease;
  &:hover {
    background: var(--highlight);
    transform: translateY(-2px);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ open }) => (open ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  z-index: 200;
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
  &:hover {
    color: var(--accent);
  }
`;

const PhotoGallery = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const PhotoOption = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid var(--border);
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  text-align: center;
  padding: 20px;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: var(--accent);
  color: var(--ivory);
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: var(--highlight);
  }
`;

const DeleteModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ open }) => (open ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  z-index: 250;
`;

const DeleteModalContent = styled.div`
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  width: 400px;
  text-align: center;
`;

const DeleteModalMessage = styled.p`
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 20px;
`;

const DeleteModalButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  background: #e63946;
  color: var(--ivory);
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #d32f2f;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: var(--titanium);
  color: var(--ivory);
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #5f6e74;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  background: var(--accent);
  color: var(--ivory);
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  height: 36px;
  width: 120px;
  transition: background 0.2s ease;
  white-space: nowrap;
  &:hover {
    background: var(--highlight);
  }
  &:disabled {
    background: var(--titanium);
    cursor: not-allowed;
  }
`;
const PageNumber = styled.p`
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
  padding: 6px 12px;
  border: 2px solid var(--accent);
  border-radius: 6px;
  background: var(--bg-primary);
`;
const GetDataButton = styled.button`
  padding: 8px 16px;
  background: var(--accent);
  color: var(--ivory);
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  height: 36px;
  width: 100px;
  transition: background 0.2s ease;
  &:hover {
    background: var(--highlight);
  }
`;

function showToast() {
  const toast = document.createElement("div");
  toast.textContent = "Invalid filter: Date value or filter value is required.";
  toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
  }, 100);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

const ClientList = () => {
  const [menuOpen, setMenuOpen] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(null);

  const [filterDataStoreLocal, setFilterDataStoreLocal] = useState({
    filterType: "",
    filterValue: "",
    createdDate: "",
    updatedDate: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, clients: enrichedClients } = useSelector(getClientListData);
  const page = useSelector((state) => state.currentPage);
  const filterDataStore = useSelector((state) => state.filterData);
  const isBtnDisabledData = useSelector((state) => state.btnDisabled);
  const isLoaded = useSelector((state) => state.isInitialLoad);

  const handleFilterDataChange = (evt) => {
    const changedField = evt.target.name;
    const newValue = evt.target.value;
    setFilterDataStoreLocal((prevData) => {
      return { ...prevData, [changedField]: newValue };
    });
  };

  const handleAllClientsData = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    try {
      await dispatch(pagination(0));
      await dispatch(
        storeFilterData({
          ...filterDataStore,
          filterType: "",
          filterValue: "",
          createdDate: "",
          updatedDate: "",
        })
      );
      const fetchedData = await dispatch(fetchFilteredClients(token));
      await dispatch(clientsList(fetchedData));
      const nextFetchData = await dispatch(
        fetchFilteredClients(token, undefined, undefined, 1)
      );
      await dispatch(
        isBtnDisabled({
          ...isBtnDisabledData,
          btnPrev: true,
          btnNext: !(nextFetchData.length > 0),
        })
      );
    } catch (error) {
      setFetchError(
        "Failed to load clients. Please check the server and try again."
      );
      console.error("ClientList fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      handleAllClientsData();
      dispatch(isInitialLoad(false));
    }
  }, []);

  const handlePaginationPrev = async (evt) => {
    if (evt.target.name === "prevPage") {
      const updatedPage = page - 1;
      if (
        filterDataStore.filterType === "createdDate" ||
        filterDataStore.filterType === "updatedDate"
      ) {
        const updatedFilterValue =
          filterDataStore.filterType === "createdDate"
            ? filterDataStore.createdDate
            : filterDataStore.filterType === "updatedDate"
            ? filterDataStore.updatedDate
            : filterDataStore.filterValue;
        await dispatch(pagination(updatedPage));
        const fetchedData = await dispatch(
          fetchFilteredClients(
            token,
            filterDataStore.filterType,
            updatedFilterValue,
            updatedPage
          )
        );
        await dispatch(clientsList(fetchedData));
        await dispatch(
          isBtnDisabled({
            ...isBtnDisabledData,
            btnPrev: updatedPage <= 0 ? true : false,
          })
        );
      } else if (filterDataStore.filterType === "") {
        await dispatch(pagination(updatedPage));
        const fetchedData = await dispatch(
          fetchFilteredClients(token, undefined, undefined, updatedPage)
        );
        await dispatch(clientsList(fetchedData));
        await dispatch(
          isBtnDisabled({
            ...isBtnDisabledData,
            btnPrev: updatedPage <= 0 ? true : false,
          })
        );
      } else {
        await dispatch(pagination(updatedPage));
        const fetchedData = await dispatch(
          fetchFilteredClients(
            token,
            filterDataStore.filterType,
            filterDataStore.filterValue,
            updatedPage
          )
        );
        await dispatch(clientsList(fetchedData));
        await dispatch(
          isBtnDisabled({
            ...isBtnDisabledData,
            btnPrev: updatedPage <= 0 ? true : false,
          })
        );
      }
    }
  };

  const handlePaginationNext = async (evt) => {
    if (evt.target.name === "nextPage") {
      const updatedPage = page + 1;
      if (
        filterDataStore.filterType === "createdDate" ||
        filterDataStore.filterType === "updatedDate"
      ) {
        const updatedFilterValue =
          filterDataStore.filterType === "createdDate"
            ? filterDataStore.createdDate
            : filterDataStore.filterType === "updatedDate"
            ? filterDataStore.updatedDate
            : filterDataStore.filterValue;
        const newData = await dispatch(
          fetchFilteredClients(
            token,
            filterDataStore.filterType,
            updatedFilterValue,
            updatedPage
          )
        );
        await dispatch(clientsList(newData));
        const nextFetchedData = await dispatch(
          fetchFilteredClients(
            token,
            filterDataStore.filterType,
            updatedFilterValue,
            updatedPage + 1
          )
        );
        await dispatch(pagination(updatedPage));
        if (nextFetchedData.length > 0) {
          await dispatch(
            isBtnDisabled({ ...isBtnDisabledData, btnPrev: false })
          );
        } else {
          await dispatch(
            isBtnDisabled({ ...isBtnDisabledData, btnNext: true })
          );
        }
      } else if (filterDataStore.filterType === "") {
        const newData = await dispatch(
          fetchFilteredClients(token, undefined, undefined, updatedPage)
        );
        await dispatch(clientsList(newData));
        const nextFetchedData = await dispatch(
          fetchFilteredClients(token, undefined, undefined, updatedPage + 1)
        );
        await dispatch(pagination(updatedPage));
        if (nextFetchedData.length > 0) {
          await dispatch(
            isBtnDisabled({ ...isBtnDisabledData, btnPrev: false })
          );
        } else {
          await dispatch(
            isBtnDisabled({ ...isBtnDisabledData, btnNext: true })
          );
        }
      } else {
        const newData = await dispatch(
          fetchFilteredClients(
            token,
            filterDataStore.filterType,
            filterDataStore.filterValue,
            updatedPage
          )
        );
        await dispatch(clientsList(newData));
        const nextFetchedData = await dispatch(
          fetchFilteredClients(
            token,
            filterDataStore.filterType,
            filterDataStore.filterValue,
            updatedPage + 1
          )
        );
        await dispatch(pagination(updatedPage));
        if (nextFetchedData.length > 0) {
          await dispatch(
            isBtnDisabled({ ...isBtnDisabledData, btnPrev: false })
          );
        } else {
          await dispatch(
            isBtnDisabled({ ...isBtnDisabledData, btnNext: true })
          );
        }
      }
    }
  };

  const handleFilter = async () => {
    try {
      if (
        !filterDataStoreLocal.filterType ||
        (filterDataStoreLocal.filterType === "createdDate" &&
          !filterDataStoreLocal.createdDate) ||
        (filterDataStoreLocal.filterType === "updatedDate" &&
          !filterDataStoreLocal.updatedDate) ||
        (filterDataStoreLocal.filterType !== "createdDate" &&
          filterDataStoreLocal.filterType !== "updatedDate" &&
          !filterDataStoreLocal.filterValue)
      ) {
        showToast();
        return;
      }

      if (filterDataStoreLocal.filterType === "createdDate") {
        await dispatch(
          storeFilterData({
            ...filterDataStore,
            filterType: filterDataStoreLocal.filterType,
            createdDate: filterDataStoreLocal.createdDate,
          })
        );
      } else if (filterDataStoreLocal.filterType === "updatedDate") {
        await dispatch(
          storeFilterData({
            ...filterDataStore,
            filterType: filterDataStoreLocal.filterType,
            updatedDate: filterDataStoreLocal.updatedDate,
          })
        );
      } else {
        await dispatch(
          storeFilterData({
            ...filterDataStore,
            filterType: filterDataStoreLocal.filterType,
            filterValue: filterDataStoreLocal.filterValue,
          })
        );
      }

      await dispatch(pagination(0));

      const updatedFilterValue =
        filterDataStoreLocal.filterType === "createdDate"
          ? filterDataStoreLocal.createdDate
          : filterDataStoreLocal.filterType === "updatedDate"
          ? filterDataStoreLocal.updatedDate
          : filterDataStoreLocal.filterValue;

      const fetchedData = await dispatch(
        fetchFilteredClients(
          token,
          filterDataStoreLocal.filterType,
          updatedFilterValue,
          0
        )
      );
      await dispatch(clientsList(fetchedData));

      const nextFetchData = await dispatch(
        fetchFilteredClients(
          token,
          filterDataStoreLocal.filterType,
          updatedFilterValue,
          1
        )
      );
      await dispatch(
        isBtnDisabled({
          ...isBtnDisabledData,
          btnPrev: true,
          btnNext: !(nextFetchData.length > 0),
        })
      );
    } catch (error) {
      setFetchError("Failed to fetch filtered clients.");
      console.error("handleFilter error:", error);
    }
  };

  const handleDeleteClick = useCallback((clientId) => {
    setDeleteModalOpen(clientId);
    setMenuOpen(null);
  }, []);

  const confirmDelete = useCallback(
    (clientId) => {
      dispatch(deleteClient(token, clientId))
        .then(async () => {
          const updatedFilterValue =
            filterDataStore.filterType === "createdDate"
              ? filterDataStore.createdDate
              : filterDataStore.filterType === "updatedDate"
              ? filterDataStore.updatedDate
              : filterDataStore.filterValue;
          const updatedClient = await dispatch(
            fetchFilteredClients(
              token,
              filterDataStore.filterType,
              updatedFilterValue,
              page
            )
          );
          await dispatch(clientsList(updatedClient));
        })
        .catch((error) =>
          toast.error("Failed to delete client: " + error.message, {
            style: { background: "#f44336", color: "#fff" },
          })
        );
      setDeleteModalOpen(null);
    },
    [dispatch, token, filterDataStore, page]
  );

  const cancelDelete = useCallback(() => {
    setDeleteModalOpen(null);
  }, []);
  const handleLogout = useCallback(() => {
    const div = document.createElement("div");
    div.style.cssText =
      "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:12px;box-shadow:0 4px 8px rgba(0,0,0,0.3);z-index:1000;text-align:center;width:300px;min-height:150px;";
    div.innerHTML = `
      <p style="margin:0 0 20px;font-size:16px;">Are you sure you want to sign out?</p>
      <button id="yesBtn" style="background:#4CAF50;color:white;padding:8px 16px;border:none;border-radius:20px;margin:0 10px;cursor:pointer;">Yes</button>
      <button id="noBtn" style="background:#f44336;color:white;padding:8px 16px;border:none;border-radius:20px;margin:0 10px;cursor:pointer;">No</button>
    `;
    document.body.appendChild(div);

    const cleanup = () => document.body.removeChild(div);

    document.getElementById("yesBtn").onclick = () => {
      localStorage.removeItem("token");
      dispatch({ type: "RESET_STATE" });
      navigate("/");
      toast.error("Logged out successfully", {
        style: { background: "#f44336", color: "#fff" },
      });
      cleanup();
    };
    document.getElementById("noBtn").onclick = cleanup;
  }, []);

  const toggleMenu = useCallback((clientId) => {
    setMenuOpen((prev) => (prev === clientId ? null : clientId));
  }, []);

  const openPhotoModal = useCallback((clientId) => {
    setPhotoModalOpen(clientId);
  }, []);

  const closePhotoModal = useCallback(() => {
    setPhotoModalOpen(null);
  }, []);

  const getFilterIcon = useCallback((type) => {
    switch (type) {
      case "name":
        return <FiUser />;
      case "address":
        return <FiMapPin />;
      case "balance":
        return <FaIndianRupeeSign />;
      case "item":
        return <FiShoppingBag />;
      default:
        return <FiFilter />;
    }
  }, []);

  if (!token) return null;
  if (isLoading) {
    return (
      <PageWrapper>
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      </PageWrapper>
    );
  }

  if (fetchError)
    return (
      <PageWrapper>
        <ErrorMessage>{fetchError}</ErrorMessage>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <Heading>Merchant Client Management System</Heading>
      <ClientListContainer>
        <Header>
          <FilterContainer>
            <FilterWrapper>
              <FilterIcon>
                {getFilterIcon(filterDataStoreLocal.filterType)}
              </FilterIcon>
              <FilterSelect
                name="filterType"
                value={filterDataStoreLocal.filterType}
                onChange={handleFilterDataChange}
              >
                <option value="">Select Filter</option>
                <option value="name">Name</option>
                <option value="address">Address</option>
                <option value="item">Item</option>
                <option value="createdDate">Created Date</option>
                <option value="updatedDate">Updated Date</option>
              </FilterSelect>
            </FilterWrapper>
            {filterDataStoreLocal.filterType !== "createdDate" &&
              filterDataStoreLocal.filterType !== "updatedDate" && (
                <FilterInput
                  name="filterValue"
                  type="text"
                  value={filterDataStoreLocal.filterValue}
                  onChange={handleFilterDataChange}
                  placeholder={`Filter by ${
                    filterDataStoreLocal.filterType || "..."
                  }`}
                />
              )}
            {filterDataStoreLocal.filterType === "createdDate" && (
              <div>
                <input
                  type="date"
                  name="createdDate"
                  value={filterDataStoreLocal.createdDate}
                  onChange={handleFilterDataChange}
                />
              </div>
            )}
            {filterDataStoreLocal.filterType === "updatedDate" && (
              <div>
                <input
                  type="date"
                  name="updatedDate"
                  value={filterDataStoreLocal.updatedDate}
                  onChange={handleFilterDataChange}
                />
              </div>
            )}
            <GetDataButton onClick={handleFilter}>Get Data</GetDataButton>
          </FilterContainer>
          <AddClientLink to="/add-client">Add Client</AddClientLink>
          <LogoutButton onClick={handleLogout}>
            <FiLogOut style={{ marginRight: "5px" }} /> Logout
          </LogoutButton>
        </Header>
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>
                  <Icon>
                    <FiImage />
                  </Icon>
                  Photo
                </Th>
                <Th>
                  <Icon>
                    <FiUser />
                  </Icon>
                  Name
                </Th>
                <Th>
                  <Icon>
                    <FiMapPin />
                  </Icon>
                  Address
                </Th>
                <Th>
                  <Icon>
                    <FiShoppingBag />
                  </Icon>
                  Items
                </Th>
                <Th>
                  <Icon>
                    <FiList />
                  </Icon>
                  No of Items
                </Th>
                <Th>
                  <Icon>
                    <FaIndianRupeeSign /> {/* <FiTag /> */}
                  </Icon>
                  Total Price
                </Th>
                <Th>
                  <Icon>
                    <FaIndianRupeeSign />
                  </Icon>
                  Total Balance
                </Th>
                <Th>
                  <Icon>
                    <FiEdit />
                  </Icon>
                  Actions
                </Th>
              </tr>
            </Thead>
          </Table>
          <DataContainer>
            {enrichedClients.length > 0 ? (
              enrichedClients.map((client) => {
                const photos = client.photos || [];
                const primaryPhoto =
                  photos.length > 0
                    ? `data:image/jpeg;base64,${photos[0]}`
                    : null;
                const firstItemImage =
                  client.items.length > 0 && client.items[0].images?.length > 0
                    ? `data:image/jpeg;base64,${client.items[0].images[0]}`
                    : null;
                return (
                  <DataRow
                    key={client.id}
                    onClick={() => navigate(`/client/${client.id}`)}
                  >
                    <DataCell onClick={(e) => e.stopPropagation()}>
                      {primaryPhoto ? (
                        <ClientImage
                          src={primaryPhoto}
                          alt={client.name || "Client"}
                          onClick={() => openPhotoModal(client.id)}
                        />
                      ) : (
                        <PhotoIcon onClick={() => openPhotoModal(client.id)} />
                      )}
                    </DataCell>
                    <NameCell>{client.name || "N/A"}</NameCell>
                    <AddressCell>{client.address || "N/A"}</AddressCell>
                    <ItemCell>
                      {firstItemImage ? (
                        <ClientImage src={firstItemImage} alt="First Item" />
                      ) : (
                        "No Photos"
                      )}
                    </ItemCell>
                    <ItemsCountCell>{client.itemsCount || 0}</ItemsCountCell>
                    <PriceCell>₹{client.total_price || 0}</PriceCell>
                    <BalanceCell>₹{client.total_balance || 0}</BalanceCell>
                    <DataCell onClick={(e) => e.stopPropagation()}>
                      <MenuWrapper>
                        <MenuButton onClick={() => toggleMenu(client.id)}>
                          <FiMoreVertical />
                        </MenuButton>
                        <Menu open={menuOpen === client.id}>
                          <MenuItem
                            onClick={() =>
                              navigate(`/edit-client/${client.id}`)
                            }
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleDeleteClick(client.id)}
                          >
                            Delete
                          </MenuItem>
                        </Menu>
                      </MenuWrapper>
                    </DataCell>
                  </DataRow>
                );
              })
            ) : (
              <p style={{ color: "red", fontSize: "1.20rem" }}>
                No data found!!!
              </p>
            )}
          </DataContainer>
          <PaginationContainer>
            <PaginationButton
              onClick={handlePaginationPrev}
              name="prevPage"
              disabled={isBtnDisabledData.btnPrev}
            >
              Prev Page
            </PaginationButton>
            <PageNumber>Page {page + 1}</PageNumber>
            <PaginationButton
              onClick={handlePaginationNext}
              name="nextPage"
              disabled={isBtnDisabledData.btnNext}
            >
              Next Page
            </PaginationButton>
          </PaginationContainer>
        </TableWrapper>
        {photoModalOpen && (
          <Modal open={!!photoModalOpen}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Client Photos</ModalTitle>
                <CloseButton onClick={closePhotoModal}>×</CloseButton>
              </ModalHeader>
              <PhotoGallery>
                {enrichedClients
                  .find((c) => c.id === photoModalOpen)
                  ?.photos?.map((photo, index) => (
                    <PhotoOption
                      key={index}
                      src={`data:image/jpeg;base64,${photo}`}
                      alt={`Photo ${index}`}
                    />
                  ))}
              </PhotoGallery>
            </ModalContent>
          </Modal>
        )}
        {deleteModalOpen && (
          <DeleteModal open={!!deleteModalOpen}>
            <DeleteModalContent>
              <DeleteModalMessage>
                Are you sure to delete this client?
              </DeleteModalMessage>
              <DeleteModalButtons>
                <ConfirmButton onClick={() => confirmDelete(deleteModalOpen)}>
                  Yes
                </ConfirmButton>
                <CancelButton onClick={cancelDelete}>No</CancelButton>
              </DeleteModalButtons>
            </DeleteModalContent>
          </DeleteModal>
        )}
      </ClientListContainer>
    </PageWrapper>
  );
};

export default ClientList;
