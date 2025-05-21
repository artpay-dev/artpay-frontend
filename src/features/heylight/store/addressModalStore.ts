import { create } from "zustand";

interface ModalState {
  visible: boolean;
  showModal: (message: Partial<ModalState>) => void;
}

const useModalStore = create<ModalState>((set) => ({
  visible: false,

  showModal: (data) => set((state) => ({ ...state, ...data })),
}));

export default useModalStore;
