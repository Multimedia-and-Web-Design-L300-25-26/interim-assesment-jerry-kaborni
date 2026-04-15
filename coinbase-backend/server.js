import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import cryptoRoutes from "./routes/cryptoRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const dbStateMap = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

function getDbHealth() {
  const { connection } = mongoose;
  return {
    status: dbStateMap[connection.readyState] || "unknown",
    name: connection.name || null,
    host: connection.host || null,
  };
}

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Coinbase backend API is running.",
  });
});

app.get("/health", (req, res) => {
  const db = getDbHealth();
  const isHealthy = db.status === "connected";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    service: "coinbase-backend",
    database: db,
    timestamp: new Date().toISOString(),
  });
});

app.use(authRoutes);
app.use("/crypto", cryptoRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Internal server error.",
  });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = getDbHealth();
    console.log(`MongoDB connected successfully: ${db.name || "unknown"}@${db.host || "unknown"}`);
    app.listen(port, () => {
      console.log(`Coinbase backend listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
