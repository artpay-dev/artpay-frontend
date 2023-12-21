import React from "react";
import { Grid } from "@mui/material";
import { ArtistCardProps } from "./ArtistCard.tsx";
import { useNavigate } from "react-router-dom";
import ArtistsGrid from "./ArtistsGrid.tsx";

export interface GalleryArtistsListProps {
  artists: ArtistCardProps[];
}

const GalleryArtistsList: React.FC<GalleryArtistsListProps> = ({ artists = [] }) => {
  const navigate = useNavigate();
  const handleSelectArtist = (index: number) => {
    const selectedArtist = artists[index];
    navigate(`/artist/${selectedArtist.id}`);
  };

  return (
    <Grid container>
      <Grid xs={12} sx={{ maxWidth: "100%", overflow: "auto", py: { xs: 3, md: 6 } }} item>
        <ArtistsGrid title="I nostri artisti" items={artists} onSelect={handleSelectArtist} />
      </Grid>
    </Grid>
  );
};

export default GalleryArtistsList;
