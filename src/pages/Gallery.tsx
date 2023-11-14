import React, { useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Chip, Grid, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

export interface GalleryProps {}

interface GalleryContent {
  imageSrc: string;
  title: string;
  subtitle: string;
  description: string;
  categories: string[];
}

const Gallery: React.FC<GalleryProps> = ({}) => {
  useEffect(() => {
    // TODO: loadData
  }, []);

  const galleryContent: GalleryContent = {
    imageSrc: "/public/gallery_example.jpg",
    title: "Crag – Chiono Reisova Art Gallery",
    subtitle: "Torino, 1992",
    description: `CRAG – Chiono Reisova Art Gallery nasce nel 2016 in un loft
    nel centro Piero della Francesca di Torino, fondata
    da Elisabetta Chiono e Karin Reisovà con uno sguardo verso artisti emergenti, sia italiani che stranieri.`,
    categories: ["CATEGORY1", "CATEGORY2", "CATEGORY3"],
  };

  return (
    <DefaultLayout>
      <Grid sx={{ p: 0, maxWidth: "1440px" }} container>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            maxHeight: { xs: "315px", sm: "660px" },
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}>
          <img src={galleryContent.imageSrc} style={{ width: "100%" }} />
        </Grid>
        <Grid item xs={12} p={3} md display="flex" justifyContent="center" flexDirection="column">
          <Typography sx={{ typography: { sm: "h1", xs: "h3" } }}>{galleryContent.title}</Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
            {galleryContent.subtitle}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, maxWidth: { md: "560px" } }}>
            {galleryContent.description}
          </Typography>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 3, sm: 0 }}
            mt={{ xs: 3, md: 7 }}
            sx={{ maxWidth: { md: "560px" } }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between">
            <Box display="flex" gap={{ xs: 1, md: 2 }}>
              {galleryContent.categories.map((category, index) => (
                <Chip key={index} label={category} color="secondary" size="small" />
              ))}
            </Box>
            <Button variant="outlined" endIcon={<Add />}>
              Follow
            </Button>
          </Box>
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};
export default Gallery;
