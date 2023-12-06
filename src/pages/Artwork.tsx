import {
  Box,
  Button,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useData } from "../hoc/DataProvider.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Artwork } from "../types/artwork.ts";
import HeroArtwork from "../components/HeroArtwork.tsx";
import TabPanel from "../components/TabPanel.tsx";
import ArtworksList from "../components/ArtworksList.tsx";
import ArtworkDetails from "../components/ArtworkDetails.tsx";
import { artworksToGalleryItems } from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { Gallery } from "../types/gallery.ts";
import GalleryDetails from "../components/GalleryDetails.tsx";

export interface ArtworkProps {}

const Artwork: React.FC<ArtworkProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);
  const [selectedTabPanel, setSelectedTabPanel] = useState(0);
  const [artwork, setArtwork] = useState<Artwork>();
  const [galleryArtworks, setGalleryArtworks] = useState<ArtworkCardProps[]>();
  const [artistArtworks, setArtistArtworks] = useState<ArtworkCardProps[]>();
  const [galleryDetails, setGalleryDetails] = useState<Gallery | undefined>();

  const data = useData();
  const urlParams = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    //TODO: page loader
    // setIsReady(false);
    if (!urlParams.id) {
      navigate("/");
      return;
    }
    data.getArtwork(urlParams.id).then(async (resp) => {
      setArtwork(resp);
      const [galleryArtworks] = await Promise.all([
        data.listArtworksForGallery(resp.vendor),
        //data.getGallery(resp.vendor),
      ]);
      if (resp.vendor) {
        const galleryDetails = await data.getGallery(resp.vendor);
        setGalleryDetails(galleryDetails);
      }

      // setGalleryDetails(galleryDetails);
      //const galleryArtworks = await data.listArtworksForArtist(resp.vendor);
      setGalleryArtworks(artworksToGalleryItems(galleryArtworks));

      //TODO: filtro per artista
      setArtistArtworks(artworksToGalleryItems(galleryArtworks));
      setIsReady(true);
    });
  }, [data, navigate, urlParams.id]);

  return (
    <DefaultLayout pageLoading={!isReady}>
      <Grid sx={{ p: 0, maxWidth: "1440px", mt: 12 }} container>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            maxHeight: { xs: "315px", sm: "660px", md: "820px" },
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <img
            src={artwork?.images?.length ? artwork.images[0].src : ""}
            style={{ height: "100%" }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          p={3}
          md
          display="flex"
          justifyContent="flex-start"
          flexDirection="column">
          <Typography
            sx={{ typography: { sm: "h1", xs: "h3" }, pr: { xs: 0, md: 5 } }}>
            {artwork?.name}
          </Typography>
          <Typography variant="h4" color="textSecondary" sx={{ mt: 2 }}>
            {artwork?.store_name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 3 }}>
            Acrylic & ink on paper
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
            91,4 x 61 cm
          </Typography>
          <Box mt={3}>
            <Typography variant="subtitle1" color="textSecondary">
              Opera unica
            </Typography>
            <Typography
              sx={{ mt: 1 }}
              variant="subtitle1"
              color="textSecondary">
              Certificato di autenticità incluso
            </Typography>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h3">{artwork?.price} €</Typography>
          <Box mt={2} mb={3} display="flex" gap={1}>
            <Button variant="outlined">Compra ora</Button>
            <Button variant="contained">Acquista a rate</Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box display="flex" alignItems="center">
            <Box flexGrow={1} display="flex" flexDirection="column">
              <Typography variant="subtitle1" fontWeight={600}>
                {galleryDetails?.username}
              </Typography>
              <Typography variant="subtitle1">
                {galleryDetails?.billing?.city}
              </Typography>
            </Box>
            <Box>
              <Button variant="outlined">Contatta la galleria</Button>
            </Box>
          </Box>
          <Divider sx={{ mt: 3 }} />
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 3, sm: 0 }}
            mt={{ xs: 3, md: 7 }}
            sx={{ maxWidth: { md: "560px" } }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between">
            <Box display="flex" gap={{ xs: 1, md: 2 }}></Box>
          </Box>
        </Grid>
      </Grid>
      <HeroArtwork
        title={"Vuoi acquistare a rate?"}
        subtitle={
          "Se ti interessa quest’opera puoi bloccarla in esclusiva per 24 ore. Clicca qui e scegli se procedere all’iter di finanziamento direttamente dalla tua area personale."
        }
        cta={"Blocca l'opera"}
        sx={{ mt: 15, mb: 5 }}
      />
      <Box mt={5}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "secondary",
            mx: { xs: 0, sm: 3, md: 6 },
          }}>
          <Tabs
            value={selectedTabPanel}
            onChange={(_, newValue) => setSelectedTabPanel(newValue)}
            color="secondary"
            centered>
            <Tab label="Informazioni sull' opera" />
            <Tab label="Informazioni sull' artista" />
            <Tab label="Informazioni sulla galleria" />
          </Tabs>
        </Box>
        <Box sx={{ minHeight: { md: "480px" } }}>
          <TabPanel value={selectedTabPanel} index={0}>
            {artwork && <ArtworkDetails artwork={artwork} />}
          </TabPanel>
          <TabPanel value={selectedTabPanel} index={1}></TabPanel>
          <TabPanel value={selectedTabPanel} index={2}>
            {galleryDetails && <GalleryDetails gallery={galleryDetails} />}
          </TabPanel>
        </Box>
        <Divider
          sx={{
            borderColor: "rgba(0, 0, 0, 0.87)",
            mb: { xs: 3, md: 8 },
            mx: { xs: 0, sm: 3, md: 6 },
          }}
        />
      </Box>
      <ArtworksList
        title="Opere dello stesso artista"
        items={artistArtworks || []}
      />
      <ArtworksList
        title="Opere della galleria"
        items={galleryArtworks || []}
      />
      <ArtworksList title="Simili per prezzo" items={[]} />
    </DefaultLayout>
  );
};

export default Artwork;
