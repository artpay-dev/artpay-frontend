import { useState, useCallback } from "react";
import { uploadFile } from "@uploadcare/upload-client";
import useToolTipStore from "../../../stores/tooltipStore.ts";
import type { FileUploadConfig } from "../types.ts";

export const useFileUpload = (config: FileUploadConfig) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { showToolTip } = useToolTipStore();

  const selectFile = useCallback((file: File) => {
    // Validate file type
    if (config.acceptedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !config.acceptedTypes.some(type => 
        type.toLowerCase().includes(fileExtension))) {
        showToolTip({
          visible: true,
          type: "error",
          message: `Formato file non supportato. Formati accettati: ${config.acceptedTypes.join(", ")}`
        });
        return false;
      }
    }

    // Validate file size
    if (config.maxSize && file.size > config.maxSize) {
      showToolTip({
        visible: true,
        type: "error",
        message: `File troppo grande. Dimensione massima: ${(config.maxSize / 1024 / 1024).toFixed(1)}MB`
      });
      return false;
    }

    setSelectedFile(file);
    showToolTip({
      visible: true,
      type: "info",
      message: "File caricato correttamente."
    });
    return true;
  }, [config, showToolTip]);

  const uploadSelectedFile = useCallback(async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    try {
      const result = await uploadFile(selectedFile, {
        publicKey: config.publicKey,
        store: "auto",
        metadata: {
          subsystem: "js-client",
        },
      });

      if (result.uuid) {
        setUploadResult(result);
        showToolTip({
          visible: true,
          type: "info",
          message: "Documenti inviati con successo."
        });
        return result;
      } else {
        throw new Error("Upload failed - no UUID received");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToolTip({
        visible: true,
        type: "error",
        message: "Errore durante l'invio."
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, config.publicKey, showToolTip]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
  }, []);

  return {
    selectedFile,
    isUploading,
    uploadResult,
    selectFile,
    uploadSelectedFile,
    clearFile
  };
};