import React from "react";
import { Grid, Typography } from "@mui/material";
import GalleryContacts, { GalleryContactsProps } from "./GalleryContacts.tsx";

export interface GalleryInfoProps {
  title?: string;
  description: string[] | string;
  imageUrl?: string;
  contacts?: GalleryContactsProps;
}

const GalleryInfo: React.FC<GalleryInfoProps> = ({ description, contacts }) => {

  return <Grid container>
    <Grid xs={12} md={6} display="flex" flexDirection="column" alignItems="center" paddingInline={4} item>
      <Typography variant="body1" color="textSecondary"
                  sx={{ mb: 1, maxWidth: { xs: undefined, md: "400px" }, width: "100%" }}>
        About
      </Typography>
      {Array.isArray(description) ? (
        description.map((text, i) => (
          <Typography key={i} sx={{ mb: 1, maxWidth: { xs: undefined, md: "400px" } }} variant="body1">
            {text}
          </Typography>
        ))
      ) : (
        <Typography sx={{ mb: 1 }} variant="body1">
          {description}
        </Typography>
      )}
    </Grid>
    <Grid xs={12} md={6} mt={{ xs: 3, md: 0 }} sx={{px:4}} display="flex" flexDirection="column" alignItems="center" item>
      <Typography variant="body1" color="textSecondary"
                  sx={{ mb: 1, maxWidth: { xs: undefined, md: "400px" }, width: "100%" }}>
        Indirizzo
      </Typography>
      {contacts && <GalleryContacts {...contacts} sx={{ pt: 0 }} />}
    </Grid>
  </Grid>;
};

export default GalleryInfo;
