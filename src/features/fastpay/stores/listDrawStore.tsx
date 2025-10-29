import { create } from "zustand";

interface ListDrawStoreState {
  openListDraw: boolean;

  setOpenListDraw: (data: Partial<ListDrawStoreState>) => void;
}

const useListDrawStore = create<ListDrawStoreState>((set) => ({
  openListDraw: false,

  setOpenListDraw: (data) => set((state) => ({ ...state, ...data })),
}));

export default useListDrawStore;
