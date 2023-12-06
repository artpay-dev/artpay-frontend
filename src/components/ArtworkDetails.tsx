import React from "react";
import { Artwork } from "../types/artwork.ts";
import { Box } from "@mui/material";
import DisplayProperty from "./DisplayProperty.tsx";
import { getPropertyFromMetadata } from "../utils.ts";

export interface ArtworkDetailsProps {
  artwork: Artwork;
}

const ArtworkDetails: React.FC<ArtworkDetailsProps> = ({ artwork }) => {
  const artworkDetails = {
    material: getPropertyFromMetadata(artwork.meta_data, "tecnica"),
    measures: "",
    artworkClass: "",
    medium: getPropertyFromMetadata(artwork.meta_data, "tipologia"),
    conditions: "",
    signature: "",
    certificate: "",
    frame: "",
  };
  return (
    <Box
      display="flex"
      sx={{
        width: "100%",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: { xs: "flex-start", sm: "center" },
        gap: { xs: 0, md: 12 },
      }}>
      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{ width: "232px" }}>
        <DisplayProperty label="Materiali" value={artworkDetails.material} />
        <DisplayProperty label="Misure" value={artworkDetails.measures} />
        <DisplayProperty label="Classe" value={artworkDetails.artworkClass} />
        <DisplayProperty label="Medium" value={artworkDetails.medium} />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{ width: "232px" }}>
        <DisplayProperty label="Condizioni" value={artworkDetails.conditions} />
        <DisplayProperty label="Firma" value={artworkDetails.measures} />
        <DisplayProperty
          label="Certificato di autenticità"
          value={artworkDetails.artworkClass}
        />
        <DisplayProperty label="Cornice" value={artworkDetails.frame} />
      </Box>
    </Box>
  );
};

export default ArtworkDetails;
