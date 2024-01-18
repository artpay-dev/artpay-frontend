import React, { useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import TextField from "./TextField.tsx";
import Checkbox from "./Checkbox.tsx";

export interface NewsletterBigProps {}

const NewsletterBig: React.FC<NewsletterBigProps> = ({}) => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      flexDirection="column"
      py={12}
      px={5}
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: "#1B2738", color: theme.palette.contrast.main }}>
      <Typography variant="h3" color="white">
        Hai concluso! Scopri cosa abbiamo selezionato per te
      </Typography>
      <Typography variant="h6" color="white">
        Lasciaci un indirizzo email e ti invieremo una selezione di opere presenti su artpay
      </Typography>
      <Box sx={{ maxWidth: "667px", width: "100%" }} my={6}>
        <TextField
          placeholder="email"
          size="medium"
          variant="outlined"
          sx={{
            color: "black",
            input: { background: "white", borderRadius: "24px" },
            mb: 2,
          }}
          fullWidth
        />
        <Checkbox label="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." />
      </Box>
      <Button color="contrast" size="large" sx={{ color: theme.palette.primary.main }} variant="contained">
        Prosegui
      </Button>
    </Box>
  );
};

export default NewsletterBig;
