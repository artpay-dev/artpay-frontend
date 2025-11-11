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
   * Salva un like per un prodotto
   * @param productId - ID del prodotto che piace
   */
  async likeProduct(productId: number): Promise<void> {
    // TODO: Implementare salvataggio like (localStorage o backend)
    console.log("Like prodotto:", productId);

    // Per ora salvo in localStorage
    const likes = JSON.parse(localStorage.getItem("artmatch-likes") || "[]");
    if (!likes.includes(productId)) {
      likes.push(productId);
      localStorage.setItem("artmatch-likes", JSON.stringify(likes));
    }
  },

  /**
   * Salva un dislike per un prodotto
   * @param productId - ID del prodotto che non piace
   */
  async dislikeProduct(productId: number): Promise<void> {
    // TODO: Implementare salvataggio dislike (localStorage o backend)
    console.log("Dislike prodotto:", productId);

    // Per ora salvo in localStorage
    const dislikes = JSON.parse(localStorage.getItem("artmatch-dislikes") || "[]");
    if (!dislikes.includes(productId)) {
      dislikes.push(productId);
      localStorage.setItem("artmatch-dislikes", JSON.stringify(dislikes));
    }
  },

  /**
   * Recupera la lista di prodotti piaciuti
   */
  async getLikedProducts(): Promise<number[]> {
    return JSON.parse(localStorage.getItem("artmatch-likes") || "[]");
  },

  /**
   * Recupera la lista di prodotti non piaciuti
   */
  async getDislikedProducts(): Promise<number[]> {
    return JSON.parse(localStorage.getItem("artmatch-dislikes") || "[]");
  },
};