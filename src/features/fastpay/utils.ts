import axios, { AxiosResponse } from "axios";
import { User } from "../../types/user.ts";
import { userToUserInfo } from "../../utils.ts";

export const getWcCredentials = ({ consumer_key, consumer_secret }: { consumer_key: string; consumer_secret: string }) => {
  const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
  return "Basic " + wcCredentials;
};

export const login = async ({ username, password }: { username: string; password: string }) => {
  try {
    const baseUrl = import.meta.env.VITE_SERVER_URL || "";
    const loginUrl = `${baseUrl}/wp-json/wp/v2/users/me`;

    const resp = await axios.get<any, AxiosResponse<User>>(loginUrl, {
      auth: { username, password },
    });

    // Verify vendor role via WooCommerce API
    const wcAuth = getWcCredentials(resp.data.wc_api_user_keys);
    const customerUrl = `${baseUrl}/wp-json/wc/v3/customers/${resp.data.id}`;
    const customerResp = await axios.get(customerUrl, {
      headers: { Authorization: wcAuth },
    });

    const isVendor = customerResp.data.role === 'dc_vendor' ||
                    customerResp.data.role === 'vendor' ||
                    customerResp.data.role === 'wcfm_vendor';

    if (!isVendor) {
      return {
        isAuthenticated: false,
        error: new Error('Accesso negato: solo i venditori possono accedere')
      };
    }

    localStorage.setItem("vendor-user", JSON.stringify({ ...resp.data, username }));
    const userInfo = await userToUserInfo(resp.data);

    return {
      isAuthenticated: true,
      user: {
        ...userInfo,
        username: username
      },
      wcToken: getWcCredentials(resp.data.wc_api_user_keys),
    };
  } catch (err: any) {
    if (err?.response?.status === 401) {
      return {
        isAuthenticated: false,
        error: new Error('Nome utente o password errati')
      };
    }

    return {
      isAuthenticated: false,
      error: err
    };
  }
};