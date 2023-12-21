import React from "react";
import { Gallery } from "../types/gallery";
import { Box, Button, Typography } from "@mui/material";
import DisplayImage from "./DisplayImage.tsx";
import { galleryToGalleryContent } from "../utils.ts";
import { Add } from "@mui/icons-material";

export interface GalleryDetailsProps {
  gallery: Gallery;
}

const GalleryDetails: React.FC<GalleryDetailsProps> = ({ gallery }) => {
  const galleryContent = galleryToGalleryContent(gallery);
  return (
    <Box
      sx={{
        maxWidth: "900px",
        width: "100%",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "center" },
      }}
      display="flex">
      <DisplayImage src={galleryContent.coverImage} width={320} height={320} />
      <Box flexGrow={1} px={3}>
        <Box display="flex" flexDirection="row">
          <Box flexGrow={1}>
            <Typography variant="h6">{galleryContent.title}</Typography>
            <Typography variant="h6" color="textSecondary">
              {galleryContent.subtitle}
            </Typography>
          </Box>
          <Box>
            <Button variant="outlined" endIcon={<Add />}>
              Follow
            </Button>
          </Box>
        </Box>
        <Typography sx={{ mt: 3 }} variant="subtitle1">
          {galleryContent.description}
        </Typography>
      </Box>
    </Box>
  );
};

export default GalleryDetails;
