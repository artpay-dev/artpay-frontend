import React, { createContext, useContext, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Logo from "../components/icons/Logo";
import LinkButton from "../components/LinkButton.tsx";
import SignUpForm, { SignUpFormData } from "../components/SignUpForm.tsx";
import SignInForm from "../components/SignInForm.tsx";
import AppleIcon from "../components/icons/AppleIcon.tsx";
import GoogleIcon from "../components/icons/GoogleIcon.tsx";
import FacebookIcon from "../components/icons/FacebookIcon.tsx";

export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

type User = {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  url: string;
  description: string;
  link: string;
  locale: string;
  nickname: string;
  slug: string;
  roles: string[];
  registered_date: string;
  capabilities: {
    [key: string]: boolean;
    edit_shop_order: boolean;
    edit_shop_orders: boolean;
    edit_users: boolean;
    list_roles: boolean;
    list_users: boolean;
    publish_shop_orders: boolean;
    read: boolean;
    read_private_products: boolean;
    read_private_shop_coupons: boolean;
    read_product: boolean;
    read_shop_coupon: boolean;
    read_shop_order: boolean;
    customer: boolean;
  };
  extra_capabilities: {
    customer: boolean;
  };
  avatar_urls: {
    "24": string;
    "48": string;
    "96": string;
  };
  meta: {
    persisted_preferences: unknown[]; // You might want to replace 'any' with a more specific type
  };
  wc_api_user_keys: {
    consumer_key: string;
    consumer_secret: string;
  };
  acf: unknown[]; // You might want to replace 'any' with a more specific type
  is_super_admin: boolean;
  woocommerce_meta: {
    [key: string]: string;
    // Add more specific types if known
  };
  _links: {
    self: {
      href: string;
    }[];
    collection: {
      href: string;
    }[];
  };
};

type RequestError = {
  message?: string;
};

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user?: UserInfo;
}

export interface AuthContext extends AuthState {
  getRole: () => string;
  logout: () => Promise<boolean>;
  login: () => void;
}

export interface AuthProviderProps extends React.PropsWithChildren {
  baseUrl?: string;
}

interface LoginArgs {
  identifier: string;
  password: string;
}

interface LoginResponse {
  jwt: string;
  user: UserInfo;
}

const userStorageKey = "artpay-user";

const GUEST_CONSUMER_KEY = "ck_349ace6a3d417517d0140e415779ed924c65f5e1";
const GUEST_CONSUMER_SECRET = "cs_b74f44b74eadd4718728c26a698fd73f9c5c9328";

