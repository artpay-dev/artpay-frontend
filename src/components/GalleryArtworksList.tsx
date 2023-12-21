import React from "react";
import { ArtworkCardProps } from "./ArtworkCard.tsx";
import { Grid } from "@mui/material";
import ArtworksGrid from "./ArtworksGrid.tsx";

export interface GalleryArtworksListProps {
  artworks?: ArtworkCardProps[];
  onSelect?: (idx: number) => void;
}

const GalleryArtworksList: React.FC<GalleryArtworksListProps> = ({ artworks = [], onSelect }) => {
  return (
    <Grid container>
      <Grid xs={12} sx={{ maxWidth: "100%", overflow: "auto", py: { xs: 3, md: 6 } }} item>
        <ArtworksGrid title="Le nostre opere" items={artworks} onSelect={onSelect} cardSize="large" />
      </Grid>
    </Grid>
  );
};

export default GalleryArtworksList;
