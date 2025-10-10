import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useNavigate } from "react-router-dom";
import { galleriesToGalleryItems, getDefaultPaddingX } from "../utils.ts";
import { Grid, Typography } from "@mui/material";
import GalleriesGrid from "../components/GalleriesGrid.tsx";
import { Gallery } from "../types/gallery.ts";

export interface GalleriesProps {

}

const Galleries: React.FC<GalleriesProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();

  const [isReady, setIsReady] = useState(false);
  const [galleries, setGalleries] = useState<Gallery[]>([]);


  // Controlla se l'utente ha l'ID 132
  useEffect(() => {
    if (!auth.user) {
      navigate("/");
    } else if (auth.user.id !== 132) {
      navigate("/dashboard");
    }
  }, [auth.user, navigate]);

  useEffect(() => {
    data.getGalleries().then(resp => {
      console.log(resp);
      setGalleries(resp.filter(gallery => gallery.id != 220));
      setIsReady(true);
    });
  }, []);

  const px = getDefaultPaddingX();

  return (<DefaultLayout pageLoading={!isReady} authRequired>
    <Grid sx={{ px: px, mt: { xs: 14, md: 16, lg: 18 } }} container>
      <Grid xs={12} pb={3} item>
        <Typography variant="display3">Gallerie</Typography>
      </Grid>
      <Grid xs={12} sm={7} md={6} pr={2} item>
        <Typography variant="h4" color="textSecondary">
          {/*Gallerie... Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.*/}
        </Typography>
      </Grid>
      {/*<Grid xs={12} sm={5} md={6} sx={{ alignItems: "flex-end", justifyContent: "flex-end", mt: { xs: 4, sm: 0 } }}
            display="flex" item>
        <TextField variant="filled" color="secondary"
                   onChange={(e) => {
                     setSearchFilterValue(e.target.value);
                     if (!e.target.value && searchFilter) {
                       setSearchFilter("");
                     }
                   }}
                   onKeyUp={(e) => {
                     if (e.key === "Enter") {
                       setSearchFilter(searchFilterValue);
                     }
                   }}
                   InputProps={{
                     endAdornment: <Button variant="contained"
                                           onClick={() => setSearchFilter(searchFilterValue)}>Cerca</Button>,
                     startAdornment: <SearchIcon fontSize="small" />
                   }} />
      </Grid>*/}
      {/*<Grid xs={12} sx={{
        pb: 3,
        mb: { xs: 0, md: 5 },
        mt: { xs: 3, sm: 8, md: 12 },
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" }
      }} display="flex" gap={2}
            alignItems="center" item>
        <Box display="flex" gap={2}>
          <Chip variant="outlined" label="Filtro" />
          <Chip variant="outlined" label="Filtro" />
          <Chip variant="outlined" label="Filtro" />
        </Box>
        <Box flexGrow={1} display={{ xs: "none", sm: "inherit" }}></Box>
        <Box display="flex" gap={0.5}>
          <SortIcon onClick={() => setSortingModeDesc(!sortingModeDesc)} fontSize="small" color="inherit" />
          <Typography>Ordina per: Ultimi aggiunti</Typography>
        </Box>
      </Grid>*/}
      <Grid xs={12} pb={3} sx={{ mt: { xs: 2, sm: 3 } }} item>
        <GalleriesGrid items={galleriesToGalleryItems(galleries)} disablePadding
                       cardSize="medium" />
      </Grid>
    </Grid>

  </DefaultLayout>);
};

export default Galleries;
