import React from "react";
import { Artwork } from "../types/artwork.ts";
import { Box, Typography } from "@mui/material";
import DisplayProperty from "./DisplayProperty.tsx";
import { getPropertyFromMetadata } from "../utils.ts";
import { useData } from "../hoc/DataProvider.tsx";

export interface ArtworkDetailsProps {
  artwork: Artwork;
}

const ArtworkDetails: React.FC<ArtworkDetailsProps> = ({ artwork }) => {
  const data = useData();
  const artworkDetails = {
    material: data.getCategoryMapValues(artwork, "materiale").join(" "), //getPropertyFromMetadata(artwork.meta_data, "tecnica"),
    measures: "",
    style: data.getCategoryMapValues(artwork, "stile").join(" "),
    artworkClass: data.getCategoryMapValues(artwork, "tipologia").join(" "),
    technique: data.getCategoryMapValues(artwork, "tecnica").join(" "), //getPropertyFromMetadata(artwork.meta_data, "tipologia"),
    conditions: "",
    signature: "",
    certificate: "",
    frame: "",
    theme: "",
    epoch: data.getCategoryMapValues(artwork, "periodo").join(" "),
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
          <DisplayProperty label="Materiale" value={artworkDetails.material} />
          <DisplayProperty label="Tecnica" value={artworkDetails.technique} />
          <DisplayProperty label="Misure" value={artworkDetails.measures} />
          <DisplayProperty label="Tipologia" value={artworkDetails.artworkClass} />
          <DisplayProperty label="Condizioni" value={artworkDetails.conditions} />
          <DisplayProperty label="Firma" value={artworkDetails.signature} />
        </Box>
        <Box display="flex" flexDirection="column" gap={3} sx={{ width: "232px" }}>
          <DisplayProperty label="Certificato di autenticità" value={artworkDetails.certificate} />
          <DisplayProperty label="Anno di creazione" value={""} />
          <DisplayProperty label="Stile" value={artworkDetails.style} />
          <DisplayProperty label="Cornice" value={artworkDetails.frame} />
          <DisplayProperty label="Tema" value={artworkDetails.frame} />
          <DisplayProperty label="Periodo" value={artworkDetails.frame} />
        </Box>
      </Box>
    </Box>
  );
};

export default ArtworkDetails;
