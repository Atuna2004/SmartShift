import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler.js";
import router from "./routes/index.js";

const app = express();

app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_URL || req.headers.origin || "*";

  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Vary", "Origin");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartShift API is running");
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

export default app;
