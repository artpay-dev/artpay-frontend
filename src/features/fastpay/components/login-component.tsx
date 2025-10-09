import { useState, useEffect } from "react";
import { Box, Card, Container, Typography, CircularProgress } from "@mui/material";
import FastPayLoginForm, { FastPayLoginFormData } from "./FastPayLoginForm";
import { login } from "../utils";

const LoginComponent = () => {
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
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress />
            <Typography variant="h5" textAlign="center" color="primary">
              Login effettuato con successo!
            </Typography>
            <Typography variant="body2" textAlign="center" color="textSecondary">
              Caricamento...
            </Typography>
          </Box>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 4 }}>
        <Box>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Accedi
          </Typography>
          <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 3 }}>
            Inserisci le tue credenziali per accedere
          </Typography>
          <FastPayLoginForm onSubmit={handleLogin} disabled={isLoading} />
        </Box>
      </Card>
    </Container>
  );
};

export default LoginComponent;