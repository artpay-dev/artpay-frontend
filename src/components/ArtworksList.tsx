import React from "react";
import { Box } from "@mui/material";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import CardList from "./CardList.tsx";

export interface ArtworksListProps {
  items: ArtworkCardProps[];
  title?: string;
}

const ArtworksList: React.FC<ArtworksListProps> = ({ title, items }) => {
  return (
    <CardList title={title}>
      {items.map((item, i) => (
        <ArtworkCard key={i} {...item} />
      ))}
    </CardList>
  );
  return (
    <Box
      display="flex"
      gap={3}
      sx={{
        flexDirection: { xs: "column", sm: "row" },
        flexWrap: { xs: "wrap", md: "nowrap" },
        justifyContent: { xs: "center", md: "flex-start" },
      }}>
      {items.map((item, i) => (
        <ArtworkCard key={i} {...item} />
      ))}
    </Box>
  );
};

export default ArtworksList;
