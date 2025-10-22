import { Box, Button, Divider, IconButton, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useParams } from "react-router-dom";
import type { Artwork } from "../types/artwork.ts";
import ArtworksList from "../components/ArtworksList.tsx";
import ArtworkDetails from "../components/ArtworkDetails.tsx";
import {
  artworksToGalleryItems,
  artworkToGalleryItem,
  formatCurrency,
  getArtworkDimensions,
  getDefaultPaddingX,
  getPropertyFromMetadata,
  parseDate,
  useNavigate,
} from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { Gallery } from "../types/gallery.ts";
import GalleryDetails from "../components/GalleryDetails.tsx";
import ArtistDetails from "../components/ArtistDetails.tsx";
import { Artist } from "../types/artist.ts";
import FavouriteIcon from "../components/icons/FavouriteIcon.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";
import FavouriteFilledIcon from "../components/icons/FavouriteFilledIcon.tsx";
import { FavouritesMap } from "../types/post.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import LockIcon from "../components/icons/LockIcon.tsx";
import HourglassIcon from "../components/icons/HourglassIcon.tsx";
import ShareIcon from "../components/icons/ShareIcon.tsx";
import MessageDialog from "../components/MessageDialog.tsx";
import { UserProfile } from "../types/user.ts";
import ArtworkIcon from "../components/icons/ArtworkIcon.tsx";
import CertificateIcon from "../components/icons/CertificateIcon.tsx";
import QrCodeIcon from "../components/icons/QrCodeIcon.tsx";
import ArtworkPageSkeleton from "../components/ArtworkPageSkeleton.tsx";
import CardGridSkeleton from "../components/CardGridSkeleton.tsx";
import klarna_card from "../assets/images/klarnacard.svg";
import santander_card from "../assets/images/santandercard.svg";
import cards_group from "../assets/images/cardsgroup.svg";
import MiniLockerIcon from "../components/icons/MiniLockerIcon.tsx";

