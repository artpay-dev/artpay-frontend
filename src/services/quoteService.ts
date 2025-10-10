import axios, { AxiosResponse } from "axios";
import { Order } from "../types/order";

const baseUrl = import.meta.env.VITE_SERVER_URL || "";

export interface QuoteValidationParams {
  order_key: string;
  email: string;
}

export interface QuoteOrderResponse {
  success: boolean;
  message: string;
  order_id: number;
  order_key: string;
  new_status: string;
  order_data: {
    id: number;
    status: string;
    total: string;
    currency: string;
    date_created: string;
  };
}

export interface QuoteOrderDetailsResponse {
  success: boolean;
  order: Order;
}

export const quoteService = {
  /**
   * Recupera i dati di un ordine usando order_key ed email
   */
  async getQuoteOrder(orderId: number, orderKey: string, email: string): Promise<Order> {
    try {
      const resp = await axios.get<unknown, AxiosResponse<QuoteOrderDetailsResponse>>(
        `${baseUrl}/wp-json/wc-quote/v1/order`,
        {
          params: {
            order_key: orderKey,
            email: email,
          },
        }
      );
      return resp.data.order;
    } catch (error) {
      console.error("Errore nel recupero dell'ordine:", error);
      throw error;
    }
  },

  /**
   * Accetta il preventivo e converte l'ordine da 'quote' a 'pending'
   */
  async acceptQuote(params: QuoteValidationParams): Promise<QuoteOrderResponse> {
    try {
      const resp = await axios.post<QuoteValidationParams, AxiosResponse<QuoteOrderResponse>>(
        `${baseUrl}/wp-json/wc-quote/v1/convert-to-pending`,
        params
      );
      return resp.data;
    } catch (error) {
      console.error("Errore nell'accettazione del preventivo:", error);
      throw error;
    }
  },

  /**
   * Rifiuta il preventivo e converte l'ordine da 'quote' a 'cancelled'
   */
  async rejectQuote(params: QuoteValidationParams): Promise<QuoteOrderResponse> {
    try {
      const resp = await axios.post<QuoteValidationParams, AxiosResponse<QuoteOrderResponse>>(
        `${baseUrl}/wp-json/wc-quote/v1/reject-quote`,
        params
      );
      return resp.data;
    } catch (error) {
      console.error("Errore nel rifiuto del preventivo:", error);
      throw error;
    }
  },
};