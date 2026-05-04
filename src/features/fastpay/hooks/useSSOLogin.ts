import { useEffect, useState } from "react";
import axios from "axios";

interface SSOExchangeResponse {
  id: number;
  email: string;
  display_name: string;
  roles: string[];
  wc_api_user_keys?: {
    consumer_key: string;
    consumer_secret: string;
  };
}

interface SSOState {
  isProcessing: boolean;
  error?: string;
}

const VENDOR_ROLES = ["dc_vendor", "vendor", "wcfm_vendor"];

const hasSSOToken = () => !!new URLSearchParams(window.location.search).get("sso_token");

const cleanSSOTokenFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  params.delete("sso_token");
  const newSearch = params.toString();
  window.history.replaceState({}, "", window.location.pathname + (newSearch ? `?${newSearch}` : ""));
};

export const useSSOLogin = (): SSOState => {
  const [state, setState] = useState<SSOState>(() => ({
    isProcessing: hasSSOToken(),
  }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get("sso_token");

    if (!ssoToken) return;

    const baseUrl = import.meta.env.VITE_SERVER_URL || "";

    axios
      .post<SSOExchangeResponse>(`${baseUrl}/wp-json/artpay-sso/v1/exchange-token`, { token: ssoToken })
      .then((resp) => {
        const { id, email, display_name, roles, wc_api_user_keys } = resp.data;

        if (!roles.some((r) => VENDOR_ROLES.includes(r))) {
          cleanSSOTokenFromURL();
          setState({ isProcessing: false, error: "Accesso negato: solo i venditori possono accedere tramite SSO" });
          return;
        }

        localStorage.setItem(
          "vendor-user",
          JSON.stringify({ id, email, display_name, roles, ...(wc_api_user_keys?.consumer_key ? { wc_api_user_keys } : {}) }),
        );

        cleanSSOTokenFromURL();
        window.dispatchEvent(new Event("vendor-login-success"));
        setState({ isProcessing: false });
      })
      .catch((err) => {
        cleanSSOTokenFromURL();
        const message =
          err?.response?.status === 401
            ? "Link di accesso non valido o scaduto"
            : err?.response?.data?.message || "Errore durante l'accesso automatico";
        setState({ isProcessing: false, error: message });
      });
  }, []);

  return state;
};