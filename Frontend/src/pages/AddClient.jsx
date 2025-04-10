import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  addClient,
  fetchFilteredClients,
  updateClient,
  clientsList,
} from "../redux/actions";
import {
  FiArrowLeft,
  FiTrash2,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import {
  selectAuthToken,
  selectClientsList,
  selectCurrentPage,
  selectFilterData,
} from "../redux/selectors";

const AddClientContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 40px;
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: 0 8px 24px var(--shadow);
  border: 1px solid var(--border);
  position: relative;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    margin: 20px;
    padding: 25px;
    border-radius: 12px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    margin: 15px;
    padding: 20px;
    border-radius: 10px;
    padding-bottom: 60px; /* Add extra padding to prevent content from being hidden */
    width: calc(100% - 30px);
    box-sizing: border-box;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.8rem;
  cursor: pointer;
  transition: color 0.3s ease;
  &:hover {
    color: var(--accent);
  }
`;

const Heading = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 40px;
  text-align: center;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const Form = styled.form`
  display: grid;
  gap: 25px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    gap: 20px;
    padding: 15px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    gap: 15px;
    padding: 12px;
    padding-bottom: 30px; /* Add extra padding to prevent content from being hidden */
    width: 100%;
    box-sizing: border-box;
  }
`;

const Label = styled.label`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  display: block;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  font-size: 1rem;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 8px rgba(42, 157, 143, 0.2);
  }

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 12px 15px;
    font-size: 0.95rem;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FileInput = styled.input`
  padding: 12px;
  font-size: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s ease;
  &:hover {
    border-color: var(--accent);
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    font-size: 0.9rem;
  }
`;

const PhotoPreview = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    gap: 12px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    gap: 10px;
  }
`;

const PreviewImageWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const PreviewImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--border);

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    width: 100px;
    height: 100px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    width: 90px;
    height: 90px;
  }
`;

const DeletePhotoButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(230, 57, 70, 0.9);
  color: var(--ivory);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: #e63946;
  }
`;

const ItemSection = styled.div`
  border: 1px solid var(--border);
  padding: 20px;
  border-radius: 8px;
  background: var(--bg-secondary);
  display: grid;
  gap: 15px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 15px;
    gap: 12px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 12px;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
  }
`;

const AddItemButton = styled.button`
  padding: 10px;
  font-size: 1rem;
  background: var(--accent);
  color: var(--ivory);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background 0.3s ease;
  &:hover {
    background: var(--highlight);
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    font-size: 0.9rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 30px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    gap: 15px;
    margin-top: 25px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    flex-direction: row; /* Keep horizontal layout */
    gap: 12px;
    margin-top: 20px;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--accent);
  color: var(--ivory);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(42, 157, 143, 0.3);
  transition: background 0.3s ease;
  &:hover {
    background: var(--highlight);
  }

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 12px;
    font-size: 1rem;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 10px;
    font-size: 0.95rem;
    width: 48%;
    box-sizing: border-box;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--titanium);
  color: var(--ivory);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(120, 133, 139, 0.3);
  transition: background 0.3s ease;
  &:hover {
    background: #5f6e74;
  }

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 12px;
    font-size: 1rem;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 10px;
    font-size: 0.95rem;
    width: 48%;
    box-sizing: border-box;
  }
`;

const ErrorMessage = styled.p`
  color: #e63946;
  font-size: 1rem;
  text-align: center;
  margin-top: 15px;
  font-weight: 500;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 15px;
    margin: 0 20px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 12px;
    margin: 0 15px;
  }
`;

const ModalMessage = styled.p`
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 20px;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    flex-direction: row; /* Keep horizontal layout */
    gap: 10px;
    justify-content: space-between;
  }
`;

const YesButton = styled.button`
  padding: 10px 20px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: #27ae60;
  }
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    width: auto;
    min-width: 100px;
    padding: 10px;
  }
`;

const NoButton = styled.button`
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: #c0392b;
  }
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    width: auto;
    min-width: 100px;
    padding: 10px;
  }
