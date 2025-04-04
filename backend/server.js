const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("[server] DB connection error:", err);
});

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT, photos TEXT, created_at DATETIME , updated_at DATETIME)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, item_name TEXT, price REAL, remaining_balance REAL, images TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS balance_history (id INTEGER PRIMARY KEY AUTOINCREMENT, purchase_id INTEGER, previous_amount REAL, updated_amount REAL, modification_date TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS price_history (id INTEGER PRIMARY KEY AUTOINCREMENT, purchase_id INTEGER, previous_price REAL, updated_price REAL, modification_date TEXT)"
  );
});

const storage = multer.memoryStorage();

const uploadClientsMiddleware = (req, res, next) => {
  const upload = multer({
    storage,
    limits: {
      files: 15,
      fileSize: 5 * 1024 * 1024,
      fieldSize: 10 * 1024 * 1024,
    },
  }).array("photos", 15);

  upload(req, res, (err) => {
    if (err) {
      console.error("[server] Multer error (clients):", err.message);
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: "Too many files - max 15" });
      }
      return next(err);
    }
    next();
  });
};

const uploadPurchasesMiddleware = (req, res, next) => {
  const upload = multer({
    storage,
    limits: {
      files: 15,
      fileSize: 5 * 1024 * 1024,
      fieldSize: 10 * 1024 * 1024,
    },
  }).array("images", 15);

  upload(req, res, (err) => {
    if (err) {
      console.error("[server] Multer error (purchases):", err.message);
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: "Too many files - max 15" });
      }
      return next(err);
    }
    next();
  });
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token !== "fake-jwt-token") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password") {
    res.json({ token: "fake-jwt-token" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/clients/:page/:searchByFilterName?/:filterValue?", (req, res) => {
  const { searchByFilterName, filterValue, page } = req.params;
  const take = 10;
  const skip = Number(page) * take;

  let fieldName = "";
  let searching = "";

  if (searchByFilterName === "name") {
    fieldName = "name";
    searching = `WHERE c.${fieldName} LIKE ?`;
  } else if (searchByFilterName === "address") {
    fieldName = "address";
    searching = `WHERE c.${fieldName} LIKE ?`;
  } else if (searchByFilterName === "clientid") {
    fieldName = "id";
    searching = `WHERE c.${fieldName} = ?`;
  } else if (searchByFilterName === "item") {
    fieldName = "item_name";
    searching = `WHERE p.${fieldName} LIKE ?`;
  } else if (searchByFilterName === "createdDate") {
    searching = `WHERE DATE(created_at) = ?`;
  } else if (searchByFilterName === "updatedDate") {
    searching = `WHERE DATE(updated_at) = ?`;
  }

  db.all(
    `
    SELECT 
    c.id, c.name, c.address, c.photos, 
    COALESCE(json_group_array(json_object(
        'id', IFNULL(p.id, 0), 
        'item_name', IFNULL(p.item_name, ''), 
        'price', IFNULL(p.price, 0), 
        'remaining_balance', IFNULL(p.remaining_balance, 0), 
        'images', IFNULL(p.images, '[]')
    )), '[]') AS items
    FROM clients c
    LEFT JOIN purchases p ON c.id = p.client_id
    ${searching}
    GROUP BY c.id
    ORDER BY c.id DESC
    LIMIT ${take} OFFSET ${skip}
    `,
    searchByFilterName && [
      searchByFilterName === "clientid"
        ? `${Number(filterValue.trim())}`
        : searchByFilterName === "createdDate"
        ? `${filterValue.trim()}`
        : searchByFilterName === "updatedDate"
        ? `${filterValue.trim()}`
        : `%${filterValue.trim()}%`,
    ],
    (err, rows) => {
      if (err) {
        console.error("[server] Fetch clients error:", err.message);
        return res.status(500).json({ error: "Failed to fetch clients" });
      }
      const clients = rows.map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address || null,
        photos: row.photos ? JSON.parse(row.photos) : [],
        items: JSON.parse(row.items).map((item) => ({
          ...item,
          images: item.images ? JSON.parse(item.images) : [],
        })),
      }));
      res.json(clients);
    }
  );
});

