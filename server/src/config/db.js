import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect("mongodb+srv://nishantsharma9034:nishantSHARMA@nishant.mskxeu0.mongodb.net/Enclave-portal?retryWrites=true&w=majority", {});

    logger.info(
      `MongoDB Connected : ${connection.connection.host}`
    );
  } catch (error) {
    logger.error(`MongoDB Connection Failed : ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;