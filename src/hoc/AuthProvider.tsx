import React, { createContext, useContext, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user?: UserInfo;
}

export interface AuthContext extends AuthState {
  getRole: () => string;
  logout: () => Promise<boolean>;
  login: (args: LoginArgs) => Promise<{ error?: string }>;
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

const Context = createContext<AuthContext>({
  isAuthenticated: false,
  isLoading: true,
  user: undefined,
  getRole: () => {
    throw "Auth not loaded";
  },
  logout: () => Promise.reject("Auth not loaded"),
  login: () => Promise.reject("Auth not loaded"),
});

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  baseUrl = "",
}) => {
  const userInfoUrl = `${baseUrl}/api/users/me`;
  const loginUrl = `${baseUrl}/api/auth/local`;

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
    login,
    logout,
    getRole,
  };

  useEffect(() => {
    //TODO: check authentication
    /*axios.get<UserInfo>(userInfoUrl).then(resp => {
      setAuthValues({user: resp.data, isAuthenticated: true, isLoading: false})
    })*/
    setAuthValues({
      user: undefined,
      isAuthenticated: false,
      isLoading: false,
    });
  }, [userInfoUrl]);

  return (
    <Context.Provider value={state}>
      {authValues.isLoading ? <></> : children}
    </Context.Provider>
  );
};

export const useAuth = () => useContext(Context);

export default AuthProvider;
