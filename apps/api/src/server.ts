import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./database/mongodb.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const isDatabaseConnected = await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!isDatabaseConnected) {
      console.log("Database-dependent routes will fail until MongoDB is available");
    }
  });
};

startServer();
