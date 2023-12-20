import React from "react";
import { Box, Typography } from "@mui/material";
import GalleryContacts, { GalleryContactsProps } from "./GalleryContacts.tsx";

export interface GalleryInfoProps {
  title?: string;
  description: string[] | string;
  imageUrl?: string;
  contacts?: GalleryContactsProps;
}

const GalleryInfo: React.FC<GalleryInfoProps> = ({ title, description, imageUrl, contacts }) => {
  return (
    <Box sx={{ maxWidth: "900px" }}>
      {title && (
        <Typography variant="h3" sx={{ mb: 3 }}>
          {title}
        </Typography>
      )}
      {Array.isArray(description) ? (
        description.map((text, i) => (
          <Typography key={i} sx={{ mb: 3 }} variant="body1" color="textSecondary">
            {text}
          </Typography>
        ))
      ) : (
        <Typography sx={{ mb: 3 }} variant="body1" color="textSecondary">
          {description}
        </Typography>
      )}
      {imageUrl && <img style={{ width: "100%" }} src={imageUrl} />}
      {contacts && <GalleryContacts {...contacts} sx={{ pt: 2 }} />}
    </Box>
  );
};

export default GalleryInfo;
