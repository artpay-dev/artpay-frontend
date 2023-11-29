import React, { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import SocialLinks from "./SocialLinks.tsx";
import Map from "./Map.tsx";

export interface GalleryContactsProps {
  address: string;
  email: string;
  phoneNumbers: string[];
  website: string;
}

const GalleryContacts: React.FC<GalleryContactsProps> = ({
  address,
  email,
  phoneNumbers,
  website,
}) => {
  return (
    <Grid sx={{ maxWidth: "900px" }} pb={8} container>
      <Grid xs={12} md={6} item>
        <Typography sx={{ mt: 2 }} variant="h3">
          {address}
        </Typography>
        <Typography sx={{ mt: 3 }} color="textSecondary" variant="subtitle1">
          {email}
        </Typography>
        {phoneNumbers.map((number, i) => (
          <Typography key={i} color="textSecondary" variant="subtitle1">
            {number}
          </Typography>
        ))}
        <Typography variant="subtitle1" color="textSecondary">
          <a href={website} color="textSecondary" target="_blank">
            {website}
          </a>
        </Typography>
        <SocialLinks
          mt={6}
          facebook={"1"}
          twitter={"1"}
          linkedin={"1"}
          whatsapp={"1"}
        />
      </Grid>
      <Grid xs={12} md={6} style={{ position: "relative" }} item>
        <Map address={address} />
      </Grid>
    </Grid>
  );
};

export default GalleryContacts;
