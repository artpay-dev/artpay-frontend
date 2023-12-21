import React from "react";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import { CardSize } from "../types";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

export interface ArtworksGridProps {
  items: ArtworkCardProps[];
  title?: string;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  onLoadMore?: () => Promise<void>;
}

const ArtworksGrid: React.FC<ArtworksGridProps> = ({ title, items, cardSize, onSelect, onLoadMore }) => {
  const navigate = useNavigate();
  const handleSelectArtwork = (index: number) => {
    const selectedArtwork = items[index];
    navigate(`/artwork/${selectedArtwork.id}`);
  };
  const handleLoadMore = () => {
    if (onLoadMore) {
    }
  };
  return (
    <Box sx={{ px: { xs: 0, md: 6 }, maxWidth: "100%" }}>
      {title && (
        <Typography sx={{ mb: { xs: 3, md: 6 } }} variant="h3">
          {title}
        </Typography>
      )}
      <Box
        gap={3}
        justifyContent="center"
        sx={{
          maxWidth: "100%",
          overflow: "auto",
          px: { xs: 1, sm: 4, md: 0 },
          /*          minHeight: "318px",
                          flexDirection: { xs: "column", sm: "row" },
                          { xs: "repeat(1, 1fr);", sm: "repeat(2, 1fr);", md: "repeat(3, 1fr);" }
                          flexWrap: { xs: "wrap", md: "nowrap" }, ;
                          justifyContent: { xs: "center", md: "flex-start" },*/
        }}>
        <Box
          display="grid"
          sx={{
            gridTemplateColumns: { xs: `repeat(auto-fill, minmax(320px, 1fr))` },
            justifyItems: "center",
            width: "auto",
          }}
          gap={1}>
          {items.map((item, i) => (
            <ArtworkCard
              key={i}
              {...item}
              size={cardSize}
              mode="grid"
              onClick={() => (onSelect ? onSelect(i) : handleSelectArtwork(i))}
            />
          ))}
        </Box>
        <Box display="flex" mt={4} justifyContent="center">
          <Button onClick={handleLoadMore} variant="outlined" color="primary" size="large">
            Mostra più opere
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ArtworksGrid;
