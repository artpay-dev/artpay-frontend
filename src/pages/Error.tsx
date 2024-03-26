import React, { ReactNode } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import TextField from "../components/TextField.tsx";
import SearchIcon from "../components/icons/SearchIcon.tsx";

export interface ErrorProps {
  errorCode?: number;
}

const Error: React.FC<ErrorProps> = () => {
  const urlParams = useParams();

  const errorText: { title: string | ReactNode, text: string | ReactNode, showSearch: boolean, showRetry: boolean } = {
    title: "",
    text: "",
    showSearch: false,
    showRetry: false
  };
  switch (urlParams.code) {
    case "404":
      errorText.title = <>Ooooops! Error 404!<br />Page not found!</>;
      errorText.text = <>Non hai trovato quello che cercavi!<br />Tenta una nuova ricerca!</>;
      errorText.showSearch = true;
      break;
    default:
      errorText.title = <>Ooooops! Error {urlParams.code || ""}!<br />Qualocosa non ha funzionato!</>;
      errorText.text = <>Forse la pagina non esiste più a questo indirizzo o</>;
  }

  return (<DefaultLayout minHeight="36vh" pb={3}>
    <Box sx={{
      maxWidth: "392px",
      display: "flex",
      flexDirection: "column",
      mt: { xs: 12, md: 24 },
      mx: { xs: 2, md: 10 }
    }}>
      <Typography color="primary" variant="h2">
        {errorText.title}
      </Typography>
      <Typography sx={{ mt: 3 }} variant="body1">
        {errorText.text}
      </Typography>
      {errorText.showSearch && <Box sx={{ mt: 5 }}>
        <TextField variant="filled" fullWidth InputProps={{
          endAdornment: <Button variant="contained">Cerca</Button>,
          startAdornment: <SearchIcon fontSize="small" />
        }} />
      </Box>}
      <Box sx={{ mt: 3 }} display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="contained" href="/">Torna alla home</Button>
        <Button variant="outlined" href="mailto:info@artpay.art">Segnala un errore</Button>
      </Box>
    </Box>

  </DefaultLayout>);
};

export default Error;
