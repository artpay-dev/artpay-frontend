import React from "react";
import { getDefaultPaddingX } from "../utils.ts";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import imgContacts from "../assets/images/image-contacts.svg";


export interface ContactsProps {

}

const Contacts: React.FC<ContactsProps> = ({}) => {
  const navigate = useNavigate();

  const px = getDefaultPaddingX();

  return (<DefaultLayout>
    <Grid sx={{ mt: 18, px: px }} container>
      <Grid item xs={12} mb={3}>
        <Typography variant="h1">Contatti</Typography>
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <Typography sx={{ maxWidth: "294px" }} variant="body1">
          Qui troverai una serie di risposte alle domande più comuni su artpay, bla bla bla lorem ipsum dolor sit amet
          consectetur. Euismod metus pellentesque porta aliquam ipsum aliquam aliquam consectetur.
        </Typography>
        <Button sx={{ mt: 6 }} href="mailto:hello@artpay.art" variant="outlined">
          Scrivi a hello@artpay.art
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} lg={2} sx={{ display: { xs: "none", lg: "block" } }}>
      </Grid>
      <Grid item xs={12} sm={6} lg={3} pt={{ xs: 8, sm: 0 }}>
        <Typography sx={{ maxWidth: "294px" }} variant="body1">
          Qui troverai una serie di risposte alle domande più comuni su artpay, bla bla bla lorem ipsum dolor sit amet
          consectetur. Euismod metus pellentesque porta aliquam ipsum aliquam aliquam consectetur.
        </Typography>
        <Button sx={{ mt: 6 }} onClick={() => navigate("/faq")} variant="outlined">
          Vai alle FAQ
        </Button>
      </Grid>
      <Grid item display="flex" justifyContent="flex-end" pt={{ xs: 12, md: 0, zIndex: -1 }}
            sx={{ display: { xs: "none", sm: "flex" } }} xs={12}>
        <Box sx={{ transform: { xs: undefined, md: "translate(240px,-36px)", lg: "translate(120px,-84px)" } }}>
          <img src={imgContacts} />
        </Box>
      </Grid>
    </Grid>
  </DefaultLayout>);
};

export default Contacts;