app.get("/api/clients", verifyToken, (req, res) => {
  const take = 20;
  const skip = 0 * take;
  db.all(
    `SELECT c.*, p.id AS purchase_id, p.item_name, p.price, p.remaining_balance, p.images FROM clients c LEFT JOIN purchases p ON c.id = p.client_id LIMIT ${take} OFFSET ${skip}`,
    (err, rows) => {
      if (err) {
        console.error("[server] Fetch clients error:", err.message);
        return res.status(500).json({ error: "Failed to fetch clients" });
      }
      const clientsMap = new Map();
      rows.forEach((row) => {
        const clientId = row.id;
        if (!clientsMap.has(clientId)) {
          clientsMap.set(clientId, {
            id: clientId,
            name: row.name,
            address: row.address || null,
            photos: row.photos ? JSON.parse(row.photos) : [],
            items: [],
          });
        }
        if (row.purchase_id) {
          clientsMap.get(clientId).items.push({
            id: row.purchase_id,
            item_name: row.item_name,
            price: row.price,
            remaining_balance: row.remaining_balance,
            images: row.images ? JSON.parse(row.images) : [],
          });
        }
      });
      res.json(Array.from(clientsMap.values()));
    }
  );
});

app.post("/api/clients", verifyToken, uploadClientsMiddleware, (req, res) => {
  const { name, address } = req.body;
  const photos = req.files
    ? req.files.map((file) => file.buffer.toString("base64"))
    : [];

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ error: "Name is required and cannot be empty" });
  }
  const photosData = JSON.stringify(photos);
  db.run(
    "INSERT INTO clients (name, address, photos, created_at) VALUES (TRIM(?), TRIM(?), ?, CURRENT_TIMESTAMP)",
    [name, address || null, photosData],
    function (err) {
      if (err) {
        console.error("[server] Add client error:", err.message);
        return res.status(500).json({ error: "Failed to add client" });
      }
      res.json({
        id: this.lastID,
        name,
        address: address || null,
        photos,
        items: [],
      });
    }
  );
});

app.post(
  "/api/purchases",
  verifyToken,
  uploadPurchasesMiddleware,
  (req, res) => {
    const { client_id, item_name, price, remaining_balance } = req.body;
    const images = req.files
      ? req.files.map((file) => file.buffer.toString("base64"))
      : [];
    const priceNum = parseFloat(price);
    const balanceNum = parseFloat(remaining_balance || 0);

    if (!client_id || !item_name || isNaN(priceNum)) {
      return res.status(400).json({ error: "Invalid purchase data" });
    }
    if (isNaN(balanceNum) || balanceNum < 0 || balanceNum > priceNum) {
      return res.status(400).json({ error: "Invalid remaining balance" });
    }

    const imagesData = JSON.stringify(images);
    db.run(
      "INSERT INTO purchases (client_id, item_name, price, remaining_balance, images) VALUES (?, TRIM(?), TRIM(?), ?, ?)",
      [client_id, item_name, priceNum, balanceNum, imagesData],
      function (err) {
        if (err) {
          console.error("[server] Add purchase error:", err.message);
          return res.status(500).json({ error: "Failed to add purchase" });
        }
        res.json({
          id: this.lastID,
          client_id: parseInt(client_id),
          item_name,
          price: priceNum,
          remaining_balance: balanceNum,
          images,
        });
      }
    );
  }
);

app.put(
  "/api/clients/:id",
  verifyToken,
  uploadClientsMiddleware,
  (req, res) => {
    const clientId = req.params.id;
    const { name, address, existingPhotos } = req.body;
    const newPhotos = req.files
      ? req.files.map((file) => file.buffer.toString("base64"))
      : [];

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ error: "Name is required and cannot be empty" });
    }

    let parsedExistingPhotos = [];
    if (existingPhotos) {
      try {
        parsedExistingPhotos = JSON.parse(existingPhotos);
        if (!Array.isArray(parsedExistingPhotos)) parsedExistingPhotos = [];
      } catch (e) {
        parsedExistingPhotos = [];
      }
    }

    const updatedPhotos = [...parsedExistingPhotos, ...newPhotos];
    const photosData = JSON.stringify(updatedPhotos);

    db.get("SELECT id FROM clients WHERE id = ?", [clientId], (err, row) => {
      if (err) {
        console.error("[server] Check client error:", err.message);
        return res.status(500).json({ error: "Database error" });
      }
      if (!row) {
        return res.status(404).json({ error: "Client not found" });
      }
      db.run(
        "UPDATE clients SET name = TRIM(?), address = TRIM(?), photos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [name, address || null, photosData, clientId],
        function (err) {
          if (err) {
            console.error("[server] Update client error:", err.message);
            return res.status(500).json({ error: "Failed to update client" });
          }
          db.all(
            "SELECT id, item_name, price, remaining_balance, images FROM purchases WHERE client_id = ?",
            [clientId],
            (err, purchaseRows) => {
              if (err) {
                console.error("[server] Fetch purchases error:", err.message);
                return res
                  .status(500)
                  .json({ error: "Failed to fetch purchases" });
              }
              const items = purchaseRows.map((row) => ({
                id: row.id,
                item_name: row.item_name,
                price: row.price,
                remaining_balance: row.remaining_balance,
                images: row.images ? JSON.parse(row.images) : [],
              }));
              res.json({
                id: parseInt(clientId),
                name,
                address: address || null,
                photos: updatedPhotos,
                items,
              });
            }
          );
        }
      );
    });
  }
);

