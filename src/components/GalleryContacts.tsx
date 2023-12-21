import React from "react";
import { Grid, SxProps, Theme, Typography } from "@mui/material";
import SocialLinks, { SocialLinksProps } from "./SocialLinks.tsx";
import Map from "./Map.tsx";

export interface GalleryContactsProps {
  address: string;
  postcode: string;
  city: string;
  country: string;
  email: string;
  phoneNumbers: string[];
  website: string;
  social?: SocialLinksProps;
  sx?: SxProps<Theme>;
}

const GalleryContacts: React.FC<GalleryContactsProps> = ({
  address,
  email,
  phoneNumbers,
  website,
  city,
  postcode,
  country,
  social = {},
  sx = {},
}) => {
  return (
    <Grid sx={{ maxWidth: "900px", ...sx }} pb={8} container>
      <Grid xs={12} md={6} item>
        <Typography sx={{ mt: 2 }} variant="h3">
          {address}
        </Typography>
        <Typography sx={{ mt: 0 }} variant="h3">
          {postcode}, {city} - {country}
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
        <SocialLinks sx={{ mt: { xs: 3, md: 6 }, mb: { xs: 3, md: 0 } }} {...social} />
      </Grid>
      <Grid xs={12} md={6} style={{ position: "relative" }} item>
        <Map address={address} />
      </Grid>
    </Grid>
  );
};

export default GalleryContacts;
