import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import VerticalSlider from "../components/VerticalSlider.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { artistsToGalleryItems } from "../utils.ts";
import { ArtistCardProps } from "../components/ArtistCard.tsx";
import { Box } from "@mui/material";
import ArtistsGrid from "../components/ArtistsGrid.tsx";

export interface ArtistsProps {

}

const Artists: React.FC<ArtistsProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);
  const [featuredArtists, setFeaturedArtists] = useState<ArtistCardProps[]>();

  const data = useData();

  useEffect(() => {
    data.listFeaturedArtists().then(resp => {
      setFeaturedArtists(artistsToGalleryItems(resp));
      setIsReady(true);
    });

  }, []);

  return (<DefaultLayout pageLoading={!isReady} maxWidth={false}>
    <VerticalSlider />
    <Box sx={{ px: { xs: 0, md: 6 }, my: 6 }}>
      <ArtistsGrid items={featuredArtists || []} title="Tutti gli artisti" />
    </Box>
  </DefaultLayout>);
};

export default Artists;
