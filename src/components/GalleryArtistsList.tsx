import React from "react";
import { Grid } from "@mui/material";
import { ArtistCardProps } from "./ArtistCard.tsx";
import { useNavigate } from "../utils.ts";
import ArtistsGrid from "./ArtistsGrid.tsx";

export interface GalleryArtistsListProps {
  artists: ArtistCardProps[];
  gallerySlug: string | undefined;
}

const GalleryArtistsList: React.FC<GalleryArtistsListProps> = ({ artists = [], gallerySlug }) => {
  const navigate = useNavigate();
  const handleSelectArtist = (index: number) => {
    const selectedArtist = artists[index];
    navigate(`/artisti/${selectedArtist.slug}?gallery=${gallerySlug}`);
  };


  return (
    <Grid container>
      <Grid xs={12} sx={{ maxWidth: "100%", overflow: "auto", py: { xs: 3, md: 6 } }} item>
        <ArtistsGrid title="I nostri artisti" cardSize="medium" emptyText="Nessun artista per questa galleria"
                     items={artists}
                     disablePadding
                     onSelect={handleSelectArtist} />
      </Grid>
    </Grid>
  );
};

export default GalleryArtistsList;
