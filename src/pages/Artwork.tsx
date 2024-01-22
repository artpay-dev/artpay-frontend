import { Box, Button, Divider, Grid, IconButton, Tab, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useData } from "../hoc/DataProvider.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Artwork } from "../types/artwork.ts";
import PromoBig from "../components/PromoBig.tsx";
import TabPanel from "../components/TabPanel.tsx";
import ArtworksList from "../components/ArtworksList.tsx";
import ArtworkDetails from "../components/ArtworkDetails.tsx";
import { artworksToGalleryItems, getArtworkDimensions, getPropertyFromMetadata } from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { Gallery } from "../types/gallery.ts";
import GalleryDetails from "../components/GalleryDetails.tsx";
import { Share } from "@mui/icons-material";
import ArtistDetails from "../components/ArtistDetails.tsx";
import { Artist } from "../types/artist.ts";
import ResponsiveTabs from "../components/ResponsiveTabs.tsx";
import FavouriteIcon from "../components/icons/FavouriteIcon.tsx";
import GalleryHeader from "../components/GalleryHeader.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";

export interface ArtworkProps {}

const Artwork: React.FC<ArtworkProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);
  const [selectedTabPanel, setSelectedTabPanel] = useState(0);
  const [artwork, setArtwork] = useState<Artwork>();
  const [galleryArtworks, setGalleryArtworks] = useState<ArtworkCardProps[]>();
  const [artistArtworks, setArtistArtworks] = useState<ArtworkCardProps[]>();
  const [galleryDetails, setGalleryDetails] = useState<Gallery | undefined>();
  const [artistDetails, setArtistDetails] = useState<Artist | undefined>();

  const data = useData();
  const urlParams = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();

  const artworkTechnique = artwork ? data.getCategoryMapValues(artwork, "tecnica").join(" ") : "";
  const artworkCertificate = artwork ? data.getCategoryMapValues(artwork, "certificato").join(" ") : "";
  const artworkUnique = artwork ? data.getCategoryMapValues(artwork, "rarita").join(" ") : "";

  const heroImgUrl = artwork?.images.length ? artwork.images[0].src : "";

  const handleGalleryArtworkSelect = (i: number) => {
    if (galleryDetails && galleryArtworks && galleryArtworks[i]) {
      setIsReady(false);
      navigate(`/gallerie/${galleryDetails.shop?.slug}/opere/${galleryArtworks[i].slug}`);
    }
  };

  const handleShare = async () => {
    await dialogs.share("/");
  };

  useEffect(() => {
    //TODO: page loader
    // setIsReady(false);
    if (!urlParams.slug_opera) {
      navigate("/");
      return;
    }
    data.getArtworkBySlug(urlParams.slug_opera).then(async (resp) => {
      setArtwork(resp);
      const [galleryArtworks] = await Promise.all([
        data.listArtworksForGallery(resp.vendor),
        //data.getGallery(resp.vendor),
      ]);
      if (resp.vendor) {
        const galleryDetails = await data.getGallery(resp.vendor);
        setGalleryDetails(galleryDetails);
      }
      const artistId = getPropertyFromMetadata(resp.meta_data, "artist")?.ID;
      if (artistId) {
        const artistDetails = await data.getArtist(artistId);
        setArtistDetails(artistDetails);
        //TODO: filtro per artista
        const artworksIds = (artistDetails.artworks || []).map((a) => a.ID.toString());
        setArtistArtworks(
          artworksToGalleryItems(galleryArtworks.filter((a) => artworksIds.indexOf(a.id.toString()) !== -1)),
        );
      }

      // setGalleryDetails(galleryDetails);
      //const galleryArtworks = await data.listArtworksForArtist(resp.vendor);
      setGalleryArtworks(artworksToGalleryItems(galleryArtworks));

      setIsReady(true);
    });
  }, [data, navigate, urlParams.id, urlParams.slug_opera, urlParams.slug_galleria]);

  return (
    <DefaultLayout
      pageLoading={!isReady}
      topBar={
        <GalleryHeader
          slug={galleryDetails?.nice_name || ""}
          logo={galleryDetails?.shop?.image || ""}
          displayName={galleryDetails?.display_name || ""}
        />
      }>
      <Grid sx={{ p: 0, maxWidth: "1440px", mt: 1, justifyContent: "center" }} container>
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
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          />
        </Grid>
        <Grid item xs={12} p={3} md display="flex" justifyContent="flex-start" flexDirection="column">
          <Typography sx={{ typography: { sm: "h1", xs: "h3" }, pr: { xs: 0, md: 5 } }}>{artwork?.name}</Typography>
          <Typography variant="h4" color="textSecondary" sx={{ mt: 2 }}>
            {getPropertyFromMetadata(artwork?.meta_data || [], "artist")?.artist_name}
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 3, typography: { xs: "h6", md: "subtitle1" } }}>
            {artworkTechnique}
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1, typography: { xs: "h6", md: "subtitle1" } }}>
            {getArtworkDimensions(artwork)}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
            <a href="#artwork-info">Maggiori info sull'opera</a>
          </Typography>
          <Box mt={3}>
            <Typography variant="subtitle1" color="textSecondary">
              {artworkUnique}
            </Typography>
            <Typography sx={{ mt: 1 }} variant="subtitle1" color="textSecondary">
              {artworkCertificate}
            </Typography>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box display="flex" alignItems="center">
            <Typography variant="h3">{artwork?.price} €</Typography>
            <Box flexGrow={1} />
            <IconButton>
              <FavouriteIcon color="primary" />
            </IconButton>
            <IconButton onClick={handleShare}>
              <Share color="primary" />
            </IconButton>
          </Box>
          <Box mt={2} sx={{ mb: { xs: 0, md: 3 } }} display="flex" gap={1}>
            <Button variant="outlined">Compra ora</Button>
            <Button variant="contained">Acquista a rate</Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box
            display="flex"
            alignItems={{ xs: "flex-start", md: "center" }}
            flexDirection={{ xs: "column", sm: "row" }}>
            <Box flexGrow={1} display="flex" flexDirection="column" sx={{ gap: { xs: 1, sm: 0 } }}>
              <Typography variant="h6" fontWeight={600}>
                {galleryDetails?.display_name}
              </Typography>
              <Typography variant="h6">{galleryDetails?.address?.city}</Typography>
            </Box>
            <Box display="flex" flexDirection={{ xs: "row", sm: "column" }} sx={{ mt: { xs: 2, sm: 0 } }} gap={2}>
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
      <PromoBig
        title={"Vuoi acquistare a rate?"}
        content={
          "Se ti interessa quest’opera puoi bloccarla in esclusiva per 24 ore. Clicca qui e scegli se procedere all’iter di finanziamento direttamente dalla tua area personale."
        }
        cta={{
          text: "Blocca l'opera",
          link: "#",
        }}
        imgUrl={heroImgUrl}
        sx={{ mt: { xs: 3, sm: 6, md: 15 }, mb: 5 }}
      />
      <Box id="artwork-info" sx={{ top: "-100px", position: "relative" }}></Box>
      <Box mt={5}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "secondary",
            mx: { xs: 0, sm: 3, md: 6 },
          }}>
          <ResponsiveTabs value={selectedTabPanel} onChange={(_, newValue) => setSelectedTabPanel(newValue)}>
            <Tab label="Informazioni sull' opera" />
            <Tab label="Informazioni sull' artista" />
            <Tab label="Informazioni sulla galleria" />
          </ResponsiveTabs>
        </Box>
        <Box sx={{ minHeight: { md: "120px" } }}>
          <TabPanel value={selectedTabPanel} index={0}>
            {artwork && <ArtworkDetails artwork={artwork} artist={artistDetails} />}
          </TabPanel>
          <TabPanel value={selectedTabPanel} index={1}>
            {artistDetails && <ArtistDetails artist={artistDetails} />}
          </TabPanel>
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
      <ArtworksList title="Opere dello stesso artista" items={artistArtworks || []} />
      <ArtworksList title="Opere della galleria" items={galleryArtworks || []} onSelect={handleGalleryArtworkSelect} />
      <ArtworksList title="Simili per prezzo" items={[]} />
    </DefaultLayout>
  );
};

export default Artwork;
