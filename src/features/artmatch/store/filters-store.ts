import { create } from "zustand";

export interface PriceFilter {
  min?: number;
  max?: number;
  selectedRanges?: string[];
}

export interface ArtmatchFilters {
  price: PriceFilter;
  historicalPeriods?: string[];
  artTypes?: number[]; // IDs delle categorie WordPress
}

interface FiltersStore {
  filters: ArtmatchFilters;
  setMinPrice: (min: number | undefined) => void;
  setMaxPrice: (max: number | undefined) => void;
  setSelectedPriceRanges: (ranges: string[]) => void;
  setHistoricalPeriods: (periods: string[]) => void;
  setArtTypes: (types: number[]) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const initialFilters: ArtmatchFilters = {
  price: {},
  historicalPeriods: [],
  artTypes: [],
};

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  filters: initialFilters,

  setMinPrice: (min) =>
    set((state) => ({
      filters: {
        ...state.filters,
        price: { ...state.filters.price, min },
      },
    })),

  setMaxPrice: (max) =>
    set((state) => ({
      filters: {
        ...state.filters,
        price: { ...state.filters.price, max },
      },
    })),

  setSelectedPriceRanges: (ranges) =>
    set((state) => ({
      filters: {
        ...state.filters,
        price: { ...state.filters.price, selectedRanges: ranges },
      },
    })),

  setHistoricalPeriods: (periods) =>
    set((state) => ({
      filters: { ...state.filters, historicalPeriods: periods },
    })),

  setArtTypes: (types) =>
    set((state) => ({
      filters: { ...state.filters, artTypes: types },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  hasActiveFilters: () => {
    const { filters } = get();
    return (
      !!filters.price.min ||
      !!filters.price.max ||
      (filters.price.selectedRanges && filters.price.selectedRanges.length > 0) ||
      (filters.historicalPeriods && filters.historicalPeriods.length > 0) ||
      (filters.artTypes && filters.artTypes.length > 0)
    );
  },
}));