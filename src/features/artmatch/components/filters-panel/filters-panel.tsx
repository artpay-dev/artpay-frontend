import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useFiltersStore } from "../../store/filters-store";
import { artmatchService } from "../../services/artmatch-services";

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

const ExpandIcon = ({ className = "" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M8 3.99967C7.94918 3.99967 7.89962 4.01475 7.85134 4.04489C7.80305 4.07503 7.75858 4.11203 7.71792 4.15587L2.09915 10.7822C2.03305 10.8644 2 10.9411 2 11.0124C2 11.0727 2.01398 11.1275 2.04193 11.1768C2.06987 11.2261 2.10545 11.2645 2.14864 11.2919C2.19184 11.3193 2.24394 11.333 2.30494 11.333C2.39133 11.333 2.46251 11.3056 2.51846 11.2508L8.23635 4.51761L7.75604 4.51761L13.4892 11.2508C13.5349 11.3056 13.6061 11.333 13.7027 11.333C13.7586 11.333 13.8094 11.3193 13.8551 11.2919C13.9009 11.2645 13.9365 11.2261 13.9619 11.1768C13.9873 11.1275 14 11.0727 14 11.0124C14 10.9631 13.9898 10.9206 13.9695 10.885C13.9492 10.8493 13.9238 10.8123 13.8933 10.774L8.28209 4.14766C8.1906 4.049 8.09657 3.99967 8 3.99967Z"
      fill="#010F22"
    />
  </svg>
);

const AccordionElement = ({ title = "title", children }: { title?: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <div className={"w-full"}>
      <div className={"w-full border-b border-[#CDCFD3]"}>
        <button className={"flex items-center justify-between w-full pb-2"} onClick={handleOpen}>
          <span>{title}</span>
          <ExpandIcon className={`${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div className={`${open ? 'h-auto ' : 'h-0'} pt-4 overflow-hidden`}>{children}</div>
    </div>
  );
};

interface FiltersPanelProps {
  onApplyFilters?: () => void;
}

const FiltersPanel = ({ onApplyFilters }: FiltersPanelProps) => {
  const filtersStore = useFiltersStore();

  // Stati locali per l'input
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);

  // Stati per categorie dinamiche
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Periodi storici basati su anno_di_produzione
  const historicalPeriods = [
    { id: "ancient", label: "Antico (prima del 1800)", value: "ancient", yearRange: [0, 1799] },
    { id: "modern", label: "Moderno (1800-1945)", value: "modern", yearRange: [1800, 1945] },
    { id: "contemporary", label: "Contemporaneo (1945-oggi)", value: "contemporary", yearRange: [1946, new Date().getFullYear()] },
  ];

  // Range di prezzo predefiniti
  const priceRanges = [
    { id: "range1", label: "0-200€", value: "0-200" },
    { id: "range2", label: "200-500€", value: "200-500" },
    { id: "range3", label: "500-1000€", value: "500-1000" },
    { id: "range4", label: "1000-5000€", value: "1000-5000" },
    { id: "range5", label: "5000+€", value: "5000+" },
  ];

  // Carica le categorie tramite il service
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await artmatchService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Errore nel caricamento delle categorie:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Inizializza gli stati dal store
  useEffect(() => {
    const { filters } = filtersStore;
    if (filters.price.min !== undefined) setMinPrice(filters.price.min.toString());
    if (filters.price.max !== undefined) setMaxPrice(filters.price.max.toString());
    if (filters.price.selectedRanges) setSelectedPriceRanges(filters.price.selectedRanges);
    if (filters.historicalPeriods) setSelectedPeriods(filters.historicalPeriods);
    if (filters.artTypes) setSelectedTypes(filters.artTypes);
  }, []);

  const handlePriceRangeChange = (value: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriods((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleTypeChange = (id: number) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    // Aggiorna lo store con i filtri selezionati
    filtersStore.setMinPrice(minPrice ? parseFloat(minPrice) : undefined);
    filtersStore.setMaxPrice(maxPrice ? parseFloat(maxPrice) : undefined);
    filtersStore.setSelectedPriceRanges(selectedPriceRanges);
    filtersStore.setHistoricalPeriods(selectedPeriods);
    filtersStore.setArtTypes(selectedTypes);

    // Chiama il callback se fornito
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  const handleReset = () => {
    // Resetta tutti gli stati locali
    setMinPrice("");
    setMaxPrice("");
    setSelectedPriceRanges([]);
    setSelectedPeriods([]);
    setSelectedTypes([]);

    // Resetta lo store
    filtersStore.resetFilters();

    // Chiama il callback se fornito
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  return (
    <section className={"flex flex-col mt-12 space-y-8 overflow-y-auto overflow-x-hidden h-full pb-24 relative w-full max-w-full"}>
      <AccordionElement title={"Costo"}>
        <div className="flex items-center justify-between gap-2 w-full">
          <input
            type="number"
            title="Min"
            name="min"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={"border border-[#CDCFD3] rounded-lg p-3 flex-1 min-w-0 text-sm"}
          />
          <input
            type="number"
            title="Max"
            name="max"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={"border border-[#CDCFD3] rounded-lg p-3 flex-1 min-w-0 text-sm"}
          />
        </div>
        <ul className={"mt-7 space-y-2"}>
          {priceRanges.map((range) => (
            <li key={range.id}>
              <label className={"flex items-center gap-2"}>
                <input
                  type="checkbox"
                  name={range.id}
                  id={range.id}
                  checked={selectedPriceRanges.includes(range.value)}
                  onChange={() => handlePriceRangeChange(range.value)}
                  className={"size-3.5"}
                />
                <span className={"text-sm"}>{range.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </AccordionElement>

      <AccordionElement title={"Periodo storico"}>
        <div className={"space-y-2"}>
          {historicalPeriods.map((period) => (
            <label key={period.id} className={"flex items-center gap-2"}>
              <input
                type="checkbox"
                name={period.id}
                id={period.id}
                checked={selectedPeriods.includes(period.value)}
                onChange={() => handlePeriodChange(period.value)}
                className={"size-3.5"}
              />
              <span className={"text-sm"}>{period.label}</span>
            </label>
          ))}
        </div>
      </AccordionElement>

      <AccordionElement title={"Tipo"}>
        {loadingCategories ? (
          <div className="flex justify-center py-4">
            <CircularProgress size={24} />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuna categoria disponibile</p>
        ) : (
          <div className={"space-y-2 max-h-60 overflow-y-auto"}>
            {categories.map((category) => (
              <label key={category.id} className={"flex items-center gap-2"}>
                <input
                  type="checkbox"
                  name={`cat-${category.id}`}
                  id={`cat-${category.id}`}
                  checked={selectedTypes.includes(category.id)}
                  onChange={() => handleTypeChange(category.id)}
                  className={"size-3.5"}
                />
                <span className={"text-sm"}>
                  {category.name} ({category.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </AccordionElement>

      <div className="flex flex-col gap-2">
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
        >
          Applica Filtri
        </Button>
        <Button
          variant="outlined"
          onClick={handleReset}
          fullWidth
        >
          Resetta Filtri
        </Button>
      </div>
    </section>
  );
};

export default FiltersPanel;