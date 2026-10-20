import { useState, useEffect } from "react";
import { Alert, CircularProgress, Typography } from "@mui/material";
import FastPayLoginForm, { FastPayLoginFormData } from "./FastPayLoginForm";
import { login } from "../utils";

interface LoginComponentProps {
  ssoError?: string;
}

const LoginComponent = ({ ssoError }: LoginComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("vendor-login-success"));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  const handleLogin = async (data: FastPayLoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login(data);

      if (result?.isAuthenticated) {
        setLoginSuccess(true);
        return { error: undefined };
      } else {
        return { error: result.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  if (loginSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <CircularProgress />
        <Typography variant="h5" textAlign="center" color="primary">
          Login effettuato con successo!
        </Typography>
        <Typography variant="body2" textAlign="center" color="textSecondary">
          Caricamento...
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4" textAlign="center" gutterBottom>
        Accedi
      </Typography>
      <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 3 }}>
        Inserisci le tue credenziali per accedere
      </Typography>
      {ssoError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {ssoError}
        </Alert>
      )}
      <FastPayLoginForm onSubmit={handleLogin} disabled={isLoading} />
    </div>
  );
};

export default LoginComponent;