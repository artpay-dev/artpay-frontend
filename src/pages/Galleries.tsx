import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { galleriesToGalleryItems } from "../utils.ts";
import { Grid, Skeleton, Box } from "@mui/material";
import GalleriesGrid from "../components/GalleriesGrid.tsx";
import { Gallery } from "../types/gallery.ts";

export interface GalleriesProps {}


//const THEOTHERS_GALLERIES = [229]

const THEOTHERS_GALLERIES = [21]

const Galleries: React.FC<GalleriesProps> = ({}) => {
  const data = useData();

  const [isReady, setIsReady] = useState(false);
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  const filterGalleriesByIds = (galleries: Gallery[], hideIds: number[]) => {
    return galleries.filter((gallery) => !hideIds.includes(gallery.id));
  };


  useEffect(() => {
    data.getGalleries().then((resp) => {
      const hideIds = [220, 221, 144, 212, 76];
      setGalleries(filterGalleriesByIds(resp, hideIds));
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
          <h1 className={"text-5xl leading-[105%] font-normal"}>Le nostre gallerie partner a The Others 2025</h1>
          <p className={"mt-6 text-secondary"}>
            Marketplace per l’arte. Entra negli shop, scopri le opere, paga anche a rate.
          </p>
        </div>
        <Grid xs={12} pb={3} sx={{ mt: { xs: 2, sm: 3 } }} item>
          {!isReady ? (
            <GalleriesSkeleton />
          ) : (
            <GalleriesGrid items={galleriesToGalleryItems(galleries.filter(gallery => THEOTHERS_GALLERIES.includes(gallery.id)))} disablePadding cardSize="medium" />
          )}
        </Grid>
        <div className={" border-t border-[#CDCFD3] pt-12"}>
          <h2 className={"text-3xl leading-[105%] font-normal"}>Altre gallerie partner di artpay</h2>
        </div>
        <Grid xs={12} pb={3} sx={{ mt: { xs: 2, sm: 3 } }} item>
          {!isReady ? (
            <GalleriesSkeleton />
          ) : (
            <GalleriesGrid items={galleriesToGalleryItems(galleries.filter(gallery => !THEOTHERS_GALLERIES.includes(gallery.id)))} disablePadding cardSize="medium" />
          )}
        </Grid>
      </section>
    </DefaultLayout>
  );
};

export default Galleries;
