import React, { createContext, useContext, useEffect, useState } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Logo from "../components/icons/Logo";
import LinkButton from "../components/LinkButton.tsx";
import SignUpForm, { SignUpFormData } from "../components/SignUpForm.tsx";
import SignInForm, { SignInFormData } from "../components/SignInForm.tsx";
import GoogleIcon from "../components/icons/GoogleIcon.tsx";
import { User, UserInfo } from "../types/user.ts";
import { userToUserInfo } from "../utils.ts";
import { useDialogs } from "./DialogProvider.tsx";
import { CodeResponse, useGoogleLogin } from "@react-oauth/google";
import ErrorIcon from "../components/icons/ErrorIcon.tsx";
//import FacebookLogin from "@greatsumini/react-facebook-login";
//import FacebookIcon from "../components/icons/FacebookIcon.tsx";
import { appleAuthHelpers } from "react-apple-signin-auth";
import AppleIcon from "../components/icons/AppleIcon.tsx";

type RequestError = {
  message?: string;
};

type PasswordResetParams = {
  email: string
  password: string
  code: string
}

type VerifyTokenData = {
  email: string;
  token: string;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user?: UserInfo;
  wcToken?: string;
}

export interface AuthContext extends AuthState {
  getRole: () => string;
  logout: () => Promise<boolean>;
  login: (showSignIn?: boolean) => void;
  sendPasswordResetLink: (email: string) => Promise<{ error?: unknown }>;
  resetPassword: (params: PasswordResetParams) => Promise<void>;
  getGuestAuth: () => string;
  getAuthToken: () => string | undefined;
}

export interface AuthProviderProps extends React.PropsWithChildren {
  baseUrl?: string;
}

const userStorageKey = "artpay-user";

const GUEST_CONSUMER_KEY = "ck_349ace6a3d417517d0140e415779ed924c65f5e1";
const GUEST_CONSUMER_SECRET = "cs_b74f44b74eadd4718728c26a698fd73f9c5c9328";

export const USER_LOGIN_EVENT = "user:login";
export const USER_LOGOUT_EVENT = "user:logout";

const dispatchUserEvent = (event: "user:login" | "user:logout", userId: number) =>
  document.dispatchEvent(
    new CustomEvent<{ userId: number }>(event, {
      detail: { userId }
    })
  );

const getGuestAuth = () => {
  const credentials = btoa(GUEST_CONSUMER_KEY + ":" + GUEST_CONSUMER_SECRET);
  return "Basic " + credentials;
};
const getWcCredentials = ({ consumer_key, consumer_secret }: { consumer_key: string; consumer_secret: string }) => {
  const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
  return "Basic " + wcCredentials;
};

