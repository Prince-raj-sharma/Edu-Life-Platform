import { useState } from "react";
import { useUploadImage, useUploadVideo, useUploadPdfFile } from "@workspace/api-client-react";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const uploadImage = useUploadImage();
  const uploadVideo = useUploadVideo();
  const uploadPdfFile = useUploadPdfFile();

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const upload = async (file: File, type: "image" | "video" | "pdf") => {
    setIsUploading(true);
    try {
      const base64String = await readFileAsBase64(file);
      
      let response;
      if (type === "image") {
        response = await uploadImage.mutateAsync({ data: { data: base64String } });
      } else if (type === "video") {
        response = await uploadVideo.mutateAsync({ data: { data: base64String } });
      } else {
        response = await uploadPdfFile.mutateAsync({ data: { data: base64String } });
      }
      
      return response;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
  };
}
