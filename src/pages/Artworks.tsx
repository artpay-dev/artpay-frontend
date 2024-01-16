import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Grid, Typography } from "@mui/material";
import { artworksToGalleryItems } from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import ArtworksGrid from "../components/ArtworksGrid.tsx";
import { useNavigate, useParams } from "react-router-dom";
import ArtworksFilters from "../components/ArtworksFilters.tsx";
import { CardItem } from "../types";
import GalleryHeader from "../components/GalleryHeader.tsx";
import { Gallery } from "../types/gallery.ts";

export interface ArtworksProps {}

const Artworks: React.FC<ArtworksProps> = ({}) => {
  const data = useData();
  const navigate = useNavigate();
  const urlParams = useParams();

  const [isReady, setIsReady] = useState(false);
  const [artworks, setArtworks] = useState<ArtworkCardProps[]>([]);
  const [galleryDetails, setGalleryDetails] = useState<Gallery>();

  const gallerySlug = urlParams.slug;

  useEffect(() => {
    if (gallerySlug) {
      data.getGalleryBySlug(gallerySlug).then(async (resp) => {
        setGalleryDetails(resp);
        const artworks = await data.listArtworksForGallery(resp.id.toString());
        setArtworks(artworksToGalleryItems(artworks, "large"));
        setIsReady(true);
      });
    } else {
      data.listArtworks().then((resp) => {
        setArtworks(artworksToGalleryItems(resp, "large"));
        setIsReady(true);
      });
    }
  }, [data, urlParams.slug]);

  const handleSelectArtwork = (item: CardItem) => {
    if (artworks?.length) {
      navigate(`/gallerie/${gallerySlug}/opere/${item.slug}`);
    }
  };

  const topMargin = galleryDetails ? { xs: 2, sm: 4 } : { xs: 8, sm: 12 };

  return (
    <DefaultLayout
      pageLoading={!isReady}
      topBar={
        galleryDetails ? (
          <GalleryHeader
            slug={galleryDetails?.nice_name || ""}
            logo={galleryDetails?.shop?.image || ""}
            displayName={galleryDetails?.display_name || ""}
          />
        ) : undefined
      }>
      <Grid sx={{ maxWidth: "1440px", mt: topMargin, mb: { xs: 4, sm: 8 }, justifyContent: "center" }} container>
        <Grid xs={12} sx={{ px: { xs: 3, md: 6 }, mb: { xs: 8, md: 12 } }} item>
          <Typography variant="h1">Tutte le opere</Typography>
        </Grid>
        <Grid sx={{ px: { xs: 2, md: 4 } }} item xs={12} md={3}>
          <ArtworksFilters />
        </Grid>
        <Grid item xs={12} md={9}>
          <ArtworksGrid items={artworks} onSelect={handleSelectArtwork} cardSize="large" />
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Artworks;
