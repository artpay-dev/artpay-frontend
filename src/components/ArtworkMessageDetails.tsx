import React from "react";
import { Artwork } from "../types/artwork.ts";
import { Box, Typography } from "@mui/material";
import { getArtworkDimensions, getPropertyFromMetadata, useNavigate } from "../utils.ts";
import { useData } from "../hoc/DataProvider.tsx";
import CertificateIcon from "./icons/CertificateIcon.tsx";
import ArtworkIcon from "./icons/ArtworkIcon.tsx";
import ShippingIcon from "./icons/ShippingIcon.tsx";
import ShopIcon from "./icons/ShopIcon.tsx";

export interface ArtworkMessageDetailsProps {
  artwork?: Artwork;
}

const ArtworkMessageDetails: React.FC<ArtworkMessageDetailsProps> = ({ artwork }) => {
  const data = useData();
  const navigate = useNavigate();


  if (!artwork) {
    return <></>;
  }

  const artistName = getPropertyFromMetadata(artwork?.meta_data || [], "artist")?.artist_name;
  const imgSrc = artwork?.images?.length ? artwork?.images[0].woocommerce_thumbnail : "";
  const artworkDimensions = getArtworkDimensions(artwork);

  const artworkTechnique = artwork ? data.getCategoryMapValues(artwork, "tecnica").join(" ") : "";
  const artworkCertificate = artwork ? data.getCategoryMapValues(artwork, "certificato").join(" ") : "";
  const artworkUnique = artwork ? data.getCategoryMapValues(artwork, "rarita").join(" ") : "";

  const shippingCost = getPropertyFromMetadata(artwork?.meta_data || [], "estimated_shipping_cost")?.value;

  const handleOpenArtwork = () => {
    if (!artwork) {
      return;
    }
    navigate(`/opere/${artwork.slug}`);
  };

  return (<Box display="flex" flexDirection="column" p={3}>
    <Typography variant="h4">{artwork.name}</Typography>
    <Typography variant="h4" color="textSecondary" sx={{ mb: 3 }}>{artistName}</Typography>
    <img style={{ width: "100%", aspectRatio: 1, objectFit: "contain", borderRadius: "4px", cursor: "pointer" }}
         onClick={handleOpenArtwork} src={imgSrc} />
    <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 3, mb: 0.5 }}>{artworkTechnique}</Typography>
    <Typography variant="subtitle1" color="textSecondary">{artworkDimensions}</Typography>
    <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2, mb: 0.5 }}>
      <ArtworkIcon sx={{ mr: 0.5 }} fontSize="inherit" />{artworkUnique}</Typography>
    <Typography variant="subtitle1" color="textSecondary"><CertificateIcon sx={{ mr: 0.5 }}
                                                                           fontSize="inherit" />{artworkCertificate}
    </Typography>
    <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2, mb: 0.5, pl: "20px", textIndent: "-20px" }}>
      <ShippingIcon fontSize="inherit" sx={{ mr: 0.5 }} />Il costo di spedizione è {shippingCost}€
    </Typography>
    <Typography variant="subtitle1" color="textSecondary" sx={{ pl: "20px", textIndent: "-20px" }}>
      <ShopIcon fontSize="inherit" sx={{ mr: 0.5 }} />È possibile ritirare l'opera in galleria senza costi aggiuntivi
    </Typography>
  </Box>);
};

export default ArtworkMessageDetails;
