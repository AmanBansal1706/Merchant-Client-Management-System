import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import {
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
  border: 6px solid var(--bg-tertiary);
  border-top: 6px solid var(--accent);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
  box-shadow: var(--shadow-md);
`;

const PageWrapper = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--bg-primary);

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const Heading = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--accent);
  text-align: center;
  margin-bottom: 0px;
  margin-top: 10px;
  letter-spacing: -0.025em;
  position: relative;
  padding-bottom: 10px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, var(--accent), var(--accent-light));
    border-radius: var(--radius-full);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileHeading = styled.h2`
  display: none;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--accent);
  text-align: center;
  margin-bottom: 1px;
  margin-top: 10px;
  letter-spacing: -0.025em;
  position: relative;
  padding-bottom: 8px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--accent-light));
    border-radius: var(--radius-full);
  }

  @media (max-width: 768px) {
    display: block;
   
  }

  @media (max-width: 480px) {
    font-size: 1.4rem;
   
  }
`;

const ClientListContainer = styled.div`
  padding: 25px;
  padding-top: 15px;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  padding-bottom: 70px;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
 
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: var(--radius-lg);
  }

  @media (max-width: 480px) {
    padding: 15px;
    padding-top: 5px;
    border-radius: var(--radius-md);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0px;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;

  @media (min-width: 769px) {
    flex-direction: row;
    align-items: center;
    width: auto;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    gap: 12px;
  }

  @media (max-width: 480px) {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding-right: 40px; /* Make space for the logout button */
  }
`;

const FilterWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const FilterIcon = styled.div`
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  font-size: 1.2rem;
`;

const FilterSelect = styled.select`
  padding: 10px 12px 10px 40px;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 160px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  
  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }
  
  &:hover {
    border-color: var(--accent-light);
  }
  
  @media (max-width: 768px) {
    width: 140px;
    padding: 8px 10px 8px 35px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
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

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 10px;
    justify-content: flex-start;
    gap: 20px;
  }

  @media (max-width: 480px) {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    flex-direction: row;
    align-items: center;
    gap: 10px;
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

  @media (max-width: 768px) {
    display: none;
  }
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

  @media (max-width: 768px) {
    max-height: calc(100vh - 350px);
  }

  @media (max-width: 480px) {
    max-height: calc(100vh - 350px);
    padding-bottom: 10px; 
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

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 15px;
    position: relative;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    padding-bottom: 50px; /* Add extra padding at bottom to prevent content from being hidden */
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

  @media (max-width: 768px) {
    width: 100% !important;
    padding: 8px 0;
    display: flex;
    align-items: center;

    &:nth-child(8) {
      position: absolute;
      top: 15px;
      right: 15px;
      width: auto !important;
    }
  }

  @media (max-width: 480px) {
    &:nth-child(8) {
      position: absolute;
      top: 15px;
      right: 15px;
      width: auto !important;
      z-index: 5;
    }
  }
`;

const MobileLabel = styled.span`
  font-weight: 600;
  width: 120px;
  min-width: 120px;
  color: var(--accent);
  display: none;

  @media (max-width: 768px) {
    display: inline-block;
  }
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

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
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

  @media (max-width: 768px) {
    right: 0;
    top: 100%;
  }
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

const ActionButton = styled.button`
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
  &:hover {
    background: var(--highlight);
  }

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const ActionLink = styled(Link)`
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
  &:hover {
    background: var(--highlight);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const GetDataButton = styled(ActionButton)``;

const AddClientLink = styled(ActionLink)``;

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
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 480px) {
    width: 95%;
    padding: 15px;
  }
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

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
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
  justify-content: center;
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

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  text-align: center;
  padding: 20px;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: #f44336;
  color: var(--ivory);
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  height: 36px;
  width: 120px;
  &:hover {
    background: #d32f2f;
  }

  @media (max-width: 768px) {
    display: none;
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
  width: 90%;
  max-width: 400px;
  text-align: center;

  @media (max-width: 480px) {
    width: 95%;
    padding: 15px;
  }
`;

const DeleteModalMessage = styled.p`
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 20px;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const DeleteModalButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;

  @media (max-width: 480px) {
    gap: 10px;
  }
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

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 0.9rem;
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

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 0.9rem;
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

  @media (max-width: 480px) {
    padding: 10px;
    flex-direction: row; /* Keep horizontal layout */
    gap: 10px;
    justify-content: space-between;
  }
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

  @media (max-width: 480px) {
    width: auto;
    min-width: 80px;
    padding: 8px 10px;
    font-size: 0.9rem;
  }
`;

const PageNumber = styled.div`
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
  padding: 6px 12px;
  border: 2px solid var(--accent);
  border-radius: 6px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 0.9rem;
  }
`;

const MobileLogoutButton = styled.button`
  display: none;
  padding: 8px;
 background: #f44336;
  color: var(--ivory);
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  height: 36px;
  width: 36px;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    display: flex;
    position: absolute;
    right: 0;
    top: 0;
  }

  @media (max-width: 480px) {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
  }

  &:hover {
      background: #d32f2f;
  }
`;

const DesktopLogoutButton = styled(LogoutButton)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileHeader = styled.div`
  display: none;
  background: linear-gradient(135deg, var(--accent), #1f8a7b);
  color: var(--ivory);
  padding: 12px;
  border-radius: 8px 8px 0 0;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    display: block;
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
      <MobileHeading>Client Management System</MobileHeading>
      <ClientListContainer>
        <Header>
          <FilterContainer>
            <FilterRow>
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
              <MobileLogoutButton onClick={handleLogout}>
                <FiLogOut />
              </MobileLogoutButton>
            </FilterRow>
            <ButtonContainer>
              <GetDataButton onClick={handleFilter}>Get Data</GetDataButton>
              <AddClientLink to="/add-client">Add Client</AddClientLink>
            </ButtonContainer>
          </FilterContainer>
          <ActionButtonsContainer>
            <DesktopLogoutButton onClick={handleLogout}>
              <FiLogOut style={{ marginRight: "5px" }} /> Logout
            </DesktopLogoutButton>
          </ActionButtonsContainer>
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
                    <FaIndianRupeeSign />
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
          <MobileHeader>
            Client Information Overview
          </MobileHeader>
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
                      <MobileLabel>Photo:</MobileLabel>
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
                    <NameCell>
                      <MobileLabel>Name:</MobileLabel>
                      {client.name || "N/A"}
                    </NameCell>
                    <AddressCell>
                      <MobileLabel>Address:</MobileLabel>
                      {client.address || "N/A"}
                    </AddressCell>
                    <ItemCell>
                      <MobileLabel>Items:</MobileLabel>
                      {firstItemImage ? (
                        <ClientImage src={firstItemImage} alt="First Item" />
                      ) : (
                        "No Photos"
                      )}
                    </ItemCell>
                    <ItemsCountCell>
                      <MobileLabel>No of Items:</MobileLabel>
                      {client.itemsCount || 0}
                    </ItemsCountCell>
                    <PriceCell>
                      <MobileLabel>Total Price:</MobileLabel>₹
                      {client.total_price || 0}
                    </PriceCell>
                    <BalanceCell>
                      <MobileLabel>Total Balance:</MobileLabel>₹
                      {client.total_balance || 0}
                    </BalanceCell>
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