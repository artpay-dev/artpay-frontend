import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { getDefaultPaddingX } from "../utils.ts";
import imgContacts from "../assets/images/image-contacts.svg";

export interface EmailContactBoxProps {
  title?: string;
}

const EmailContactBox: React.FC<EmailContactBoxProps> = ({ title = "Vuoi entrare in contatto con Artpay e il suo team?" }) => {

  const px = getDefaultPaddingX();

  return (<Box sx={{ position: "relative", pb: { xs: 0, sm: 12 } }} px={px} my={12}>
    <Typography variant="display3" sx={{ maxWidth: "612px" }}>{title} </Typography>
    <Typography sx={{ mt: 6, maxWidth: "294px" }} color="textSecondary" variant="subtitle1">
      Contattaci per qualsiasi domanda
      o richiesta! Puoi scriverci direttamente
      via e-mail.
    </Typography>
    <Button sx={{ mt: 3 }} href="mailto:hello@artpay.art" variant="outlined">Scrivi a hello@artpay.art</Button>
    <Box sx={{
      position: "absolute",
      bottom: "-64px",
      zIndex: -1,
      right: { xs: "-160px", md: "-80px", lg: 0 },
      display: { xs: "none", sm: "block" }
    }}>
      <img src={imgContacts} />
    </Box>
    {/*<Box sx={{ maxWidth: "506px", mt: 8 }}>
          <ContactForm />
        </Box>*/}
  </Box>);
};

export default EmailContactBox;
