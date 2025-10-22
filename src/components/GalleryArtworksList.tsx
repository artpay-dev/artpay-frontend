import React from "react";
import { ArtworkCardProps } from "./ArtworkCard.tsx";
import { Grid } from "@mui/material";
import ArtworksGrid from "./ArtworksGrid.tsx";
import { CardItem } from "../types";

export interface GalleryArtworksListProps {
  artworks?: ArtworkCardProps[];
  onSelect?: (item: CardItem) => void;
  onLoadMore?: () => Promise<void>;
}

const GalleryArtworksList: React.FC<GalleryArtworksListProps> = ({ artworks = [], onSelect, onLoadMore }) => {
  return (
    <Grid px={0} container>
      <Grid xs={12} sx={{ maxWidth: "100%", overflow: "auto", py: { xs: 3, md: 6 } , px: {xs: 4, md:0}}} item>
        <ArtworksGrid
          disablePadding
          title="Le nostre opere"
          emptyText="Nessun'opera per questa galleria"
          items={artworks}
          onSelect={onSelect}
          onLoadMore={onLoadMore}
          cardSize="medium"
        />
      </Grid>
    </Grid>
  );
};

export default GalleryArtworksList;
