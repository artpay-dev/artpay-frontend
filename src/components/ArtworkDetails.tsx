import React from "react";
import { Artwork } from "../types/artwork.ts";
import { Box, Typography } from "@mui/material";
import DisplayProperty from "./DisplayProperty.tsx";
import { getArtworkDimensions, getPropertyFromMetadata } from "../utils.ts";
import { useData } from "../hoc/DataProvider.tsx";
import { Artist } from "../types/artist.ts";

export interface ArtworkDetailsProps {
  artwork: Artwork;
  artist?: Artist;
}

const ArtworkDetails: React.FC<ArtworkDetailsProps> = ({ artwork, artist }) => {
  const data = useData();
  const artworkDetails = {
    material: data.getCategoryMapValues(artwork, "materiale").join(" "), //getPropertyFromMetadata(artwork.meta_data, "tecnica"),
    measures: getArtworkDimensions(artwork),
    style: data.getCategoryMapValues(artwork, "stile").join(" "),
    artworkClass: data.getCategoryMapValues(artwork, "tipologia").join(" "),
    technique: data.getCategoryMapValues(artwork, "tecnica").join(" "), //getPropertyFromMetadata(artwork.meta_data, "tipologia"),
    conditions: getPropertyFromMetadata(artwork?.meta_data || [], "condizioni")?.value || "-",
    creationYear: getPropertyFromMetadata(artwork?.meta_data || [], "anno_di_produzione")?.value || "-",
    signature: data.getCategoryMapValues(artwork, "firma").join(" "),
    certificate: data.getCategoryMapValues(artwork, "certificato").join(" "),
    frame: data.getCategoryMapValues(artwork, "cornice").join(" "),
    theme: data.getCategoryMapValues(artwork, "tema").join(" "),
    epoch: data.getCategoryMapValues(artwork, "periodo").join(" ")
  };
  return (
    <Box display="flex" flexDirection="column" sx={{ maxWidth: "612px" }}>
      <Box mb={2}>
        <Typography variant="subtitle1">{artwork.name}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {getPropertyFromMetadata(artwork.meta_data, "artist")?.artist_name}, {artist?.acf.birth_nation},{" "}
          {artist?.acf.birth_year}
        </Typography>
        <Typography
          variant="subtitle1"
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
          gap: { xs: 0, md: 12 }
        }}>
        <Box display="flex" flexDirection="column" gap={2} sx={{ width: "306px" }}>
          <DisplayProperty label="Materiale" value={artworkDetails.material} />
          <DisplayProperty label="Tecnica" value={artworkDetails.technique} />
          <DisplayProperty label="Misure" value={artworkDetails.measures} />
          <DisplayProperty label="Tipologia" value={artworkDetails.artworkClass} />
          <DisplayProperty label="Condizioni" value={artworkDetails.conditions} />
          <DisplayProperty label="Firma" value={artworkDetails.signature} />
        </Box>
        <Box display="flex" flexDirection="column" gap={2} sx={{ width: "306px", mt: { xs: 3, md: 0 } }}>
          <DisplayProperty label="Certificato di autenticità" value={artworkDetails.certificate} />
          <DisplayProperty label="Anno di creazione" value={artworkDetails.creationYear} />
          <DisplayProperty label="Stile" value={artworkDetails.style} />
          <DisplayProperty label="Cornice" value={artworkDetails.frame} />
          <DisplayProperty label="Tema" value={artworkDetails.theme} />
          <DisplayProperty label="Periodo" value={artworkDetails.epoch} />
        </Box>
      </Box>
    </Box>
  );
};

export default ArtworkDetails;
