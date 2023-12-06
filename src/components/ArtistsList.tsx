import React from "react";
import { Box } from "@mui/material";
import ArtistCard, { ArtistCardProps } from "./ArtistCard.tsx";
import CardList from "./CardList.tsx";

export interface ArtistsListProps {
  items: ArtistCardProps[];
  title?: string;
}

const ArtistsList: React.FC<ArtistsListProps> = ({ items, title }) => {
  return (
    <CardList title={title}>
      {items.map((item, i) => (
        <ArtistCard key={i} {...item} />
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
        <ArtistCard key={i} {...item} />
      ))}
    </Box>
  );
};

export default ArtistsList;
