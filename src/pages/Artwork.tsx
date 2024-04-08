import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Link,
  Tab,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Artwork } from "../types/artwork.ts";
import TabPanel from "../components/TabPanel.tsx";
import ArtworksList from "../components/ArtworksList.tsx";
import ArtworkDetails from "../components/ArtworkDetails.tsx";
import {
  artworksToGalleryItems,
  formatCurrency,
  getArtworkDimensions,
  getDefaultPaddingX,
  getPropertyFromMetadata, parseDate
} from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { Gallery } from "../types/gallery.ts";
import GalleryDetails from "../components/GalleryDetails.tsx";
import { Share } from "@mui/icons-material";
import ArtistDetails from "../components/ArtistDetails.tsx";
import { Artist } from "../types/artist.ts";
import ResponsiveTabs from "../components/ResponsiveTabs.tsx";
import FavouriteIcon from "../components/icons/FavouriteIcon.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";
import FavouriteFilledIcon from "../components/icons/FavouriteFilledIcon.tsx";
import { FavouritesMap } from "../types/post.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import artworkLoanBannerIcon from "../assets/images/artwork_loan_banner_icon.svg";
import PromoCardSmall from "../components/PromoCardSmall.tsx";
import prenotaOpera from "../assets/images/prenota_opera.svg";
import richiediPrestito from "../assets/images/richiedi_prestito.svg";
import completaAcquisto from "../assets/images/completa_acquisto.svg";
import LoanCard from "../components/LoanCard.tsx";
import LockIcon from "../components/icons/LockIcon.tsx";
import HourglassIcon from "../components/icons/HourglassIcon.tsx";

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

  // const heroImgUrl = artwork?.images.length ? artwork.images[0].src : "";
  const isArtworkFavourite = artwork?.id ? favouriteArtworks.indexOf(artwork.id) !== -1 : false;

  const isOutOfStock = artwork?.stock_status === "outofstock";
  const isReserved = artwork?.acf.customer_buy_reserved || false;


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
        console.error(e);
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
    if (!artwork?.id) {
      return;
    }
    setIsReady(false);
    data
      .purchaseArtwork(+artwork.id, true)
      .then(() => {
        navigate("/accconto-blocca-opera");
      })
      .catch((e) => snackbar.error(e))
      .finally(() => setIsReady(true));
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
        data.getFavouriteArtworks().catch((e) => {
          snackbar.error(e);
          return [];
        })
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
    }).catch(err => {
      if (err === "Not found") {
        navigate("/errore/404");
      }
      throw err;
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

  let sliderHeight = "800px";
  if (belowSm) {
    sliderHeight = "auto";
  } else if (isMd) {
    sliderHeight = "660px";
  } else if (isLg) {
    sliderHeight = "720px";
  }
  const px = getDefaultPaddingX();

  return (
    <DefaultLayout
      pageLoading={!isReady}>
      <Box sx={{ px: { ...px, xs: 0 }, mt: { xs: 0, sm: 12, md: 18 } }} display="flex" justifyContent="center">
        <Grid sx={{ p: 0, mt: 0, justifyContent: "center", alignItems: "center" }} spacing={{ xs: 0, sm: 3 }}
              maxWidth="xl"
              container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              maxHeight: { xs: "auto", sm: "660px", md: "1820px" },
              width: { xs: "100%", sm: "auto" },
              overflow: "hidden",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center"
            }}>
            <img
              src={artwork?.images?.length ? artwork.images[0].src : ""}
              style={{ maxHeight: sliderHeight, maxWidth: "100%", objectFit: "contain" }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ px: { xs: px.xs, sm: 0 }, pt: { xs: 3, sm: 0 } }} display="flex"
                justifyContent="flex-start"
                flexDirection="column">
            <Box display="flex">
              <Typography sx={{ textTransform: "uppercase", mb: 3 }} color="primary" variant="body1">
                {galleryDetails?.display_name}
              </Typography>
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
            <Typography sx={{}} variant="h1">
              {artwork?.name}
            </Typography>
            <Typography variant="h1" color="textSecondary">
              {getPropertyFromMetadata(artwork?.meta_data || [], "artist")?.artist_name}
            </Typography>
            <Typography color="textSecondary" variant="body1" fontWeight={500} sx={{ mt: 2 }}>
              {artworkTechnique}
            </Typography>
            <Typography color="textSecondary" variant="body1" fontWeight={500}>
              {getArtworkDimensions(artwork)}
            </Typography>
            <Box mt={2}>
              <Typography variant="subtitle1" color="textSecondary">
                {artworkUnique}
              </Typography>
              <Typography sx={{ mt: 0 }} variant="subtitle1" color="textSecondary">
                {artworkCertificate}
              </Typography>
              {(isOutOfStock && !isReserved) &&
                <Typography sx={{ mt: 3 }} variant="subtitle1" color="textSecondary"><LockIcon color="error"
                                                                                               fontSize="inherit" /> Opera
                  non disponibile</Typography>}
              {(isReserved) &&
                <>
                  <Typography sx={{ mt: 3 }} variant="subtitle1" color="textSecondary">
                    <LockIcon color="error" fontSize="inherit" /> Opera prenotata. Trattativa in corso
                  </Typography>
                  <Typography sx={{ mt: 1 }} variant="subtitle1" color="textSecondary">
                    <HourglassIcon fontSize="inherit" /> Bloccata fino
                    al {parseDate(artwork?.acf.customer_reserved_until)}
                  </Typography>
                </>}
            </Box>
            <Divider sx={{ mt: 6 }} />
            <Box display="flex" alignItems="center" my={3}>
              <Typography variant="h2" sx={{ typography: { xs: "h4", sm: "h2" } }}>€ {artwork?.price}</Typography>
              <Box flexGrow={1} />
              <Button variant="contained" disabled={isOutOfStock || isReserved}
                      onClick={() => handlePurchase(artwork?.id)}>
                Compra opera
              </Button>
            </Box>
            <Divider />
            <Box mt={2} sx={{ my: 3 }} display="flex" alignItems="center" gap={1}>
              <Typography variant="h2" sx={{ typography: { xs: "h4", sm: "h2" } }}>
                € {formatCurrency(+(artwork?.price || 0) * data.downpaymentPercentage() / 100)}
              </Typography>
              <Box flexGrow={1} />
              <Box display="flex" flexDirection="column" alignItems="flex-end">
                <Button variant="outlined" disabled={isOutOfStock || isReserved} onClick={handleLoanPurchase}>
                  Prenota l’opera
                </Button>
                <Typography sx={{ mt: 1 }} variant="body2">Non sai come funziona? <Link color="inherit"
                                                                                        href="#scopri-di-piu">Scopri
                  di
                  più!</Link></Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box display="flex" sx={{
              background: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              alignItems: { xs: "flex-start", sm: "center" },
              py: 3,
              px: 3,
              borderRadius: "5px"
            }}>
              <img src={artworkLoanBannerIcon} style={{ transform: `translateX(-${theme.spacing(3)})` }} />
              <Box display="flex"
                   sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}
                   flexGrow={1}>
                <Typography variant="body2" color="white" sx={{ maxWidth: "248px" }}>
                  Per i tuoi acquisti d'arte su artpay, puoi scegliere la migliore proposta di prestito tra quelle degli
                  istituti bancari nostri partner.
                </Typography>
                <Box flexGrow={1} />
                <Link variant="body1" color="inherit" href="#scopri-di-piu" sx={{ mt: { xs: 3, sm: 0 } }}>Scopri di
                  più</Link>
              </Box>
            </Box>
            <Divider sx={{ mt: 3 }} />
            <Box
              display="flex"
              flexDirection={{ xs: "row", sm: "row" }}
              gap={{ xs: 3, sm: 0 }}
              mt={{ xs: 3 }}
              alignItems={{ xs: "center", md: "center" }}>
              <Box flexGrow={1} display="flex" flexDirection="column" sx={{ gap: { xs: 1, sm: 0 } }}>
                <Typography variant="subtitle1">
                  {galleryDetails?.display_name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">{galleryDetails?.address?.city}</Typography>
              </Box>
              <Box display="flex" flexDirection={{ xs: "row", sm: "column" }}
                   sx={{ mt: { xs: 0, sm: 0 } }}>
                <Button variant="text">Contatta la galleria</Button>
              </Box>
            </Box>
            <Divider sx={{ mt: 3 }} />
          </Grid>
        </Grid>
      </Box>
      <Box id="artwork-info" sx={{ top: "-100px", position: "relative" }}></Box>
      <Box px={px} mt={5}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "#CDCFD3",
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
            mb: { xs: 3, md: 8 },
            mx: { xs: 0 }
          }}
        />
      </Box>
      <Box sx={{ px: px }}>
        <ArtworksList disablePadding title="Opere dello stesso artista" items={artistArtworks || []} />
        <ArtworksList disablePadding title="Opere della galleria" items={galleryArtworks || []}
                      onSelect={handleGalleryArtworkSelect} />
        <ArtworksList disablePadding title="Simili per prezzo" items={[]} />
      </Box>
      <Grid sx={{ pt: 12, px: px }} spacing={3} display="flex" container>
        <Grid xs={12} item>
          <Typography variant="h2">
            Non vuoi farti sfuggire un’opera? <span style={{ color: theme.palette.primary.main }}>Prenotala!</span>
          </Typography>
          <Typography variant="subtitle1" sx={{ maxWidth: "400px", mt: 2 }}>
            Se sei intenzionato ad acquistare un’opera, non devi fare altro che prenotarla e non fartela scappare!
          </Typography>
        </Grid>
        <Grid xs={12} md={4} px={1} item>
          <PromoCardSmall
            imgSrc={prenotaOpera}
            title={
              <>
                Prenota <br />
                l’opera
              </>
            }
            text="Con una piccola quota bloccata sulla tua carta di credito, proporzionale al prezzo d’acquisto, prenoti l’opera che ti interessa e ti garantisci i diritti esclusivi d’acquisto. Dal momento della prenotazione, l’opera sarà riservata a tuo nome per 7 giorni. In caso di mancato acquisto, la somma sarà sbloccata entro 5 giorni lavorativi. "
          />
        </Grid>
        <Grid xs={12} md={4} px={1} item>
          <PromoCardSmall
            variant="secondary"
            imgSrc={richiediPrestito}
            title={
              <>
                Richiedi <br />
                un prestito
              </>
            }
            link="Scopri i nostri partner"
            linkHref="https://www.santanderconsumer.it/prestito/partner/artpay"
            text="Con artpay puoi finalmente accedere a prestiti personalizzati. Per i tuoi acquisti d'arte scegli la migliore proposta di prestito tra quelle degli istituti bancari nostri partner. Di norma l’approvazione avviene in poche ore. "
          />
        </Grid>
        <Grid xs={12} md={4} px={1} item>
          <PromoCardSmall
            variant="white"
            imgSrc={completaAcquisto}
            title={
              <>
                Completa l’acquisto <br />
                dell’opera
              </>
            }
            text="Ad acquisto avvenuto, l’opera è tua e avrai massima libertà di personalizzare le modalità di consegna, confrontandoti direttamente col personale della galleria d’arte responsabile della vendita."
          />
        </Grid>
      </Grid>
      <div style={{ top: "-80px", position: "relative", visibility: "hidden" }} id="scopri-di-piu" />
      <Box sx={{ px: { ...px, xs: 0 }, mt: 3, mb: 12 }}>
        <LoanCard />
      </Box>
    </DefaultLayout>
  );
};

export default Artwork;
