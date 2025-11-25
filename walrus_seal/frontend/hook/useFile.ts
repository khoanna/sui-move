import {sealClient} from "@/lib/constant";
import {useCurrentWallet} from "@mysten/dapp-kit";
import {useState} from "react";

export default function useFile() {
  const [fileLoading, setFileLoading] = useState(false);

  const uploadFile = async (file: File) => {
    setFileLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();

      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      return result;
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    } finally {
      setFileLoading(false);
    }
  };

  const downloadFile = async (blobId: string) => {
    setFileLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/download/${blobId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download failed:", error);
    } finally {
      setFileLoading(false);
    }
  };

  return {fileLoading, uploadFile, downloadFile};
}