const Artwork: React.FC = () => {
  const data = useData();
  const auth = useAuth();
  const urlParams = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const theme = useTheme();
  const snackbar = useSnackbars();

  const [isReady, setIsReady] = useState(false);
  const [artwork, setArtwork] = useState<Artwork>();
  const [artistArtworks, setArtistArtworks] = useState<ArtworkCardProps[]>();
  const [galleryDetails, setGalleryDetails] = useState<Gallery | undefined>();
  const [artistDetails, setArtistDetails] = useState<Artist | undefined>();
  const [favouriteArtworks, setFavouriteArtworks] = useState<number[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const belowSm = useMediaQuery(theme.breakpoints.down("sm"));

  const artworkTechnique = useMemo(
    () => (artwork ? data.getCategoryMapValues(artwork, "tecnica").join(" ") : ""),
    [artwork, data],
  );
  const artworkCertificate = useMemo(
    () => (artwork ? data.getCategoryMapValues(artwork, "certificato").join(" ") : ""),
    [artwork, data],
  );
  const artworkUnique = useMemo(
    () => (artwork ? data.getCategoryMapValues(artwork, "rarita").join(" ") : ""),
    [artwork, data],
  );

  const isArtworkFavourite = useMemo(
    () => (artwork?.id ? favouriteArtworks.includes(artwork.id) : false),
    [artwork?.id, favouriteArtworks],
  );

  const isOutOfStock = useMemo(() => artwork?.stock_status === "outofstock", [artwork?.stock_status]);
  const isReserved = useMemo(() => artwork?.acf.customer_buy_reserved || false, [artwork?.acf.customer_buy_reserved]);

  const handleShare = useCallback(async () => {
    await dialogs.share(window.location.href);
  }, [dialogs]);

  const handleShowQrCode = useCallback(() => {
    const qrUrl = `${window.location.protocol}//${window.location.host}/opere/${artwork?.slug}`;
    dialogs.qrCode(qrUrl);
  }, [artwork?.slug, dialogs]);

  const handleSendMessage = useCallback(async () => {
    if (!artwork) {
      return;
    }
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    await dialogs.custom(
      "Invia un messaggio alla galleria",
      (closeDialog) => {
        return (
          <MessageDialog
            galleryName={galleryDetails?.display_name}
            data={data}
            userProfile={userProfile}
            artwork={artworkToGalleryItem(artwork)}
            closeDialog={closeDialog}
          />
        );
      },
      { maxWidth: "md", fullScreen: belowSm },
    );
  }, [artwork, auth, dialogs, galleryDetails?.display_name, data, userProfile, belowSm]);

  const handleSetArtworkFavourite = useCallback(async () => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (artwork?.id) {
      try {
        const resp = isArtworkFavourite
          ? await data.removeFavouriteArtwork(artwork.id.toString())
          : await data.addFavouriteArtwork(artwork.id.toString());
        setFavouriteArtworks(resp);
      } catch (e) {
        console.error(e);
        snackbar.error(e);
      }
    }
  }, [auth, artwork?.id, isArtworkFavourite, data, snackbar]);

  const handlePurchase = useCallback(
    (artworkId?: number) => {
      if (!artworkId) {
        return;
      }
      setIsReady(false);
      data
        .purchaseArtwork(artworkId)
        .then(() => {
          navigate("/acquisto");
        })
        .catch((e) => {
          console.error(e);
          snackbar.error("Si è verificato un errore");
          setIsReady(true);
        });
    },
    [data, navigate, snackbar],
  );

  const handleLoanPurchase = useCallback(() => {
    if (!artwork?.id) {
      return;
    }
    setIsReady(false);
    data
      .purchaseArtwork(+artwork.id, true)
      .then(() => {
        navigate("/acconto-blocca-opera");
      })
      .catch((e) => snackbar.error(e))
      .finally(() => setIsReady(true));
  }, [artwork?.id, data, navigate, snackbar]);

  useEffect(() => {
    const fetchArtworkData = async () => {
      if (!urlParams.slug_opera) {
        navigate("/");
        return;
      }

      try {
        const artwork = await data.getArtworkBySlug(urlParams.slug_opera);
        setArtwork(artwork);

        const [galleryArtworks, favouriteArtworks, galleryDetails, artistDetails, userProfile] = await Promise.all([
          data.listArtworksForGallery(artwork.vendor),
          data.getFavouriteArtworks().catch(() => []),
          artwork.vendor ? data.getGallery(artwork.vendor) : Promise.resolve(undefined),
          getPropertyFromMetadata(artwork.meta_data, "artist")?.ID
            ? data.getArtist(getPropertyFromMetadata(artwork.meta_data, "artist")!.ID)
            : Promise.resolve(undefined),
          auth.isAuthenticated ? data.getUserProfile().catch(() => undefined) : Promise.resolve(undefined),
        ]);

        setFavouriteArtworks(favouriteArtworks);
        setGalleryDetails(galleryDetails);
        setArtistDetails(artistDetails);
        setUserProfile(userProfile);

        if (artistDetails) {
          const artworkIds = new Set((artistDetails.artworks || []).map((a) => a.ID.toString()));
          setArtistArtworks(artworksToGalleryItems(galleryArtworks.filter((a) => artworkIds.has(a.id.toString()))));
        }

        setIsReady(true);
      } catch (err) {
        if (err === "Not found") {
          navigate("/errore/404");
        }
        console.error(err);
        setIsReady(true);
      }
    };

    void fetchArtworkData();
  }, []);

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

  const px = useMemo(() => getDefaultPaddingX(), []);

  return (
    <DefaultLayout pageLoading={!isReady}>
      {!isReady ? (
        <ArtworkPageSkeleton />
      ) : (
        <Box sx={{ mt: { xs: 0, sm: 12, md: 18 } }} display="flex" justifyContent="center" overflow={"visible"}>
          <div className={"flex flex-col w-full lg:flex-row "}>
            <div
              className={
                "w-full max-w-2xl lg:min-w-sm rounded-b-2xl md:rounded-2xl overflow-hidden lg:sticky lg:top-6 lg:self-start"
              }>
              <img
                src={artwork?.images?.length ? artwork.images[0].woocommerce_single : ""}
                alt={artwork?.images[0]?.name}
                className={` object-contain w-full rounded-b-2xl md:rounded-2xl `}
              />
            </div>
            <div className={"flex flex-col pt-6 lg:0 max-w-2xl px-8 md:px-8"}>
              <div className={"flex items-center mb-2"}>
                <Typography
                  sx={{ textTransform: "uppercase", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                  color="primary"
                  variant="body1">
                  <Link
                    sx={{ textDecoration: "none" }}
                    onClick={() => navigate(`/gallerie/${galleryDetails?.shop?.slug}`)}>
                    {galleryDetails?.display_name}
                  </Link>
                </Typography>
                <Box flexGrow={1} />
                <IconButton onClick={handleSetArtworkFavourite}>
                  {isArtworkFavourite ? (
                    <FavouriteFilledIcon color="primary" fontSize="small" />
                  ) : (
                    <FavouriteIcon fontSize="small" />
                  )}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
                <IconButton onClick={handleShowQrCode} size="medium">
                  <QrCodeIcon />
                </IconButton>
              </div>
              <Typography variant="h1">{artwork?.name}</Typography>
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
                  <ArtworkIcon sx={{ mr: 0.5 }} fontSize="inherit" /> {artworkUnique}
                </Typography>
                <Typography sx={{ mt: 0 }} variant="subtitle1" color="textSecondary">
                  <CertificateIcon sx={{ mr: 0.5 }} fontSize="inherit" /> {artworkCertificate}
                </Typography>
                {isOutOfStock && !isReserved && (
                  <Typography sx={{ mt: 3 }} variant="subtitle1" color="textSecondary">
                    <LockIcon color="error" fontSize="inherit" /> Opera non disponibile
                  </Typography>
                )}
                {isReserved && (
                  <>
                    <Typography sx={{ mt: 3 }} variant="subtitle1" color="textSecondary">
                      <LockIcon color="error" fontSize="inherit" /> Opera prenotata. Trattativa in corso
                    </Typography>
                    <Typography sx={{ mt: 1 }} variant="subtitle1" color="textSecondary">
                      <HourglassIcon fontSize="inherit" /> Bloccata fino al{" "}
                      {parseDate(artwork?.acf.customer_reserved_until)}
                    </Typography>
                  </>
                )}
              </Box>
              <Box
                display="flex"
                flexDirection={"column"}
                mt={12}
                bgcolor={"#EFF1FF"}
                borderRadius={2}
                padding={2}
                position="relative">
                <div className={"flex w-full justify-between items-center mb-6 border-b border-[#010F22]/20  pb-6"}>
                  <Typography variant="h2" sx={{ typography: { xs: "h4", sm: "h2" } }}>
                    € {formatCurrency(+(artwork?.price || 0))}
                  </Typography>
                  <Button
                    variant="contained"
                    disabled={isOutOfStock || isReserved}
                    onClick={() => handlePurchase(artwork?.id)}>
                    Compra opera
                  </Button>
                </div>
                <div className={"flex flex-col w-full md:flex-row justify-between space-y-4 md:space-y-0"}>
                  <p className={"text-secondary leading-6"}>Metodi di pagamento</p>
                  <ul className={"flex gap-2"}>
                    <li>
                      <img src={klarna_card} alt={"Klarna payment Card "} />
                    </li>
                    <li>
                      <img src={santander_card} alt={"Santander payment Card "} />
                    </li>
                    <li>
                      <img src={cards_group} alt={"Other payment cards "} />
                    </li>
                  </ul>
                </div>

                {/* Blur overlay for non-authenticated users */}
                {!auth.isAuthenticated && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    sx={{
                      backdropFilter: "blur(8px)",
                      backgroundColor: "rgba(239, 241, 255, 0.8)",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      padding: 3,
                      textAlign: "center",
                    }}>
                    <Typography variant="body1"  sx={{ maxWidth: "400px" }}>
                      Registrati per vedere il prezzo e comprare
                    </Typography>
                    <Button variant="contained" onClick={() => auth.login(true)} sx={{ mt: 2 }}>
                      Registrati ora
                    </Button>
                  </Box>
                )}
              </Box>

              {auth.isAuthenticated && (
                <>
                  <Box
                    mt={3}
                    sx={{ my: 3 }}
                    display="flex"
                    flexDirection={"column"}
                    gap={1}
                    bgcolor={"#FAFAFB"}
                    borderRadius={2}
                    padding={2}
                    position="relative">
                    <div className={"flex w-full justify-between items-center mb-6 border-b border-[#010F22]/20  pb-6"}>
                      <Typography variant="h2" sx={{ typography: { xs: "h4", sm: "h2" } }}>
                        € {formatCurrency((+(artwork?.price || 0) * data.downpaymentPercentage()) / 100)}
                      </Typography>
                      <Button variant="outlined" disabled={isOutOfStock || isReserved} onClick={handleLoanPurchase}>
                        Prenota ora
                      </Button>
                    </div>
                    <div className={"flex justify-between items-center gap-4"}>
                      <p className={"text-sm text-secondary text-balance "}>
                        Blocchi l'opera per 7 giorni versando solo il 5%. Se non concludi l'acquisto, ti rimborsiamo
                        tutto
                      </p>
                      <MiniLockerIcon className={"size-16 md:size-8"} />
                    </div>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                </>
              )}
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={{ xs: 3, sm: 0 }}
                mt={{ xs: 3 }}
                alignItems={{ xs: "center", md: "center" }}>
                <Box
                  flexGrow={1}
                  display="flex"
                  flexDirection={{ xs: "row", sm: "column" }}
                  sx={{ gap: { xs: 1, sm: 1 } }}>
                  <Typography variant="subtitle1">{galleryDetails?.display_name}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {galleryDetails?.address?.city}
                  </Typography>
                </Box>
                <Box display="flex" flexDirection={{ xs: "row", sm: "column" }} sx={{ mt: { xs: 0, sm: 0 } }}>
                  <Button variant="text" onClick={handleSendMessage}>
                    Contatta la galleria
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ mt: 3 }} />
              <div className={`px-[${px}] mt-6`}>
                <div className={"flex flex-col justify-center gap-6"}>
                  {artwork && <ArtworkDetails artwork={artwork} artist={artistDetails} />}
                  <Divider />
                  {artistDetails && <ArtistDetails artist={artistDetails} />}
                  <Divider />
                  {galleryDetails && <GalleryDetails gallery={galleryDetails} />}
                  <Divider />
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}

      <Box className={"py-24"}>
        <Typography sx={{ mb: { xs: 3, md: 6 }, px: { xs: 4, sm: 0 } }} marginTop={6} variant="h2">
          Opere che ti potrebbero piacere
        </Typography>
        {!artistArtworks ? <CardGridSkeleton count={4} /> : <ArtworksList disablePadding items={artistArtworks} />}

        <ArtworksList disablePadding title="Simili per prezzo" items={[]} />
      </Box>
    </DefaultLayout>
  );
};

export default Artwork;
