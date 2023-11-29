import React from "react";
import { Box } from "@mui/material";
import ArtistCard, { ArtistCardProps } from "./ArtistCard.tsx";

export interface ArtistsListProps {
  items: ArtistCardProps[];
}

const ArtistsList: React.FC<ArtistsListProps> = ({ items }) => {
  return (
    <Box
      display="flex"
      gap={3}
      sx={{ flexDirection: { xs: "column", md: "row" } }}>
      {items.map((item, i) => (
        <ArtistCard key={i} {...item} />
      ))}
    </Box>
  );
};

export default ArtistsList;
