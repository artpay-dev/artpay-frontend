import { create } from "zustand";

interface ArticleDrawState {
  openArticleDraw: boolean;

  setOpenArticleDraw: (data: Partial<ArticleDrawState>) => void;
}

const useArticleStore = create<ArticleDrawState>((set) => ({
  openArticleDraw: false,

  setOpenArticleDraw: (data) => set((state) => ({ ...state, ...data })),
}));

export default useArticleStore;