`;

const ScrollButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--accent);
  color: var(--ivory);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    background: var(--highlight);
    transform: translateY(-3px);
  }

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    width: 45px;
    height: 45px;
    bottom: 25px;
    right: 25px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    width: 40px;
    height: 40px;
    bottom: 20px;
    right: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  /* Small Mobile (320px and below) */
  @media screen and (max-width: 320px) {
    width: 35px;
    height: 35px;
    bottom: 15px;
    right: 15px;
  }
`;

const compressImage = (file) => {
  return new Promise((resolve) => {
    // Skip compression for small files (less than 100KB)
    if (file.size < 100 * 1024) {
      resolve(file);
      return;
    }

    // Use a more efficient approach for larger files
    const img = new Image();
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        // Use a more aggressive compression for very large images
        const isVeryLarge = file.size > 1024 * 1024; // > 1MB

        const MAX_WIDTH = isVeryLarge ? 600 : 800;
        const MAX_HEIGHT = isVeryLarge ? 600 : 800;

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Use better quality settings based on file size
        const quality = isVeryLarge ? 0.6 : file.size > 500 * 1024 ? 0.7 : 0.85;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) =>
            resolve(new File([blob], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          quality
        );
      };
    };
    reader.readAsDataURL(file);
  });
};

// Memoize the modal component to prevent unnecessary re-renders
const ConfirmationModal = React.memo(
  ({ show, type, data, onConfirm, onCancel, isModalActionInProgress }) => {
    if (!show) return null;

    const getModalMessage = () => {
      switch (type) {
        case "deleteItem":
          return "Are you sure to delete this item?";
        case "deletePhoto":
          return "Are you sure to delete this photo?";
        case "deleteItemImage":
          return "Are you sure to delete this item image?";
        case "updateClient":
          return "Are you sure to update this client?";
        default:
          return "Are you sure to add this client?";
      }
    };

    return (
      <ModalOverlay>
        <ModalContent>
          <ModalMessage>{getModalMessage()}</ModalMessage>
          <ModalButtons>
            <YesButton onClick={onConfirm} disabled={isModalActionInProgress}>
              {isModalActionInProgress ? "Processing..." : "Yes"}
            </YesButton>
            <NoButton onClick={onCancel} disabled={isModalActionInProgress}>
              No
            </NoButton>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    );
  }
);

