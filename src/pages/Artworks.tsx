import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Grid, Link, Typography } from "@mui/material";
import { artworksToGalleryItems, getDefaultPaddingX, useNavigate } from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import ArtworksGrid from "../components/ArtworksGrid.tsx";
import { useParams } from "react-router-dom";
import { CardItem } from "../types";
import { Gallery } from "../types/gallery.ts";

export interface ArtworksProps {
}

//TODO: rework pagina

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
  }, [gallerySlug]);

  const handleSelectArtwork = (item: CardItem) => {
    if (artworks?.length) {
      navigate(`/opere/${item.slug}`);
    }
  };


  const px = getDefaultPaddingX();

  return (
    <DefaultLayout pageLoading={!isReady}>
      <Grid sx={{ mt: { xs: 14, md: 16, lg: 18 }, mb: { xs: 4, sm: 8 }, px: px, justifyContent: "center" }}
            container>
        {galleryDetails &&
          <Box sx={{ width: "100%" }} mb={3}>
            <Typography
              sx={{ textTransform: "uppercase", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              color="primary" variant="body1">
              <Link sx={{ textDecoration: "none" }}
                    onClick={() => navigate(`/gallerie/${galleryDetails?.shop?.slug}`)}>{galleryDetails?.display_name}</Link>
            </Typography>
          </Box>
        }
        <Grid xs={12} sx={{ mb: { xs: 3, md: 6 } }} item>
          <Typography variant="h1">Tutte le opere</Typography>
        </Grid>
        {/*<Grid sx={{ px: { xs: 2, md: 4 } }} item xs={12} md={3}>
          <ArtworksFilters />
        </Grid>*/}
        <Grid item xs={12} md={12}>
          <ArtworksGrid items={artworks} onSelect={handleSelectArtwork} disablePadding cardSize="medium" />
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Artworks;
