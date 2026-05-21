import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler.js";
import router from "./routes/index.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartShift API is running");
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

export default app;
