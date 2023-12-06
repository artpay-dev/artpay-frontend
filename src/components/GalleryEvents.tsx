import React from "react";
import { Divider, Grid, Typography } from "@mui/material";
import ArtworksList from "./ArtworksList.tsx";
import ArtistsList from "./ArtistsList.tsx";
import { ArtworkCardProps } from "./ArtworkCard.tsx";
import { ArtistCardProps } from "./ArtistCard.tsx";
import { useNavigate } from "react-router-dom";

export interface GalleryEventsProps {
  imgUrl: string;
  title: string;
  eventDate: string;
  eventText: string;
  artworks: ArtworkCardProps[];
  artists: ArtistCardProps[];
}

const GalleryEvents: React.FC<GalleryEventsProps> = ({
  imgUrl,
  title,
  eventDate,
  eventText,
  artists,
  artworks,
}) => {
  const navigate = useNavigate();
  const handleSelectArtwork = (index: number) => {
    const selectedArtwork = artworks[index];
    navigate(`/artwork/${selectedArtwork.id}`);
  };
  const handleSelectArtist = (index: number) => {
    const selectedArtist = artists[index];
    navigate(`/artist/${selectedArtist.id}`);
  };

  return (
    <Grid container>
      <Grid xs={12} md={6} item>
        <img style={{ maxWidth: "100%", borderRadius: "5px" }} src={imgUrl} />
      </Grid>
      <Grid xs={12} md={6} sx={{ px: { xs: 0, md: 10 } }} item>
        <Typography variant="h6" color="textSecondary">
          {eventDate}
        </Typography>
        <Typography sx={{ mt: 2 }} variant="h3">
          {title}
        </Typography>
        <Typography sx={{ mt: 3 }} variant="subtitle1" color="textSecondary">
          {eventText}
        </Typography>
      </Grid>
      <Grid xs={12} py={6} item>
        <Divider color="textSecondary" />
      </Grid>
      <Grid xs={12} py={6} sx={{ maxWidth: "100%", overflow: "auto" }} item>
        <ArtworksList
          title="Le nostre opere"
          items={artworks}
          onSelect={handleSelectArtwork}
          cardSize="large"
        />
      </Grid>
      <Grid xs={12} mt={6} py={6} sx={{ maxWidth: "100%" }} item>
        <ArtistsList
          title="I nostri artisti"
          items={artists}
          onSelect={handleSelectArtist}
        />
      </Grid>
    </Grid>
  );
};

export default GalleryEvents;
