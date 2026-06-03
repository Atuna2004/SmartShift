import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./database/mongodb.js";
import { PaymentService } from "./modules/payment/payment.service.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const REGISTRATION_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

const startRegistrationCleanup = () => {
  setInterval(() => {
    PaymentService.expireRegistrationCheckouts().catch((error) => {
      console.error("Failed to expire registration checkouts", error);
    });
  }, REGISTRATION_CLEANUP_INTERVAL_MS).unref();
};

const startServer = async () => {
  const isDatabaseConnected = await connectDB();
  startRegistrationCleanup();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!isDatabaseConnected) {
      console.log("Database-dependent routes will fail until MongoDB is available");
    }
  });
};

startServer();
