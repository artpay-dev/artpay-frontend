import axios, { AxiosResponse } from "axios";
import { Artwork } from "../../../types/artwork";
import { ArtmatchFilters } from "../store/filters-store";

const baseUrl = import.meta.env.VITE_SERVER_URL || "";

// Credenziali guest per accesso pubblico ai prodotti
const GUEST_CONSUMER_KEY = "ck_349ace6a3d417517d0140e415779ed924c65f5e1";
const GUEST_CONSUMER_SECRET = "cs_b74f44b74eadd4718728c26a698fd73f9c5c9328";

const getGuestAuth = () => {
  const credentials = btoa(GUEST_CONSUMER_KEY + ":" + GUEST_CONSUMER_SECRET);
  return "Basic " + credentials;
};

/**
 * Converte i filtri in parametri per l'API ArtMatch
 */
const buildQueryParams = (filters?: ArtmatchFilters, limit: number = 10, offset: number = 0) => {
  const params: Record<string, any> = {
    per_page: limit,
    offset: offset,
  };

  if (!filters) return params;

  // Filtra per prezzo min/max
  if (filters.price.min !== undefined) {
    params.min_price = filters.price.min;
  }
  if (filters.price.max !== undefined) {
    params.max_price = filters.price.max;
  }

  // Se ci sono range di prezzo selezionati, gestiscili
  if (filters.price.selectedRanges && filters.price.selectedRanges.length > 0) {
    // Per i range predefiniti, determina min/max complessivi
    const ranges = filters.price.selectedRanges;
    let minFromRanges: number | undefined;
    let maxFromRanges: number | undefined;

    ranges.forEach((range) => {
      if (range === "0-200") {
        minFromRanges = minFromRanges === undefined ? 0 : Math.min(minFromRanges, 0);
        maxFromRanges = maxFromRanges === undefined ? 200 : Math.max(maxFromRanges, 200);
      } else if (range === "200-500") {
        minFromRanges = minFromRanges === undefined ? 200 : Math.min(minFromRanges, 200);
        maxFromRanges = maxFromRanges === undefined ? 500 : Math.max(maxFromRanges, 500);
      } else if (range === "500-1000") {
        minFromRanges = minFromRanges === undefined ? 500 : Math.min(minFromRanges, 500);
        maxFromRanges = maxFromRanges === undefined ? 1000 : Math.max(maxFromRanges, 1000);
      } else if (range === "1000-5000") {
        minFromRanges = minFromRanges === undefined ? 1000 : Math.min(minFromRanges, 1000);
        maxFromRanges = maxFromRanges === undefined ? 5000 : Math.max(maxFromRanges, 5000);
      } else if (range === "5000+") {
        minFromRanges = minFromRanges === undefined ? 5000 : Math.min(minFromRanges, 5000);
        // Non impostiamo max per "5000+"
      }
    });

    // Combina con min/max personalizzati se presenti
    if (minFromRanges !== undefined && !params.min_price) {
      params.min_price = minFromRanges;
    }
    if (maxFromRanges !== undefined && !params.max_price && !ranges.includes("5000+")) {
      params.max_price = maxFromRanges;
    }
  }

  // Filtra per categorie (artTypes)
  if (filters.artTypes && filters.artTypes.length > 0) {
    params.categories = JSON.stringify(filters.artTypes);
  }

  // Filtra per periodi storici
  if (filters.historicalPeriods && filters.historicalPeriods.length > 0) {
    params.historical_periods = JSON.stringify(filters.historicalPeriods);
  }

  return params;
};

export const artmatchService = {
  /**
   * Recupera prodotti per il feed artmatch con filtri opzionali
   * @param limit - Numero di prodotti da recuperare (default: 10)
   * @param offset - Offset per la paginazione (default: 0)
   * @param filters - Filtri opzionali da applicare
   */
  async getProducts(limit: number = 100, offset: number = 0, filters?: ArtmatchFilters): Promise<Artwork[]> {
    try {
      const params = buildQueryParams(filters, limit, offset);

      const resp = await axios.get<unknown, AxiosResponse<{ success: boolean; products: Artwork[]; total: number }>>(
        `${baseUrl}/wp-json/artpay/v1/artmatch/products`,
        {
          params,
        }
      );

      return resp.data.products || [];
    } catch (error) {
      console.error("Errore nel recupero dei prodotti:", error);
      throw error;
    }
  },

  /**
   * Salva un like per un prodotto chiamando l'API esistente
   * @param productId - ID del prodotto che piace
   * @param authToken - Token di autenticazione dell'utente
   */
  async likeProduct(productId: number, authToken: string): Promise<number[]> {
    try {
      const resp = await axios.post<unknown, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/addUserFavoriteArtwork/${productId}`,
        {},
        {
          headers: {
            Authorization: authToken,
          },
        },
      );
      return resp.data;
    } catch (error) {
      console.error("Errore nel salvataggio del like:", error);
      throw error;
    }
  },

  /**
   * Salva un dislike per un prodotto
   * @param productId - ID del prodotto che non piace
   * @param authToken - Token di autenticazione dell'utente
   */
  async dislikeProduct(productId: number, authToken: string): Promise<number[]> {
    try {
      const resp = await axios.post<unknown, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/addUserDislikedArtwork/${productId}`,
        {},
        {
          headers: {
            Authorization: authToken,
          },
        },
      );
      return resp.data;
    } catch (error) {
      console.error("Errore nel salvataggio del dislike:", error);
      throw error;
    }
  },

  /**
   * Recupera le categorie prodotti WooCommerce
   */
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string; count: number }>> {
    try {
      const resp = await axios.get<
        unknown,
        AxiosResponse<Array<{ id: number; name: string; slug: string; count: number }>>
      >(`${baseUrl}/wp-json/wc/v3/products/categories`, {
        params: {
          per_page: 100,
        },
        headers: {
          Authorization: getGuestAuth(),
        },
      });
      return resp.data.filter((cat) => cat.count > 0);
    } catch (error) {
      console.error("Errore nel recupero delle categorie:", error);
      throw error;
    }
  },
};