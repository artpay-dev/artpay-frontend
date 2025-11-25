import axios, { AxiosResponse } from "axios";
import { Artwork } from "../../../types/artwork";

const baseUrl = import.meta.env.VITE_SERVER_URL || "";

// Credenziali guest per accesso pubblico ai prodotti
const GUEST_CONSUMER_KEY = "ck_349ace6a3d417517d0140e415779ed924c65f5e1";
const GUEST_CONSUMER_SECRET = "cs_b74f44b74eadd4718728c26a698fd73f9c5c9328";

const getGuestAuth = () => {
  const credentials = btoa(GUEST_CONSUMER_KEY + ":" + GUEST_CONSUMER_SECRET);
  return "Basic " + credentials;
};

export const artmatchService = {
  /**
   * Recupera prodotti casuali per il feed artmatch
   * @param limit - Numero di prodotti da recuperare (default: 10)
   * @param offset - Offset per la paginazione (default: 0)
   */
  async getProducts(limit: number = 10, offset: number = 0): Promise<Artwork[]> {
    try {
      const resp = await axios.get<unknown, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products/`, {
        params: {
          per_page: limit,
          offset: offset,
          status: "publish",
        },
        headers: {
          Authorization: getGuestAuth(),
        },
      });

      return resp.data;
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
};