const Context = createContext<AuthContext>({
  isAuthenticated: false,
  isLoading: true,
  user: undefined,
  getRole: () => {
    throw "Auth not loaded";
  },
  sendPasswordResetLink: () => Promise.reject("Auth not loaded"),
  resetPassword: () => Promise.reject("Auth not loaded"),
  logout: () => Promise.reject("Auth not loaded"),
  login: () => {
  },
  getGuestAuth: () => getGuestAuth(),
  getAuthToken: () => undefined
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, baseUrl = "" }) => {
  const userInfoUrl = `${baseUrl}/api/users/me`;
  const loginUrl = `${baseUrl}/wp-json/wp/v2/users/me`;
  const signUpUrl = `${baseUrl}/wp-json/wp/v2/users`;
  const sendPasswordResetLinkUrl = `${baseUrl}/wp-json/wp/v2/user/reset-password`;
  const passwordResetUrl = `${baseUrl}/wp-json/wp/v2/user/set-password`;
  const verifyGoogleTokenUrl = `${baseUrl}/wp-json/wp/v2/verifyGoogleToken`;
  const verifyAppleTokenUrl = `${baseUrl}/wp-json/wp/v2/verifyGoogleToken`;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dialogs = useDialogs();

  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const [authValues, setAuthValues] = React.useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: undefined,
    wcToken: undefined
  });

  const handleError = (err: unknown) => {
    if (axios.isAxiosError(err) && err.response) {
      setError(err.response?.data?.message || err.message || JSON.stringify(err));
    } else {
      setError("Si è verificato un errore");
    }
    setIsLoading(false);
  };

  const googleLogin = useGoogleLogin({
    // redirect_uri: "https://artpay.art/openidcallback/google",
    onSuccess: (codeResponse: CodeResponse) => {
      /*      const redirectTo = new URL(window.location.origin);
            redirectTo.searchParams.append("authCode", codeResponse.code);
            redirectTo.searchParams.append("redirectURI", window.location.origin);
            window.location.href = redirectTo.toString();
            return;*/
      axios.post<VerifyTokenData, AxiosResponse<User>>(verifyGoogleTokenUrl, {
        authCode: codeResponse.code,
        redirectURI: window.location.origin
      }).then((resp) => {
        localStorage.setItem(userStorageKey, JSON.stringify(resp.data));
        setAuthValues({
          ...authValues,
          isAuthenticated: true,
          user: userToUserInfo(resp.data),
          wcToken: getWcCredentials(resp.data.wc_api_user_keys)
        });
        setIsLoading(false);
        setLoginOpen(false);
      }).catch(handleError);
      /*axios.get<GoogleUserInfo>(`https://www.googleapis.com/oauth2/v3/userinfo`,
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }).then(resp => {
        console.log("userinfo", resp.data);

      }).catch(handleError);*/
    },
    onError: (errorResponse) => {
      setIsLoading(false);
      setError(errorResponse.error_description);
    },
    onNonOAuthError: (errorResponse) => {
      switch (errorResponse.type) {
        case "popup_closed":
          setError("Finestra di login chiusa");
          break;
        case "popup_failed_to_open":
          setError("Impossibile aprire la finestra di login");
          break;
        default:
          setError("Si è verificato un errore");
      }
      setIsLoading(false);
    },
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
  });

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(undefined);
    googleLogin();
  };

  const handleAppleLogin = async () => {
    // Service id AJ95CY4HRQ.art.artpay
    // Identifier art.artpay.login
    setIsLoading(true);
    setError(undefined);
    const response = await appleAuthHelpers.signIn({
      authOptions: {
        clientId: "art.artpay.login",
        redirectURI: "https://artpay.art",
        scope: "name email",
        usePopup: true

        // same as above
      },
      onError: (error: any) => {
        console.error(error);
        setError("Si è verificato un errore");
        setIsLoading(false);
      }
    });

    if (response) {
      const authResp = await axios.post<VerifyTokenData, AxiosResponse<User>>(verifyAppleTokenUrl, {
        token: response.authorization.id_token
      });
      console.log("apple auth resp", authResp.data);
      /*localStorage.setItem(userStorageKey, JSON.stringify(authResp.data));
      setAuthValues({
        ...authValues,
        isAuthenticated: true,
        user: userToUserInfo(authResp.data),
        wcToken: getWcCredentials(authResp.data.wc_api_user_keys)
      });*/
      setIsLoading(false);
      setLoginOpen(false);

    } else {
      setError("Si è verificato un errore");
      setIsLoading(false);
      console.error("Error performing apple signin.");
    }
  };

  const login = async ({ email, password }: SignInFormData) => {
    setError(undefined);
    setIsLoading(true);
    try {
      const resp = await axios.get<SignInFormData, AxiosResponse<User>>(loginUrl, {
        auth: { username: email, password }
      });
      // await storage.set('auth', JSON.stringify({jwt: resp.data.jwt, user: userInfoResp.data})) //TODO: local storage
      localStorage.setItem(userStorageKey, JSON.stringify(resp.data));
      setAuthValues({
        ...authValues,
        isAuthenticated: true,
        user: userToUserInfo(resp.data),
        wcToken: getWcCredentials(resp.data.wc_api_user_keys)
      });
      setLoginOpen(false);
      return {};
    } catch (err: unknown) {
      setAuthValues({ ...authValues, isAuthenticated: false, user: undefined });
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        return {
          error: err.message || JSON.stringify(data),
          status: err.response.status,
          message: err.message
        };
      } else {
        setAuthValues({ ...authValues, isAuthenticated: false, user: undefined });
      }
      //TODO: handle error
      return { error: err?.toString() };
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };
  const register = async ({ email, username, password }: SignUpFormData) => {
    setIsLoading(true);
    // const credentials = btoa(GUEST_CONSUMER_KEY + ":" + GUEST_CONSUMER_SECRET);
    // const basicAuth = "Basic " + credentials;
    try {
      const resp = await axios.post<SignUpFormData, AxiosResponse<User, RequestError>>(
        signUpUrl,
        { email, username, password }
        //{ headers: { Authorization: basicAuth } }
      );
      if (resp.status > 299) {
        const message = (resp.data as RequestError)?.message || "Si è verificato un errore";
        // noinspection ExceptionCaughtLocallyJS
        throw new AxiosError(message, resp.status?.toString() || "", undefined, resp);
      }
      setLoginOpen(false);
      await dialogs.okOnly("Registrazione effettuata", "A breve riceverai una email con un link per verificare il tuo account");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw err.response.data.message || "Si è verificato un errore";
      }
      throw "Si è verificato un errore";
    } finally {
      setIsLoading(false);
    }
  };
  const showLoginDialog = (showSignIn: boolean = false) => {
    if (showSignIn) {
      setIsSignIn(true);
    } else {
      setIsSignIn(false);
    }
    setLoginOpen(true);
  };
  const logout = async () => {
    // TODO: remove user from local storage
    // await storage.remove('auth')
    localStorage.removeItem(userStorageKey);
    resetAuthValues();
    return Promise.resolve(true);
  };
  const sendPasswordResetLink = async (email: string): Promise<{ error?: unknown }> => {
    try {
      await axios.post<SignInFormData, AxiosResponse<User>>(sendPasswordResetLinkUrl, { email: email });
      return {};
    } catch (e) {
      return { error: e?.toString ? e.toString() : "Si è verificato un errore" };
    }
  };
  const resetPassword = async ({ email, password, code }: PasswordResetParams): Promise<void> => {
    await axios.post<SignInFormData, AxiosResponse<User>>(passwordResetUrl, { email, password, code });
  };
  const getRole = () => {
    //TODO: get role
    return "";
  };

  const handleClose = () => {
    setError(undefined);
    setLoginOpen(false);
  };

  const resetAuthValues = () =>
    setAuthValues({
      user: undefined,
      isAuthenticated: false,
      isLoading: false
    });

  const state: AuthContext = {
    ...authValues,
    login: showLoginDialog,
    logout,
    getRole,
    sendPasswordResetLink,
    resetPassword,
    getGuestAuth: () => getGuestAuth(),
    getAuthToken: () => authValues.wcToken
  };

  // Guest auth interceptor
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailVerificationCode = urlParams.get("alg_wc_ev_verify_email");

    const interceptorId = axios.interceptors.request.use((config) => {
      const needsWcKey = config.url?.startsWith(`${baseUrl}/wp-json/wc/`); //
      //console.log("auth interceptor", needsWcKey, !!config.headers.Authorization, !!authValues.wcToken, config.url);
      if (!config.url?.startsWith(`${baseUrl}/wp-json/`)) {
        return config;
      }
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

    if (emailVerificationCode) {
      setAuthValues({
        user: undefined,
        isAuthenticated: false,
        isLoading: true
      });
      window.location.href = "/verifica-account";
    } else {
      const userStr = localStorage.getItem(userStorageKey);
      if (userStr) {
        const userObj: User = JSON.parse(userStr);

        setAuthValues({
          user: userToUserInfo(userObj),
          isAuthenticated: true,
          isLoading: false,
          wcToken: getWcCredentials(userObj.wc_api_user_keys)
        });
      } else {
        setAuthValues({
          user: undefined,
          isAuthenticated: false,
          isLoading: false
        });
      }
    }

    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [authValues.wcToken, baseUrl, userInfoUrl]);

  useEffect(() => {
    if (authValues.user && authValues.wcToken) {
      setTimeout(() => {
        dispatchUserEvent(USER_LOGIN_EVENT, authValues?.user?.id || 0);
      }, 200);
    } else {
      dispatchUserEvent(USER_LOGOUT_EVENT, 0);
    }
  }, [authValues.user, authValues.wcToken]);

  return (
    <Context.Provider value={state}>
      {(authValues.isLoading || isLoading) ? <></> : children}
      <Dialog fullScreen={isMobile} onClose={() => handleClose()} aria-labelledby="auth-dialog-title"
              maxWidth="sm"
              open={loginOpen}>
        <Box px={6} sx={{ pt: { xs: 3, md: 6 } }} alignItems="center" display="flex">
          <Logo />
          <Box flexGrow={1} />
          <IconButton
            aria-label="close"
            onClick={() => handleClose()}
            sx={{ color: (theme) => theme.palette.grey[500] }}>
            <Close />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 2, pb: { xs: 3, md: 6 } }}>
          {/*<Typography variant="h6">Qui possiamo mettere payoff / claim di artpay</Typography>*/}
          {isSignIn ? (
            <SignInForm disabled={isLoading} onSubmit={login} />
          ) : (
            <SignUpForm disabled={isLoading} onSubmit={register} />
          )}
          <Divider sx={{ maxWidth: "80%", marginLeft: "10%" }} />
          {error && <Alert variant="outlined" color="error" onClose={() => setError(undefined)}
                           icon={<ErrorIcon sx={{ transform: "translateY(-1px)" }} color="error" />}>{error}</Alert>}
          <Box display="flex" flexDirection="column" gap={1} py={2}>
            <Button variant="outlined" disabled={isLoading}
                    onClick={() => handleAppleLogin()}
                    endIcon={<AppleIcon color={isLoading ? "disabled" : "primary"} />}>
              Continua con Apple
            </Button>
            <Button variant="outlined" disabled={isLoading} onClick={() => handleGoogleLogin()}
                    endIcon={<GoogleIcon color={isLoading ? "disabled" : "primary"} />}>
              Continua con Google
            </Button>
            {/*<FacebookLogin
              appId="1088597931155576"
              useRedirect={true}
              onSuccess={(response) => {
                console.log("Login Success!", response);
              }}
              onFail={(error) => {
                console.log("Login Failed!", error);
              }}
              onProfileSuccess={(response) => {
                console.log("Get Profile Success!", response);
              }}
              render={({ onClick }) => (
                // @greatsumini/react-facebook-login
                <Button variant="outlined" disabled={isLoading}
                        onClick={onClick}
                        endIcon={<FacebookIcon color={isLoading ? "disabled" : "primary"} />}>
                  Continua con Facebook
                </Button>
              )}
            />*/}
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
