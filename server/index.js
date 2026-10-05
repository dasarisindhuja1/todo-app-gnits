const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const todoRoutes = require("./routes/todoRoutes");

const app = express();
app.use(express.json());

// Log every API request: method, url, status, time taken, and body for writes
app.use("/api", (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const body = ["POST", "PUT"].includes(req.method)
      ? ` ${JSON.stringify(req.body)}`
      : "";
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms${body}`
    );
  });
  next();
});

// API routes
app.use("/api/todos", todoRoutes);

// Serve the React build (used in production)
const buildPath = path.join(__dirname, "../client/dist");
app.use(express.static(buildPath));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 5001;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error(
    "Missing MongoDB connection string. Set MONGODB_URI or MONGO_URI in server/.env"
  );
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection failed:", err.message));
