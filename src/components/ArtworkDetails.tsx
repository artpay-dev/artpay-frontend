import React from "react";
import { Artwork } from "../types/artwork.ts";
import { Box, Typography } from "@mui/material";
import DisplayProperty from "./DisplayProperty.tsx";
import { getPropertyFromMetadata } from "../utils.ts";

export interface ArtworkDetailsProps {
  artwork: Artwork;
}

const ArtworkDetails: React.FC<ArtworkDetailsProps> = ({ artwork }) => {
  const artworkDetails = {
    material: "", //getPropertyFromMetadata(artwork.meta_data, "tecnica"),
    measures: "",
    artworkClass: "",
    medium: "", //getPropertyFromMetadata(artwork.meta_data, "tipologia"),
    conditions: "",
    signature: "",
    certificate: "",
    frame: "",
  };
  return (
    <Box display="flex" flexDirection="column">
      <Box mb={3}>
        <Typography variant="h4">{artwork.name}</Typography>
        <Typography variant="h6" color="textSecondary">
          {getPropertyFromMetadata(artwork.meta_data, "artist")?.artist_name}, (anno)
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ my: 2 }}
          dangerouslySetInnerHTML={{ __html: artwork.short_description /*TODO: eliminare falla di sicurezza*/ }}
        />
      </Box>
      <Box
        display="flex"
        sx={{
          width: "100%",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "flex-start", sm: "center" },
          gap: { xs: 0, md: 12 },
        }}>
        <Box display="flex" flexDirection="column" gap={3} sx={{ width: "232px" }}>
          <DisplayProperty label="Materiali" value={artworkDetails.material} />
          <DisplayProperty label="Misure" value={artworkDetails.measures} />
          <DisplayProperty label="Classe" value={artworkDetails.artworkClass} />
          <DisplayProperty label="Medium" value={artworkDetails.medium} />
        </Box>
        <Box display="flex" flexDirection="column" gap={3} sx={{ width: "232px" }}>
          <DisplayProperty label="Condizioni" value={artworkDetails.conditions} />
          <DisplayProperty label="Firma" value={artworkDetails.measures} />
          <DisplayProperty label="Certificato di autenticità" value={artworkDetails.artworkClass} />
          <DisplayProperty label="Cornice" value={artworkDetails.frame} />
        </Box>
      </Box>
    </Box>
  );
};

export default ArtworkDetails;