const AddClient = () => {
  const { id } = useParams();
  const clientId = id ? parseInt(id) : null;
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [items, setItems] = useState([
    {
      name: "",
      price: "",
      remaining_balance: "",
      image: null,
      preview: "",
      purchaseId: null,
      existingImages: [],
    },
  ]);
  const [originalData, setOriginalData] = useState(null);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({ show: false, type: "", data: null });
  const [isModalActionInProgress, setIsModalActionInProgress] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector(selectAuthToken);
  const displayUpdatedClient = useSelector(selectClientsList);
  const page = useSelector(selectCurrentPage);
  const filterDataStore = useSelector(selectFilterData);

  const itemFileInputRefs = useRef([]);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    if (clientId) {
      // Use the transformed clientsList from the selector
      const client = displayUpdatedClient.find((c) => c.id === clientId);
      if (client) {
        // Batch state updates to reduce renders
        const updates = {
          name: client.name || "",
          address: client.address || "",
          existingPhotos: client.photos || [],
          photoPreviews: (client.photos || []).map(
            (photo) => `data:image/jpeg;base64,${photo}`
          ),
          items:
            (client.items || []).length > 0
              ? (client.items || []).map((item) => ({
                  name: item.item_name || "",
                  price: (item.price || 0).toString(),
                  remaining_balance: (item.remaining_balance || 0).toString(),
                  image: null,
                  preview:
                    item.images?.length > 0
                      ? `data:image/jpeg;base64,${item.images[0]}`
                      : "",
                  purchaseId: item.id || null,
                  existingImages: item.images || [],
                }))
              : [
                  {
                    name: "",
                    price: "",
                    remaining_balance: "",
                    image: null,
                    preview: "",
                    purchaseId: null,
                    existingImages: [],
                  },
                ],
        };

        // Apply all updates at once
        setName(updates.name);
        setAddress(updates.address);
        setExistingPhotos(updates.existingPhotos);
        setPhotoPreviews(updates.photoPreviews);
        setItems(updates.items);

        // Store original data for potential reversion
        setOriginalData({
          name: updates.name,
          address: updates.address,
          photos: updates.existingPhotos.slice(),
          photoPreviews: updates.photoPreviews.slice(),
          items: JSON.parse(JSON.stringify(updates.items)),
        });
      } else {
        setError("Client not found");
      }
    }

    // Initialize refs only once
    if (itemFileInputRefs.current.length === 0) {
      itemFileInputRefs.current = items.map(
        (_, i) => itemFileInputRefs.current[i] || React.createRef()
      );
    }
  }, [clientId, displayUpdatedClient, token, navigate]);

  useEffect(() => {
    let scrollRAF = null;

    const handleScroll = () => {
      // Use requestAnimationFrame to throttle scroll events
      if (!scrollRAF) {
        scrollRAF = requestAnimationFrame(() => {
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          setIsNearBottom(scrollTop + windowHeight >= documentHeight - 100);
          scrollRAF = null;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollRAF) {
        cancelAnimationFrame(scrollRAF);
      }
    };
  }, []);

  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files);
    const totalPhotos = photos.length + existingPhotos.length + newFiles.length;
    if (totalPhotos > 15) {
      toast.error("Maximum 15 photos allowed.");
      return;
    }

    // Process files in batches to avoid blocking the main thread
    const batchSize = 3;
    const batches = [];
    for (let i = 0; i < newFiles.length; i += batchSize) {
      batches.push(newFiles.slice(i, i + batchSize));
    }

    let processedPhotos = [];
    let processedPreviews = [];

    for (const batch of batches) {
      // Process each batch
      const batchResults = await Promise.all(batch.map(compressImage));
      processedPhotos = [...processedPhotos, ...batchResults];
      processedPreviews = [
        ...processedPreviews,
        ...batchResults.map((file) => URL.createObjectURL(file)),
      ];

      // Update state after each batch to show progress
      setPhotos((prev) => [...prev, ...batchResults]);
      setPhotoPreviews((prev) => [
        ...prev,
        ...batchResults.map((file) => URL.createObjectURL(file)),
      ]);

      // Small delay between batches to allow UI to update
      if (batches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  };

  const handleItemImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Use requestIdleCallback if available to defer non-critical work
      const processImage = async () => {
        const compressedFile = await compressImage(file);
        const newItems = [...items];
        newItems[index].image = compressedFile;
        newItems[index].preview = URL.createObjectURL(compressedFile);
        setItems(newItems);
      };

      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => processImage(), { timeout: 1000 });
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(processImage, 0);
      }
    }
  };

  const handleDeletePhoto = (index) => {
    setModal({
      show: true,
      type: "deletePhoto",
      data: index,
    });
  };

  const confirmDeletePhoto = (index) => {
    setIsModalActionInProgress(true);
    const isExistingPhoto = index < existingPhotos.length;
    if (isExistingPhoto) {
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newPhotoIndex = index - existingPhotos.length;
      setPhotos((prev) => prev.filter((_, i) => i !== newPhotoIndex));
    }
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));

    // Close modal immediately
    setModal({ show: false, type: "", data: null });
    setIsModalActionInProgress(false);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];

    if (field === "price" || field === "remaining_balance") {
      // Ensure we're working with valid numbers
      const intValue = value === "" ? "" : parseInt(value, 10).toString();
      newItems[index][field] = intValue;
    } else {
      // For text fields, ensure we're working with strings
      newItems[index][field] = value || "";
    }

    // Update state immediately
    setItems(newItems);
  };

  const handleDeleteItemImage = (index) => {
    setModal({
      show: true,
      type: "deleteItemImage",
      data: index,
    });
  };

  const confirmDeleteItemImage = (index) => {
    setIsModalActionInProgress(true);
    const newItems = [...items];
    newItems[index].image = null;
    newItems[index].preview = "";
    newItems[index].existingImages = [];
    setItems(newItems);
    if (itemFileInputRefs.current[index]?.current) {
      itemFileInputRefs.current[index].current.value = "";
    }

    // Close modal immediately
    setModal({ show: false, type: "", data: null });
    setIsModalActionInProgress(false);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        price: "",
        remaining_balance: "",
        image: null,
        preview: "",
        purchaseId: null,
        existingImages: [],
      },
    ]);
    itemFileInputRefs.current.push(React.createRef());
  };

  const removeItem = (index) => {
    setModal({
      show: true,
      type: "deleteItem",
      data: index,
    });
  };

  const confirmRemoveItem = (index) => {
    setIsModalActionInProgress(true);
    const item = items[index];
    if (item.purchaseId) {
      setItemsToDelete((prev) => [...prev, item.purchaseId]);
    }
    setItems(items.filter((_, i) => i !== index));
    itemFileInputRefs.current.splice(index, 1);

    // Close modal immediately
    setModal({ show: false, type: "", data: null });
    setIsModalActionInProgress(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate form data
    if (!name.trim()) {
      setError("Client name is required");
      return;
    }

    const validItems = items.filter(
      (item) => item.name.trim() || item.price || item.remaining_balance
    );
    if (validItems.length === 0 && !clientId) {
      setError("At least one item is required when adding a client");
      return;
    }

    // Validate each item
    for (const item of validItems) {
      if (!item.name.trim()) {
        setError("Item name is required");
        return;
      }
      const price = item.price === "" ? NaN : parseInt(item.price, 10);
      const balance =
        item.remaining_balance === ""
          ? NaN
          : parseInt(item.remaining_balance, 10);

      if (isNaN(price) || price <= 0) {
        setError(`Valid price (> 0) is required for item: ${item.name}`);
        return;
      }
      if (isNaN(balance) || balance < 0) {
        setError(
          `Valid remaining balance (>= 0) is required for item: ${item.name}`
        );
        return;
      }
      if (balance > price) {
        setError(`Balance cannot exceed price for item: ${item.name}`);
        return;
      }
    }

    // Show modal immediately without requestAnimationFrame
    setModal({
      show: true,
      type: "updateClient",
      data: null,
    });
  };

  const confirmUpdate = async () => {
    setIsModalActionInProgress(true);
    setIsSubmitting(true);

    try {
      if (clientId) {
        const clientData = {
          name,
          address,
          photos: photos,
          existingPhotos: existingPhotos,
          items: items
            .filter((item) => item.name.trim())
            .map((item) => ({
              item_name: item.name,
              price: parseInt(item.price, 10),
              remaining_balance: parseInt(item.remaining_balance, 10),
              images: item.image ? [item.image] : null,
              existingImages: item.existingImages || [],
              purchaseId: item.purchaseId || null,
            })),
          itemsToDelete,
        };

        // Determine filter value outside of the dispatch call
        const updatedFilterValue =
          filterDataStore.filterType === "createdDate"
            ? filterDataStore.createdDate
            : filterDataStore.filterType === "updatedDate"
            ? filterDataStore.updatedDate
            : filterDataStore.filterValue;

        // First update the client
        await dispatch(updateClient(token, clientId, clientData));

        // Then fetch the updated client list with the current filter settings
        const updatedClients = await dispatch(
          fetchFilteredClients(
            token,
            filterDataStore.filterType,
            updatedFilterValue,
            page
          )
        );

        // Update the clients list in the Redux store
        await dispatch(clientsList(updatedClients));

        // Force a refresh of the current client data
        const refreshedClient = updatedClients.find((c) => c.id === clientId);
        if (refreshedClient) {
          // Update the local state with the refreshed data
          setName(refreshedClient.name || "");
          setAddress(refreshedClient.address || "");
          setExistingPhotos(refreshedClient.photos || []);
          setPhotoPreviews(
            (refreshedClient.photos || []).map(
              (photo) => `data:image/jpeg;base64,${photo}`
            )
          );

          // Update items with the refreshed data
          const refreshedItems = (refreshedClient.items || []).map((item) => ({
            name: item.item_name || "",
            price: (item.price || 0).toString(),
            remaining_balance: (item.remaining_balance || 0).toString(),
            image: null,
            preview:
              item.images?.length > 0
                ? `data:image/jpeg;base64,${item.images[0]}`
                : "",
            purchaseId: item.id || null,
            existingImages: item.images || [],
          }));

          setItems(
            refreshedItems.length > 0
              ? refreshedItems
              : [
                  {
                    name: "",
                    price: "",
                    remaining_balance: "",
                    image: null,
                    preview: "",
                    purchaseId: null,
                    existingImages: [],
                  },
                ]
          );
        }
      } else {
        const clientData = {
          name,
          address,
          photos: photos,
        };
        const purchases = items
          .filter((item) => item.name.trim())
          .map((item) => ({
            item_name: item.name,
            price: parseInt(item.price, 10), // Ensure integer
            remaining_balance: parseInt(item.remaining_balance, 10), // Ensure integer
            images: item.image ? [item.image] : null,
          }));

        await dispatch(addClient(token, { client: clientData, purchases }));
      }

      // Close modal and navigate immediately
      setModal({ show: false, type: "", data: null });
      navigate("/clients");
    } catch (error) {
      setError(error.message || "Failed to process request");
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
      setIsModalActionInProgress(false);
    }
  };

  const revertChanges = () => {
    setIsModalActionInProgress(true);
    if (originalData) {
      // Batch state updates
      const updates = {
        name: originalData.name,
        address: originalData.address,
        items: JSON.parse(JSON.stringify(originalData.items)),
        photos: [],
        existingPhotos: originalData.photos.slice(),
        photoPreviews: originalData.photoPreviews.slice(),
        itemsToDelete: [],
      };

      // Apply all updates at once
      setName(updates.name);
      setAddress(updates.address);
      setItems(updates.items);
      setPhotos(updates.photos);
      setExistingPhotos(updates.existingPhotos);
      setPhotoPreviews(updates.photoPreviews);
      setItemsToDelete(updates.itemsToDelete);
    }

    // Close modal immediately
    setModal({ show: false, type: "", data: null });
    setIsModalActionInProgress(false);
  };

  const closeModal = () => {
    // Close modal immediately
    setModal({ show: false, type: "", data: null });
  };

  const handleScroll = () => {
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      if (isNearBottom) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  };

  return (
    <AddClientContainer>
      <BackButton onClick={() => navigate("/clients")}>
        <FiArrowLeft />
      </BackButton>
      <Heading>{clientId ? "Edit Client Profile" : "Add New Client"}</Heading>
      <Form onSubmit={handleSubmit} ref={formRef}>
        <div>
          <Label htmlFor="clientName">Name</Label>
          <Input
            id="clientName"
            name="clientName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter client name"
          />
        </div>
        <div>
          <Label htmlFor="clientAddress">Address</Label>
          <Input
            id="clientAddress"
            name="clientAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address (optional)"
          />
        </div>
        <FileInputWrapper>
          <Label htmlFor="clientPhotos">Photos</Label>
          <FileInput
            id="clientPhotos"
            name="clientPhotos"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          {photoPreviews.length > 0 && (
            <PhotoPreview>
              {photoPreviews.map((src, index) => (
                <PreviewImageWrapper key={index}>
                  <PreviewImage src={src} alt={`Preview ${index}`} />
                  <DeletePhotoButton
                    type="button"
                    onClick={() => handleDeletePhoto(index)}
                    aria-label={`Delete photo ${index + 1}`}
                  >
                    <FiTrash2 size={16} />
                  </DeletePhotoButton>
                </PreviewImageWrapper>
              ))}
            </PhotoPreview>
          )}
        </FileInputWrapper>
        {items.map((item, index) => (
          <ItemSection key={index}>
            <div>
              <Label htmlFor={`itemName-${index}`}>Item Name</Label>
              <Input
                id={`itemName-${index}`}
                name={`itemName-${index}`}
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
                placeholder="Enter item name"
                required={!clientId}
              />
            </div>
            <div>
              <Label htmlFor={`itemPrice-${index}`}>Price</Label>
              <Input
                id={`itemPrice-${index}`}
                name={`itemPrice-${index}`}
                type="text"
                value={item.price}
                onChange={(e) =>
                  handleItemChange(index, "price", e.target.value)
                }
                placeholder="Enter price"
                required={!clientId}
              />
            </div>
            <div>
              <Label htmlFor={`itemBalance-${index}`}>Remaining Balance</Label>
              <Input
                id={`itemBalance-${index}`}
                name={`itemBalance-${index}`}
                type="text"
                value={item.remaining_balance}
                onChange={(e) =>
                  handleItemChange(index, "remaining_balance", e.target.value)
                }
                placeholder="Enter remaining balance"
                required={!clientId}
              />
            </div>
            <FileInputWrapper>
              <Label htmlFor={`itemImage-${index}`}>Item Image</Label>
              <FileInput
                id={`itemImage-${index}`}
                name={`itemImage-${index}`}
                type="file"
                accept="image/*"
                ref={itemFileInputRefs.current[index]}
                onChange={(e) => handleItemImageChange(index, e)}
              />
              {item.preview && (
                <PhotoPreview>
                  <PreviewImageWrapper>
                    <PreviewImage
                      src={item.preview}
                      alt={`Item Preview ${index}`}
                    />
                    <DeletePhotoButton
                      type="button"
                      onClick={() => handleDeleteItemImage(index)}
                      aria-label={`Delete item image ${index + 1}`}
                    >
                      <FiTrash2 size={16} />
                    </DeletePhotoButton>
                  </PreviewImageWrapper>
                </PhotoPreview>
              )}
            </FileInputWrapper>
            {items.length > 1 && (
              <DeletePhotoButton
                type="button"
                onClick={() => removeItem(index)}
                style={{ position: "relative", marginTop: "10px" }}
                aria-label={`Remove item ${index + 1}`}
              >
                <FiTrash2 size={16} />
              </DeletePhotoButton>
            )}
          </ItemSection>
        ))}
        <AddItemButton
          type="button"
          onClick={addItem}
          aria-label="Add new item"
        >
          <FiPlus /> Add Item
        </AddItemButton>
        <ButtonContainer>
          <CancelButton type="button" onClick={() => navigate("/clients")}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {clientId ? "Update Client" : "Add Client"}
          </SubmitButton>
        </ButtonContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>

      {modal.show && (
        <ConfirmationModal
          show={modal.show}
          type={modal.type}
          data={modal.data}
          onConfirm={() => {
            if (modal.type === "deleteItem") {
              confirmRemoveItem(modal.data);
            } else if (modal.type === "deletePhoto") {
              confirmDeletePhoto(modal.data);
            } else if (modal.type === "deleteItemImage") {
              confirmDeleteItemImage(modal.data);
            } else if (modal.type === "updateClient") {
              confirmUpdate();
            }
          }}
          onCancel={() => {
            if (modal.type === "updateClient") {
              revertChanges();
            } else {
              closeModal();
            }
          }}
          isModalActionInProgress={isModalActionInProgress}
        />
      )}

      <ScrollButton onClick={handleScroll}>
        {isNearBottom ? <FiArrowUp size={24} /> : <FiArrowDown size={24} />}
      </ScrollButton>
    </AddClientContainer>
  );
};

export default AddClient;