app.put(
  "/api/purchases/:id",
  verifyToken,
  uploadPurchasesMiddleware,
  (req, res) => {
    const purchaseId = req.params.id;
    const { item_name, price, remaining_balance, existingImages } = req.body;
    const newImages = req.files
      ? req.files.map((file) => file.buffer.toString("base64"))
      : [];

    db.get(
      "SELECT client_id, item_name, price, remaining_balance, images FROM purchases WHERE id = ?",
      [purchaseId],
      (err, row) => {
        if (err) {
          console.error("[server] Fetch purchase error:", err.message);
          return res.status(500).json({ error: "Database error" });
        }
        if (!row) {
          return res.status(404).json({ error: "Purchase not found" });
        }

        const current = {
          item_name: row.item_name,
          price: row.price,
          remaining_balance: row.remaining_balance,
          images: row.images ? JSON.parse(row.images) : [],
        };

        const updates = {
          item_name: item_name !== undefined ? item_name : current.item_name,
          price: price !== undefined ? parseFloat(price) : current.price,
          remaining_balance:
            remaining_balance !== undefined
              ? parseFloat(remaining_balance)
              : current.remaining_balance,
          images:
            newImages.length > 0 || existingImages
              ? [
                  ...(existingImages
                    ? JSON.parse(existingImages)
                    : current.images),
                  ...newImages,
                ]
              : current.images,
        };

        if (!updates.item_name || isNaN(updates.price)) {
          return res.status(400).json({ error: "Invalid purchase data" });
        }
        if (isNaN(updates.remaining_balance) || updates.remaining_balance < 0) {
          return res.status(400).json({ error: "Invalid remaining balance" });
        }
        if (updates.remaining_balance > updates.price) {
          return res
            .status(400)
            .json({ error: "Remaining balance cannot exceed price" });
        }

        const previousPrice = current.price;
        const updatedPrice = updates.price;
        const previousBalance = current.remaining_balance;
        const updatedBalance = updates.remaining_balance;

        db.run(
          "UPDATE purchases SET item_name = TRIM(?), price = TRIM(?), remaining_balance = ?, images = ? WHERE id = ?",
          [
            updates.item_name,
            updates.price,
            updates.remaining_balance,
            JSON.stringify(updates.images),
            purchaseId,
          ],
          function (err) {
            if (err) {
              console.error("[server] Update purchase error:", err.message);
              return res
                .status(500)
                .json({ error: "Failed to update purchase" });
            }

            const response = {
              id: parseInt(purchaseId),
              client_id: row.client_id,
              item_name: updates.item_name,
              price: updates.price,
              remaining_balance: updates.remaining_balance,
              images: updates.images,
            };

            if (previousPrice !== updatedPrice) {
              db.run(
                "INSERT INTO price_history (purchase_id, previous_price, updated_price, modification_date) VALUES (?, ?, ?, ?)",
                [
                  purchaseId,
                  previousPrice,
                  updatedPrice,
                  new Date().toISOString(),
                ],
                (err) => {
                  if (err)
                    console.error(
                      "[server] Insert price history error:",
                      err.message
                    );
                }
              );
            }

            if (
              remaining_balance !== undefined &&
              previousBalance !== updatedBalance &&
              !isNaN(updatedBalance)
            ) {
              db.run(
                "INSERT INTO balance_history (purchase_id, previous_amount, updated_amount, modification_date) VALUES (?, ?, ?, ?)",
                [
                  purchaseId,
                  previousBalance,
                  updatedBalance,
                  new Date().toISOString(),
                ],
                (err) => {
                  if (err)
                    console.error(
                      "[server] Insert balance history error:",
                      err.message
                    );
                }
              );
            }

            res.json(response);
          }
        );
      }
    );
  }
);

