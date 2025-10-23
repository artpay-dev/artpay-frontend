import axios, { AxiosResponse } from "axios";
import { Order } from "../types/order";
import { Artwork } from "../types/artwork";

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
  async getQuoteOrder(orderKey: string, email: string): Promise<Order> {
    try {
      const resp = await axios.get<unknown, AxiosResponse<QuoteOrderDetailsResponse>>(
        `${baseUrl}/wp-json/wc-quote/v1/order`,
        {
          params: {
            order_key: orderKey,
            email: email,
          },
        },
      );
      return resp.data.order;
    } catch (error) {
      console.error("Errore nel recupero dell'ordine:", error);
      throw error;
    }
  },

  /**
   * Recupera tutti gli ordini del vendor con status "quote"
   */
  async getVendorQuotes(vendorId: number): Promise<Order[]> {
    try {
      // Recupera il token WooCommerce dal vendor-user
      const vendorUserStr = localStorage.getItem("vendor-user");
      if (!vendorUserStr) {
        throw new Error("Vendor non autenticato");
      }

      const vendorUser = JSON.parse(vendorUserStr);
      const { consumer_key, consumer_secret } = vendorUser.wc_api_user_keys;
      const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
      const wcToken = "Basic " + wcCredentials;

      const resp = await axios.get<unknown, AxiosResponse<Order[]>>(`${baseUrl}//wp-json/wc/v2/orders/?`, {
        params: {
          vendor: vendorId,
          status: "quote",
          parent: 0,
        },
        headers: {
          Authorization: wcToken,
        },
      });

      return resp.data;
    } catch (error) {
      console.error("Errore nel recupero degli ordini del vendor:", error);
      throw error;
    }
  },

  /**
   * Accetta il preventivo e converte l'ordine da 'quote' a 'pending'
   */
  async acceptQuote(params: QuoteValidationParams): Promise<QuoteOrderResponse> {
    try {
      const resp = await axios.post<QuoteValidationParams, AxiosResponse<QuoteOrderResponse>>(
        `${baseUrl}/wp-json/wc-quote/v1/convert-to-on-hold`,
        params,
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
        params,
      );
      return resp.data;
    } catch (error) {
      console.error("Errore nel rifiuto del preventivo:", error);
      throw error;
    }
  },

  /**
   * Recupera tutti i prodotti (opere) del vendor
   */
  async getVendorProducts(vendorId: number): Promise<Artwork[]> {
    try {
      // Recupera il token WooCommerce dal vendor-user
      const vendorUserStr = localStorage.getItem("vendor-user");
      if (!vendorUserStr) {
        throw new Error("Vendor non autenticato");
      }

      const vendorUser = JSON.parse(vendorUserStr);
      const { consumer_key, consumer_secret } = vendorUser.wc_api_user_keys;
      const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
      const wcToken = "Basic " + wcCredentials;

      const resp = await axios.get<unknown, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v2/products/`, {
        params: {
          vendor: `[${vendorId}]`,
          per_page: 100,
        },
        headers: {
          Authorization: wcToken,
        },
      });

      return resp.data;
    } catch (error) {
      console.error("Errore nel recupero dei prodotti del vendor:", error);
      throw error;
    }
  },

  /**
   * Crea un nuovo coupon su WooCommerce
   */
  async createCoupon(couponData: {
    code: string;
    discount_type: string;
    amount: string;
    individual_use?: boolean;
    usage_limit?: number;
  }): Promise<any> {
    try {
      // Recupera il token WooCommerce dal vendor-user
      const vendorUserStr = localStorage.getItem("vendor-user");
      if (!vendorUserStr) {
        throw new Error("Vendor non autenticato");
      }

      const vendorUser = JSON.parse(vendorUserStr);
      const { consumer_key, consumer_secret } = vendorUser.wc_api_user_keys;
      const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
      const wcToken = "Basic " + wcCredentials;

      // Aggiungi campi di default che WooCommerce si aspetta
      const completeCouponData = {
        ...couponData,
        individual_use: couponData.individual_use ?? true,
        usage_limit: couponData.usage_limit ?? 1,
        usage_limit_per_user: 1,
        limit_usage_to_x_items: null,
        free_shipping: false,
        exclude_sale_items: false,
        minimum_amount: "0",
        maximum_amount: "0",
        email_restrictions: [],
        product_ids: [],
        excluded_product_ids: [],
        product_categories: [],
        excluded_product_categories: [],
        meta_data: [],
        // Importante: il coupon non deve essere legato a un vendor specifico
        vendor: 0,
      };

      const resp = await axios.post<any, AxiosResponse<any>>(`${baseUrl}/wp-json/wc/v3/coupons`, completeCouponData, {
        headers: {
          Authorization: wcToken,
          "Content-Type": "application/json",
        },
      });

      return resp.data;
    } catch (error) {
      console.error("Errore nella creazione del coupon:", error);
      throw error;
    }
  },

  /**
   * Crea un nuovo ordine quote
   */
  async createQuoteOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      // Recupera il token WooCommerce dal vendor-user
      const vendorUserStr = localStorage.getItem("vendor-user");
      if (!vendorUserStr) {
        throw new Error("Vendor non autenticato");
      }

      const vendorUser = JSON.parse(vendorUserStr);
      const { consumer_key, consumer_secret } = vendorUser.wc_api_user_keys;
      const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
      const wcToken = "Basic " + wcCredentials;

      const resp = await axios.post<Partial<Order>, AxiosResponse<Order>>(
        `${baseUrl}/wp-json/wc/v3/orders`,
        orderData,
        {
          headers: {
            Authorization: wcToken,
            "Content-Type": "application/json",
          },
        },
      );

      return resp.data;
    } catch (error) {
      console.error("Errore nella creazione dell'ordine:", error);
      throw error;
    }
  },

  /**
   * Aggiorna l'email del cliente per un ordine esistente
   * Questo trigger farà partire l'email dal backend
   */
  async updateOrderEmail(orderId: number, email: string, firstName?: string, lastName?: string): Promise<Order> {
    try {
      // Recupera il token WooCommerce dal vendor-user
      const vendorUserStr = localStorage.getItem("vendor-user");
      if (!vendorUserStr) {
        throw new Error("Vendor non autenticato");
      }

      const vendorUser = JSON.parse(vendorUserStr);
      const { consumer_key, consumer_secret } = vendorUser.wc_api_user_keys;
      const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
      const wcToken = "Basic " + wcCredentials;

      const resp = await axios.post<any, AxiosResponse<Order>>(
        `${baseUrl}/wp-json/wc-quote/v1/update-customer-email`,
        {
          order_id: orderId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          send_email: true,
        },
        {
          headers: {
            Authorization: wcToken,
            "Content-Type": "application/json",
          },
        },
      );

      return resp.data;
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'email:", error);
      throw error;
    }
  },

  /**
   * Elimina un'offerta (cancella l'ordine)
   */
  async deleteQuote(orderId: number): Promise<Order> {
    try {
      // Recupera il token WooCommerce dal vendor-user
      const vendorUserStr = localStorage.getItem("vendor-user");
      if (!vendorUserStr) {
        throw new Error("Vendor non autenticato");
      }

      const vendorUser = JSON.parse(vendorUserStr);
      const { consumer_key, consumer_secret } = vendorUser.wc_api_user_keys;
      const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
      const wcToken = "Basic " + wcCredentials;

      const resp = await axios.delete<any, AxiosResponse<Order>>(`${baseUrl}/wp-json/wc/v3/orders/${orderId}`, {
        headers: {
          Authorization: wcToken,
        },
      });

      return resp.data;
    } catch (error) {
      console.error("Errore nell'eliminazione dell'offerta:", error);
      throw error;
    }
  },

  /**
   * Completa il pagamento e aggiorna l'ordine WooCommerce
   */
  async completePayment(orderKey: string, paymentIntentId: string): Promise<any> {
    try {
      const resp = await axios.post<any, AxiosResponse<any>>(
        `${baseUrl}/wp-json/wc-quote/v1/complete-payment`,
        {
          order_key: orderKey,
          payment_intent_id: paymentIntentId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return resp.data;
    } catch (error) {
      console.error("Errore nel completamento del pagamento:", error);
      throw error;
    }
  },

  /**
   * Recuper la GAlleria da MultivendorX
   */
  async getVendor(vendorId: string,): Promise<any> {
    const GUEST_CONSUMER_KEY = "ck_349ace6a3d417517d0140e415779ed924c65f5e1";
    const GUEST_CONSUMER_SECRET = "cs_b74f44b74eadd4718728c26a698fd73f9c5c9328";

    const getGuestAuth = () => {
      const credentials = btoa(GUEST_CONSUMER_KEY + ":" + GUEST_CONSUMER_SECRET);
      return "Basic " + credentials;
    };

    try {
      const resp = await axios.get<any, AxiosResponse<any>>(
        `${baseUrl}/wp-json/mvx/v1/vendors/${vendorId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: getGuestAuth(),
          },
        },
      );

      return resp.data;
    } catch (error) {
      console.error("Errore nel recupero della Galleria:", error);
      throw error;
    }
  },
};