const Context = createContext<AuthContext>({
  isAuthenticated: false,
  isLoading: true,
  user: undefined,
  getRole: () => {
    throw "Auth not loaded";
  },
  logout: () => Promise.reject("Auth not loaded"),
  login: () => {},
});

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  baseUrl = "",
}) => {
  const userInfoUrl = `${baseUrl}/api/users/me`;
  const loginUrl = `${baseUrl}/api/auth/local`;
  const signUpUrl = `${baseUrl}/wp-json/wp/v2/users`;
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [authValues, setAuthValues] = React.useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: undefined,
  });

  const login = async ({ identifier, password }: LoginArgs) => {
    try {
      const resp = await axios.post<LoginArgs, AxiosResponse<LoginResponse>>(
        loginUrl,
        { identifier, password },
      );
      const userInfoResp = await axios.get<object, AxiosResponse<UserInfo>>(
        userInfoUrl,
        { headers: { Authorization: `Bearer ${resp.data.jwt}` } },
      );
      // TODO: save user to local storage
      // await storage.set('auth', JSON.stringify({jwt: resp.data.jwt, user: userInfoResp.data})) //TODO: local storage
      setAuthValues({
        ...authValues,
        isAuthenticated: true,
        user: userInfoResp.data,
      });
      return {};
    } catch (err: unknown) {
      setAuthValues({ ...authValues, isAuthenticated: false, user: undefined });
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        return {
          error: data,
          status: err.response.status,
          message: err.message,
        };
      }
      //TODO: handle error
      return { error: err?.toString() };
    }
  };

  const register = async ({ email, username, password }: SignUpFormData) => {
    setIsLoading(true);
    const credentials = btoa(GUEST_CONSUMER_KEY + ":" + GUEST_CONSUMER_SECRET);
    const basicAuth = "Basic " + credentials;
    console.log("set auth", basicAuth);
    try {
      const resp = await axios.post<
        SignUpFormData,
        AxiosResponse<User, RequestError>
      >(
        signUpUrl,
        { email, username, password },
        { headers: { Authorization: basicAuth } },
      );
      if (resp.status > 299) {
        setIsLoading(false);
        throw (
          (resp.data as RequestError)?.message || "Si è verificato un errore"
        );
      }
      localStorage.setItem(userStorageKey, JSON.stringify(resp.data));
    } finally {
      setIsLoading(false);
    }
  };
  const showLoginDialog = () => {
    setLoginOpen(true);
  };
  const logout = async () => {
    // TODO: remove user from local storage
    // await storage.remove('auth')
    resetAuthValues();
    return Promise.resolve(true);
  };

  const getRole = () => {
    //TODO: get role
    return "";
  };

  const resetAuthValues = () =>
    setAuthValues({
      user: undefined,
      isAuthenticated: false,
      isLoading: false,
    });

  const state = {
    ...authValues,
    login: showLoginDialog,
    logout,
    getRole,
  };

  useEffect(() => {
    //TODO: check authentication
    /*axios.get<UserInfo>(userInfoUrl).then(resp => {
          setAuthValues({user: resp.data, isAuthenticated: true, isLoading: false})
        })*/
    const userStr = localStorage.getItem(userStorageKey);
    if (userStr) {
      const userObj: User = JSON.parse(userStr);
      setAuthValues({
        user: userObj,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthValues({
        user: undefined,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [userInfoUrl]);

  return (
    <Context.Provider value={state}>
      {authValues.isLoading ? <></> : children}
      <Dialog
        onClose={() => setLoginOpen(false)}
        aria-labelledby="auth-dialog-title"
        maxWidth="sm"
        open={loginOpen}>
        <Box px={6} pt={6} alignItems="center" display="flex">
          <Logo />
          <Box flexGrow={1} />
          <IconButton
            aria-label="close"
            onClick={() => setLoginOpen(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}>
            <Close />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 2, pb: 6 }}>
          <Typography variant="h6">
            Qui possiamo mettere payoff / claim di artpay
          </Typography>
          {isSignIn ? (
            <SignInForm disabled={isLoading} />
          ) : (
            <SignUpForm disabled={isLoading} onSubmit={register} />
          )}
          <Divider sx={{ maxWidth: "80%", marginLeft: "10%" }} />
          <Box display="flex" flexDirection="column" gap={1} py={2}>
            <Button variant="outlined" endIcon={<AppleIcon color="primary" />}>
              Continua con Apple
            </Button>
            <Button variant="outlined" endIcon={<GoogleIcon color="primary" />}>
              Continua con Google
            </Button>
            <Button
              variant="outlined"
              endIcon={<FacebookIcon color="primary" />}>
              Continua con Facebook
            </Button>
          </Box>
          <Box display="flex" mt={1} gap={1} alignItems="center">
            <Typography variant="body2" color="textSecondary">
              {isSignIn ? "Non hai ancora un account?" : "Sei già registratə?"}
            </Typography>
            <LinkButton size="small" onClick={() => setIsSignIn(!isSignIn)}>
              {isSignIn ? "Registrati" : "Accedi"}
            </LinkButton>
          </Box>
        </DialogContent>
      </Dialog>
    </Context.Provider>
  );
};

export const useAuth = () => useContext(Context);

export default AuthProvider;
