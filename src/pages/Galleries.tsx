import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { galleriesToGalleryItems } from "../utils.ts";
import { Grid, Skeleton, Box } from "@mui/material";
import GalleriesGrid from "../components/GalleriesGrid.tsx";
import { Gallery } from "../types/gallery.ts";

export interface GalleriesProps {}

const Galleries: React.FC<GalleriesProps> = ({}) => {
  const data = useData();

  const [isReady, setIsReady] = useState(false);
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  const filterGalleriesByIds = (galleries: Gallery[], hideIds: number[]) => {
    return galleries.filter((gallery) => !hideIds.includes(gallery.id));
  };

  const filterGalleriesWithoutBanner = (galleries: Gallery[]) => {
    return galleries.filter((gallery) => gallery.shop.banner.trim().length > 0);
  };


  useEffect(() => {
    data.getGalleries().then((resp) => {
      const hideIds = [220, 221, 144, 212, 76];
      const galleriesByIds = filterGalleriesByIds(resp, hideIds)
      setGalleries(filterGalleriesWithoutBanner(galleriesByIds));
      setIsReady(true);
    });
  }, []);


  const GalleriesSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 12 }).map((_, index) => (
        <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
          <Box>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 1.5 }} />
            <Skeleton variant="text" width="70%" height={28} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <DefaultLayout>
      <section className={"pt-35 md:pt-0 space-y-12 mb-24 px-8 md:px-0"}>
        <div className={" border-b border-[#CDCFD3] pb-12"}>
          <h1 className={"text-5xl leading-[105%] font-normal"}>Le nostre gallerie partner</h1>
          <p className={"mt-6 text-secondary"}>
            Marketplace per l’arte. Entra negli shop, scopri le opere, paga anche a rate.
          </p>
        </div>
        <Grid xs={12} pb={3} sx={{ mt: { xs: 2, sm: 3 } }} item>
          {!isReady ? (
            <GalleriesSkeleton />
          ) : (
            <GalleriesGrid items={galleriesToGalleryItems([...galleries].reverse())} disablePadding cardSize="medium" />
          )}
        </Grid>
      </section>
    </DefaultLayout>
  );
};

export default Galleries;
