import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(data: string): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(data, {
    folder: "lifewithai/images",
    resource_type: "image",
    quality: "auto",
    fetch_format: "auto",
  });
  logger.info({ publicId: result.public_id }, "Image uploaded");
  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadVideo(data: string): Promise<{ url: string; publicId: string; duration?: number }> {
  const result = await cloudinary.uploader.upload(data, {
    folder: "lifewithai/videos",
    resource_type: "video",
    chunk_size: 6000000,
  });
  logger.info({ publicId: result.public_id }, "Video uploaded");
  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration ? Math.round(result.duration) : undefined,
  };
}

export async function uploadPdfFile(data: string): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(data, {
    folder: "lifewithai/pdfs",
    resource_type: "raw",
  });
  logger.info({ publicId: result.public_id }, "PDF uploaded");
  return { url: result.secure_url, publicId: result.public_id };
}

export async function getSignedStreamUrl(publicId: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const url = cloudinary.url(publicId, {
    resource_type: "video",
    type: "upload",
    sign_url: true,
    expires_at: expiry,
  });
  return url;
}

export async function deleteResource(publicId: string, resourceType: "image" | "video" | "raw" = "image"): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
