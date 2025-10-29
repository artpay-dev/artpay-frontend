import { useCallback } from "react";
import useToolTipStore from "../../../stores/tooltipStore.ts";

export const useCopyToClipboard = () => {
  const { showToolTip } = useToolTipStore();

  const copyToClipboard = useCallback(async (text: string, successMessage = "Elemento copiato") => {
    try {
      await navigator.clipboard.writeText(text);
      showToolTip({
        visible: true,
        type: "info",
        message: successMessage,
      });
      return true;
    } catch (error) {
      console.error("Errore nella copia:", error);
      showToolTip({
        visible: true,
        type: "error",
        message: "Errore durante la copia",
      });
      return false;
    }
  }, [showToolTip]);

  return { copyToClipboard };
};