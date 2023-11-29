import React from "react";
import { Box } from "@mui/material";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";

export interface ArtworksListProps {
  items: ArtworkCardProps[];
}

const ArtworksList: React.FC<ArtworksListProps> = ({ items }) => {
  return (
    <Box
      display="flex"
      gap={3}
      sx={{ flexDirection: { xs: "column", md: "row" } }}>
      {items.map((item, i) => (
        <ArtworkCard key={i} {...item} />
      ))}
    </Box>
  );
};

export default ArtworksList;