app.delete("/api/purchases/:id", verifyToken, (req, res) => {
  const purchaseId = req.params.id;
  db.run(
    "DELETE FROM balance_history WHERE purchase_id = ?",
    [purchaseId],
    (err) => {
      if (err) {
        console.error("[server] Delete balance history error:", err.message);
      }
      db.run(
        "DELETE FROM price_history WHERE purchase_id = ?",
        [purchaseId],
        (err) => {
          if (err) {
            console.error("[server] Delete price history error:", err.message);
          }
          db.run("DELETE FROM purchases WHERE id = ?", [purchaseId], (err) => {
            if (err) {
              console.error("[server] Delete purchase error:", err.message);
              return res
                .status(500)
                .json({ error: "Failed to delete purchase" });
            }
            res.json({ success: true });
          });
        }
      );
    }
  );
});

app.delete("/api/clients/:id", verifyToken, (req, res) => {
  const clientId = req.params.id;
  db.run(
    "DELETE FROM balance_history WHERE purchase_id IN (SELECT id FROM purchases WHERE client_id = ?)",
    [clientId],
    (err) => {
      if (err) {
        console.error("[server] Delete balance history error:", err.message);
      }
      db.run(
        "DELETE FROM price_history WHERE purchase_id IN (SELECT id FROM purchases WHERE client_id = ?)",
        [clientId],
        (err) => {
          if (err) {
            console.error("[server] Delete price history error:", err.message);
          }
          db.run(
            "DELETE FROM purchases WHERE client_id = ?",
            [clientId],
            (err) => {
              if (err) {
                console.error("[server] Delete purchases error:", err.message);
                return res
                  .status(500)
                  .json({ error: "Failed to delete purchases" });
              }
              db.run("DELETE FROM clients WHERE id = ?", [clientId], (err) => {
                if (err) {
                  console.error("[server] Delete client error:", err.message);
                  return res
                    .status(500)
                    .json({ error: "Failed to delete client" });
                }
                res.json({ success: true });
              });
            }
          );
        }
      );
    }
  );
});

app.get("/api/purchases/:purchaseId/history", verifyToken, (req, res) => {
  const purchaseId = req.params.purchaseId;
  db.all(
    "SELECT id, purchase_id, previous_amount, updated_amount, modification_date, NULL as previous_price, NULL as updated_price FROM balance_history WHERE purchase_id = ? UNION ALL SELECT id, purchase_id, NULL as previous_amount, NULL as updated_amount, modification_date, previous_price, updated_price FROM price_history WHERE purchase_id = ? ORDER BY modification_date DESC",
    [purchaseId, purchaseId],
    (err, rows) => {
      if (err) {
        console.error("[server] Fetch history error:", err.message);
        return res.status(500).json({ error: "Failed to fetch history" });
      }
      res.json(rows);
    }
  );
});

app.put("/api/clients/:id/photo", verifyToken, (req, res) => {
  const { id } = req.params;
  const { photo } = req.body;
  db.get("SELECT photos FROM clients WHERE id = ?", [id], (err, row) => {
    if (err || !row) {
      console.error(
        "[server] Fetch client for photo update error:",
        err?.message
      );
      return res.status(404).json({ error: "Client not found" });
    }
    const photos = JSON.parse(row.photos || "[]");
    const updatedPhotos = [photo, ...photos.filter((p) => p !== photo)];
    const photosData = JSON.stringify(updatedPhotos);
    db.run(
      "UPDATE clients SET photos = ? WHERE id = ?",
      [photosData, id],
      (err) => {
        if (err) {
          console.error("[server] Update photo error:", err.message);
          return res.status(500).json({ error: "Failed to update photo" });
        }
        res.json({ message: "Photo updated", photos: updatedPhotos });
      }
    );
  });
});

app.use((err, req, res, next) => {
  console.error("[server] Unhandled error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(5000, () => console.log("[server] Running on port 5000"));
