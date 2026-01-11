import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload a PDF buffer to Cloudinary
 */
export async function uploadPDF(
  buffer: Buffer,
  fileName: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        type: "upload",
        access_mode: "public",
        folder: "basel-pdfs",
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, "")}`,
        format: "pdf",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error("No result from Cloudinary"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete a PDF from Cloudinary by its public_id
 */
export async function deletePDF(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
}

export default cloudinary;
