import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { galleriesToGalleryItems, getDefaultPaddingX } from "../utils.ts";
import { Box, Button, Chip, Grid, Typography } from "@mui/material";
import SearchIcon from "../components/icons/SearchIcon.tsx";
import TextField from "../components/TextField.tsx";
import { GalleryCardProps } from "../components/GalleryCard.tsx";
import GalleriesGrid from "../components/GalleriesGrid.tsx";
import SortIcon from "../components/icons/SortIcon.tsx";

export interface GalleriesProps {}

const Galleries: React.FC<GalleriesProps> = ({}) => {
  const data = useData();

  const [isReady, setIsReady] = useState(false);
  const [galleries, setGalleries] = useState<GalleryCardProps[]>([]);

  useEffect(() => {
    data.getGalleries().then((resp) => {
      setIsReady(true);
      setGalleries(galleriesToGalleryItems(resp));
    });
  }, []);

  const px = getDefaultPaddingX();

  return (
    <DefaultLayout pageLoading={!isReady}>
      <Grid sx={{ px: px, mt: { xs: 14, md: 16, lg: 18 } }} container>
        <Grid xs={12} pb={3} item>
          <Typography variant="display3">Gallerie</Typography>
        </Grid>
        <Grid xs={12} sm={7} md={6} pr={2} item>
          <Typography variant="h4" color="textSecondary">
            Gallerie... Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
          </Typography>
        </Grid>
        <Grid
          xs={12}
          sm={5}
          md={6}
          sx={{ alignItems: "flex-end", justifyContent: "flex-end", mt: { xs: 4, sm: 0 } }}
          display="flex"
          item>
          <TextField
            variant="filled"
            color="secondary"
            InputProps={{
              endAdornment: <Button variant="contained">Cerca</Button>,
              startAdornment: <SearchIcon fontSize="small" />,
            }}
          />
        </Grid>
        <Grid
          xs={12}
          sx={{
            pb: 3,
            mb: { xs: 0, md: 5 },
            mt: { xs: 3, sm: 8, md: 12 },
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
          }}
          display="flex"
          gap={2}
          alignItems="center"
          item>
          <Box display="flex" gap={2}>
            <Chip variant="outlined" label="Filtro" />
            <Chip variant="outlined" label="Filtro" />
            <Chip variant="outlined" label="Filtro" />
          </Box>
          <Box flexGrow={1} display={{ xs: "none", sm: "inherit" }}></Box>
          <Box display="flex" gap={0.5}>
            <SortIcon fontSize="small" color="inherit" />
            <Typography>Ordina per: Ultimi aggiunti</Typography>
          </Box>
        </Grid>
        <Grid xs={12} pb={3} item>
          <GalleriesGrid items={galleries} disablePadding cardSize="medium" />
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Galleries;
