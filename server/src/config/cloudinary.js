import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder to store the image in
 */
export const uploadToCloudinary = (buffer, folder = "enclave-portal") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload failed: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export default cloudinary;
