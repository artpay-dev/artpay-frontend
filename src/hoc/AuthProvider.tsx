import React, { createContext, useContext, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Box, Button, Dialog, DialogContent, Divider, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import Logo from "../components/icons/Logo";
import LinkButton from "../components/LinkButton.tsx";
import SignUpForm, { SignUpFormData } from "../components/SignUpForm.tsx";
import SignInForm, { SignInFormData } from "../components/SignInForm.tsx";
import AppleIcon from "../components/icons/AppleIcon.tsx";
import GoogleIcon from "../components/icons/GoogleIcon.tsx";
import FacebookIcon from "../components/icons/FacebookIcon.tsx";
import { User, UserInfo } from "../types/user.ts";
import { userToUserInfo } from "../utils.ts";

type RequestError = {
  message?: string;
};

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user?: UserInfo;
  wcToken?: string;
}

export interface AuthContext extends AuthState {
  getRole: () => string;
  logout: () => Promise<boolean>;
  login: () => void;
  getGuestAuth: () => string;
}

export interface AuthProviderProps extends React.PropsWithChildren {
  baseUrl?: string;
}

const userStorageKey = "artpay-user";

const GUEST_CONSUMER_KEY = "ck_349ace6a3d417517d0140e415779ed924c65f5e1";
const GUEST_CONSUMER_SECRET = "cs_b74f44b74eadd4718728c26a698fd73f9c5c9328";

const getGuestAuth = () => {
  const credentials = btoa(GUEST_CONSUMER_KEY + ":" + GUEST_CONSUMER_SECRET);
  return "Basic " + credentials;
};
const getWcCredentials = ({ consumer_key, consumer_secret }: { consumer_key: string; consumer_secret: string }) => {
  const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
  const authToken = "Basic " + wcCredentials;
  return authToken;
};

const Context = createContext<AuthContext>({
  isAuthenticated: false,
  isLoading: true,
  user: undefined,
  getRole: () => {
    throw "Auth not loaded";
  },
  logout: () => Promise.reject("Auth not loaded"),
  login: () => {},
  getGuestAuth: () => getGuestAuth(),
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, baseUrl = "" }) => {
  const userInfoUrl = `${baseUrl}/api/users/me`;
  const loginUrl = `${baseUrl}/wp-json/wp/v2/users/me`;
  const signUpUrl = `${baseUrl}/wp-json/wp/v2/users`;

  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [authValues, setAuthValues] = React.useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: undefined,
    wcToken: undefined,
  });

  const login = async ({ email, password }: SignInFormData) => {
    setIsLoading(true);
    try {
      const resp = await axios.get<SignInFormData, AxiosResponse<User>>(loginUrl, {
        auth: { username: email, password },
      });
      /*const userInfoResp = await axios.get<object, AxiosResponse<UserInfo>>(
        userInfoUrl,
        { headers: { Authorization: `Bearer ${resp.data.jwt}` } },
      );*/
      // TODO: save user to local storage
      // await storage.set('auth', JSON.stringify({jwt: resp.data.jwt, user: userInfoResp.data})) //TODO: local storage
      localStorage.setItem(userStorageKey, JSON.stringify(resp.data));
      console.log("userinfo", resp.data);
      setAuthValues({
        ...authValues,
        isAuthenticated: true,
        user: userToUserInfo(resp.data),
        wcToken: getWcCredentials(resp.data.wc_api_user_keys),
      });
      setLoginOpen(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ email, username, password }: SignUpFormData) => {
    setIsLoading(true);
    const credentials = btoa(GUEST_CONSUMER_KEY + ":" + GUEST_CONSUMER_SECRET);
    const basicAuth = "Basic " + credentials;
    try {
      const resp = await axios.post<SignUpFormData, AxiosResponse<User, RequestError>>(
        signUpUrl,
        { email, username, password },
        { headers: { Authorization: basicAuth } },
      );
      if (resp.status > 299) {
        setIsLoading(false);
        throw (resp.data as RequestError)?.message || "Si è verificato un errore";
      }
      localStorage.setItem(userStorageKey, JSON.stringify(resp.data));
      setAuthValues({
        ...authValues,
        isAuthenticated: true,
        user: userToUserInfo(resp.data),
        wcToken: getWcCredentials(resp.data.wc_api_user_keys),
      });
      setLoginOpen(false);
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
    localStorage.removeItem(userStorageKey);
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
    getGuestAuth: () => getGuestAuth(),
  };

  // Guest auth interceptor
  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => {
      const needsWcKey = config.url?.startsWith(`${baseUrl}/wp-json/wc/`);
      if (!config.headers.Authorization) {
        if (needsWcKey) {
          config.headers.Authorization = authValues.wcToken;
          //authValues.user
        } else {
          config.headers.Authorization = getGuestAuth();
        }
      }
      return config;
    });

    const userStr = localStorage.getItem(userStorageKey);
    if (userStr) {
      const userObj: User = JSON.parse(userStr);

      setAuthValues({
        user: userToUserInfo(userObj),
        isAuthenticated: true,
        isLoading: false,
        wcToken: getWcCredentials(userObj.wc_api_user_keys),
      });
    } else {
      setAuthValues({
        user: undefined,
        isAuthenticated: false,
        isLoading: false,
      });
    }

    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [authValues.wcToken, baseUrl, userInfoUrl]);

  return (
    <Context.Provider value={state}>
      {authValues.isLoading ? <></> : children}
      <Dialog onClose={() => setLoginOpen(false)} aria-labelledby="auth-dialog-title" maxWidth="sm" open={loginOpen}>
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
          <Typography variant="h6">Qui possiamo mettere payoff / claim di artpay</Typography>
          {isSignIn ? (
            <SignInForm disabled={isLoading} onSubmit={login} />
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
            <Button variant="outlined" endIcon={<FacebookIcon color="primary" />}>
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
