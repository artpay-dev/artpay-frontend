import React from "react";
import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import DisplayImage from "./DisplayImage.tsx";
import { artistToGalleryItem } from "../utils.ts";
import { Add } from "@mui/icons-material";
import { Artist } from "../types/artist.ts";
import sanitizeHtml from "sanitize-html";

export interface ArtistDetailsProps {
  artist: Artist;
}

//TODO: descrizione galleria

const ArtistDetails: React.FC<ArtistDetailsProps> = ({ artist }) => {
  const artistContent = artistToGalleryItem(artist);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        maxWidth: "900px",
        width: "100%",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2, md: 0 },
        alignItems: { xs: "center" },
      }}
      display="flex">
      <DisplayImage src={artistContent.imgUrl} width={320} height={isMobile ? "auto" : 320} />
      <Box flexGrow={1} px={3}>
        <Box display="flex" flexDirection="row">
          <Box flexGrow={1}>
            <Typography variant="h6">{artistContent.title}</Typography>
            <Typography variant="h6" color="textSecondary">
              {artistContent.subtitle}
            </Typography>
            <Typography sx={{ mt: 2 }} variant="subtitle1" color="textSecondary">
              {artistContent.artworksCount} {artistContent.artworksCount === 1 ? "Opera" : "Opere"}
            </Typography>
          </Box>
          <Box>
            <Button variant="outlined" endIcon={<Add />}>
              Follow
            </Button>
          </Box>
        </Box>
        <Typography
          sx={{ mt: 3 }}
          variant="subtitle1"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(artistContent.description || "") }}
        />
      </Box>
    </Box>
  );
};

export default ArtistDetails;
