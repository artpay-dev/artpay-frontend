import { create } from "zustand";

interface ToolTipState {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info";
  icon?: Element | null;
  showToolTip: (message: Partial<ToolTipState>) => void;
}

const useToolTipStore = create<ToolTipState>((set) => ({
  visible: false,
  message: "",
  type: "success",

  showToolTip: (message) => set((state) => ({ ...state, ...message })),
}));

export default useToolTipStore;
