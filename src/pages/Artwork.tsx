import { Box, Button, Divider, Grid, IconButton, Tab, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
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
import FavouriteFilledIcon from "../components/icons/FavouriteFilledIcon.tsx";
import { FavouritesMap } from "../types/post.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface ArtworkProps {
}

const Artwork: React.FC<ArtworkProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);
  const [selectedTabPanel, setSelectedTabPanel] = useState(0);
  const [artwork, setArtwork] = useState<Artwork>();
  const [galleryArtworks, setGalleryArtworks] = useState<ArtworkCardProps[]>();
  const [artistArtworks, setArtistArtworks] = useState<ArtworkCardProps[]>();
  const [galleryDetails, setGalleryDetails] = useState<Gallery | undefined>();
  const [artistDetails, setArtistDetails] = useState<Artist | undefined>();
  const [favouriteArtworks, setFavouriteArtworks] = useState<number[]>([]);

  const data = useData();
  const auth = useAuth();
  const urlParams = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const theme = useTheme();
  const snackbar = useSnackbars();

  const belowSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));

  const artworkTechnique = artwork ? data.getCategoryMapValues(artwork, "tecnica").join(" ") : "";
  const artworkCertificate = artwork ? data.getCategoryMapValues(artwork, "certificato").join(" ") : "";
  const artworkUnique = artwork ? data.getCategoryMapValues(artwork, "rarita").join(" ") : "";

  const heroImgUrl = artwork?.images.length ? artwork.images[0].src : "";
  const isArtworkFavourite = artwork?.id ? favouriteArtworks.indexOf(artwork.id) !== -1 : false;

  const isOutOfStock = artwork?.stock_status === "outofstock";


  const handleGalleryArtworkSelect = (i: number) => {
    if (galleryArtworks && galleryArtworks[i]) {
      setIsReady(false);
      navigate(`/opere/${galleryArtworks[i].slug}`);
    }
  };

  const handleShare = async () => {
    await dialogs.share(window.location.href);
  };

  const handleSetArtworkFavourite = async () => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (artwork?.id) {
      try {
        if (isArtworkFavourite) {
          await data.removeFavouriteArtwork(artwork.id.toString()).then((resp) => {
            setFavouriteArtworks(resp);
          });
        } else {
          await data.addFavouriteArtwork(artwork.id.toString()).then((resp) => {
            setFavouriteArtworks(resp);
          });
        }
      } catch (e) {
        //TODO: notify error
        console.log(e);
        await snackbar.error(e);
      }
    }
  };

  const handlePurchase = (artworkId?: number) => {
    if (!artworkId) {
      return;
    }
    setIsReady(false);
    data
      .purchaseArtwork(artworkId)
      .then(() => {
        navigate("/acquisti");
      })
      .catch((e) => {
        console.error(e);
        snackbar.error("Si è verificato un errore");
        setIsReady(true);
      });
  };

  const handleLoanPurchase = () => {
    if (!artwork?.slug) {
      return;
    }
    setIsReady(false);
    navigate(`/blocca-opera/${artwork?.slug}`);
  };

  useEffect(() => {
    //TODO: page loader
    // setIsReady(false);
    if (!urlParams.slug_opera) {
      navigate("/");
      return;
    }
    data.getArtworkBySlug(urlParams.slug_opera).then(async (resp) => {
      setIsReady(false);
      setArtwork(resp);
      const [galleryArtworks, favouriteArtworks] = await Promise.all([
        data.listArtworksForGallery(resp.vendor),
        data.getFavouriteArtworks().catch(e => [])
        //data.getGallery(resp.vendor),
      ]);
      setFavouriteArtworks(favouriteArtworks);
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
          artworksToGalleryItems(galleryArtworks.filter((a) => artworksIds.indexOf(a.id.toString()) !== -1))
        );
      }

      // setGalleryDetails(galleryDetails);
      //const galleryArtworks = await data.listArtworksForArtist(resp.vendor);
      setGalleryArtworks(artworksToGalleryItems(galleryArtworks));

      setIsReady(true);
    });
  }, [data, navigate, urlParams.id, urlParams.slug_opera, urlParams.slug_galleria]);

  useEffect(() => {
    const handleFavouritesUpdated = (e: CustomEvent<FavouritesMap>) => {
      if (artwork?.id) {
        setFavouriteArtworks(e.detail.artworks || []);
      }
    };

    document.addEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdated);
    return () => {
      document.removeEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdated);
    };
  }, [artwork?.id]);

  let sliderHeight = "720px";
  if (belowSm) {
    sliderHeight = "315px";
  } else if (isMd) {
    sliderHeight = "660px";
  } else if (isLg) {
    sliderHeight = "720px";
  }

  return (
    <DefaultLayout
      pageLoading={!isReady}
      maxWidth={false}
      topBar={
        <GalleryHeader
          slug={galleryDetails?.shop?.slug || ""}
          logo={galleryDetails?.shop?.image || ""}
          displayName={galleryDetails?.display_name || ""}
        />
      }>
      <Box display="flex" justifyContent="center">
        <Grid sx={{ p: 0, mt: { xs: 0, md: 1 }, justifyContent: "center", alignItems: "center" }} maxWidth="xl"
              container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              maxHeight: { xs: "315px", sm: "660px", md: "820px" },
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <img
              src={artwork?.images?.length ? artwork.images[0].src : ""}
              style={{ maxHeight: sliderHeight, maxWidth: "100%", objectFit: "contain" }}
            />
          </Grid>
          <Grid item xs={12} p={3} md display="flex" justifyContent="flex-start" flexDirection="column">
            <Typography sx={{ typography: { sm: "h1", xs: "h3" }, pr: { xs: 0, md: 5 } }} variant="h3">
              {artwork?.name}
            </Typography>
            <Typography variant="h4" color="textSecondary" sx={{ mt: 2, typography: { sm: "h4", xs: "h5" } }}>
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
              <IconButton onClick={() => handleSetArtworkFavourite()}>
                {isArtworkFavourite ? (
                  <FavouriteFilledIcon color="primary" fontSize="small" />
                ) : (
                  <FavouriteIcon fontSize="small" />
                )}
              </IconButton>
              <IconButton onClick={handleShare}>
                <Share color="primary" />
              </IconButton>
            </Box>
            <Box mt={2} sx={{ mb: { xs: 0, md: 3 } }} display="flex" gap={1}>
              <Button variant="outlined" disabled={isOutOfStock} onClick={() => handlePurchase(artwork?.id)}>
                Compra ora
              </Button>
              <Button variant="contained" disabled={isOutOfStock} onClick={handleLoanPurchase}>
                Acquista a rate
              </Button>
            </Box>
            {isOutOfStock && <Typography variant="h6" color="error">Opera non disponibile</Typography>}
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
      </Box>
      <PromoBig
        title={"Vuoi acquistare a rate?"}
        content={
          "Se ti interessa quest’opera puoi bloccarla in esclusiva per 24 ore. Clicca qui e scegli se procedere all’iter di finanziamento direttamente dalla tua area personale."
        }
        cta={{
          text: "Blocca l'opera",
          link: "#"
        }}
        disabled={isOutOfStock}
        imgUrl={heroImgUrl}
        onClick={handleLoanPurchase}
        sx={{ mt: { xs: 3, sm: 6, md: 15 }, mb: 5 }}
      />
      <Box id="artwork-info" sx={{ top: "-100px", position: "relative" }}></Box>
      <Box mt={5}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "secondary",
            mx: { xs: 0 }
          }}>
          <ResponsiveTabs value={selectedTabPanel} onChange={(_, newValue) => setSelectedTabPanel(newValue)}>
            <Tab label="Informazioni sull' opera" />
            <Tab label="Informazioni sull' artista" />
            <Tab label="Informazioni sulla galleria" />
          </ResponsiveTabs>
        </Box>
        <Box display="flex" justifyContent="center">
          <Box
            sx={{ minHeight: { md: "120px", maxWidth: `${theme.breakpoints.values.xl}px` }, width: "100%" }}
            display="flex"
            flexDirection="column"
            justifyContent="center">
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
        </Box>
        <Divider
          sx={{
            borderColor: "rgba(0, 0, 0, 0.87)",
            mb: { xs: 3, md: 8 },
            mx: { xs: 0 }
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
