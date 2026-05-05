import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import { useParams } from "react-router-dom";
import { Artwork } from "../types/artwork.ts";
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
import useToolTipStore from "../features/cdspayments/stores/tooltipStore-legacy.ts";
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
import paypal_card from "../assets/images/paypal_card.svg";
/*import revolut_pay from "../assets/images/revolut_pay_card.svg";
import google_pay from "../assets/images/google_pay_card.svg";*/
import { KLARNA_FEE, KLARNA_MAX_LIMIT } from "../constants.ts";
import { prepareDeposit, PrepareDepositRequest } from "@/services/depositPayment.ts";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  type: "deposit" | "balance";
}

const DepositDialog = ({ artwork, onClose, onOrderCreated, onDepositPaid }: {
  artwork: Artwork;
  onClose?: (value?: unknown) => void;
  onOrderCreated?: (orderId: number) => void;
  onDepositPaid?: () => void;
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment state
  const [orderId, setOrderId] = useState<number | null>(null);
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [depositClientSecret, setDepositClientSecret] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number | null>(null);

  const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

  // Payment status
  const [depositPaid, setDepositPaid] = useState(false);

  const elementsOptions = {
    appearance: {
      theme: "stripe" as const,
    },
  };

  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleCompleteOrder = () => {
    if (orderId) {
      if (onClose) onClose();
      navigate(`/saldo-opera/${orderId}`);
    }
  };

  const handlePrepareDeposit = async () => {
    if (!artwork?.id) return;

    setError(null);
    setLoading(true);

    // Reset payment states
    setDepositPaid(false);
    setDepositClientSecret(null);
    // setBalanceClientSecret(null)

    try {
      const requestData: PrepareDepositRequest = {
        products: [
          {
            product_id: Number(artwork?.id),
            quantity: parseInt('1'),
          },
        ],
        billing_address: {
          first_name: "Giacomo",
          last_name: "Bartoli",
          address_1: "Via Roma 1",
          city: "Milano",
          postcode: "20100",
          country: "IT",
          email: "john@example.com",
          phone: "1234567890",
        },
        deposit_type: 'percentage',
        deposit_value: parseFloat('30'),
      };

      const response = await prepareDeposit(requestData);

      if (response.success) {
        setOrderId(response.data.order_id);
        setStripePublishableKey(response.data.stripe_publishable_key);
        setDepositClientSecret(response.data.client_secret);
        setDepositAmount(response.data.deposit_amount);
        setBalanceAmount(response.data.balance_amount);
        setShowPaymentForm(true);
        if (onOrderCreated) onOrderCreated(response.data.order_id);

        // Save order data to localStorage for recovery after redirect
        localStorage.setItem(
          "deposit-test-order",
          JSON.stringify({
            orderId: response.data.order_id,
            stripePublishableKey: response.data.stripe_publishable_key,
            depositAmount: response.data.deposit_amount,
            balanceAmount: response.data.balance_amount,
          }),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to prepare deposit");
    } finally {
      setLoading(false);
    }
  };

  const handleDepositPaymentSuccess = () => {
    setDepositClientSecret(null);
    setDepositPaid(true);
    if (onDepositPaid) onDepositPaid();
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1, padding: 3 }}>
      {/* Messaggi di errore e successo in alto */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {depositPaid ? (
        <div className="flex flex-col gap-4">
          {/* Conferma pagamento */}
          <div className="rounded-lg bg-[#42B3961A] border border-[#42B396] p-4 flex flex-col gap-1">
            <span className="font-semibold text-[#42B396]">Acconto pagato con successo</span>
            <span className="text-sm text-secondary">
              Hai versato <strong>€ {formatCurrency(depositAmount || 0)}</strong> di acconto.
              Il saldo residuo è <strong>€ {formatCurrency(balanceAmount || 0)}</strong>.
            </span>
          </div>

          {/* Prossimi passi */}
          <div className="rounded-lg bg-[#F5F5F5] p-4 flex flex-col gap-3">
            <span className="font-semibold text-sm">Prossimi passi</span>
            <ol className="list-decimal pl-4 space-y-2 text-sm">
              <li>
                {(() => {
                  const balance = balanceAmount || 0;
                  const opts = [
                    { name: "Klarna", min: 30, max: 2500 },
                    { name: "PayPal Pay Later", min: 30, max: 2000 },
                    { name: "Santander", min: 1500, max: 30000 },
                  ].filter(({ min, max }) => balance >= min && balance <= max).map(o => o.name);
                  const label = opts.length > 0 ? opts.join(", ") : "Carta di credito";
                  const title = opts.length === 1 ? `Paga il saldo con ${opts[0]}` : "Scegli come pagare il saldo";
                  return (
                    <>
                      <span className="font-medium">{title}</span>
                      {opts.length !== 1 && <p className="text-secondary text-xs mt-0.5">{label}</p>}
                    </>
                  );
                })()}
              </li>
              <li>
                <span className="font-medium">Completa la richiesta</span>
                <p className="text-secondary text-xs mt-0.5">Pochi passaggi, approvazione rapida</p>
              </li>
              <li>
                <span className="font-medium">L'opera è tua</span>
                <p className="text-secondary text-xs mt-0.5">Dopo l'approvazione verrai contattato per programmare la spedizione</p>
              </li>
            </ol>
          </div>

          <button
            onClick={handleCompleteOrder}
            className="artpay-button-style w-full bg-primary hover:bg-primary-hover text-white">
            Completa l'ordine →
          </button>

          <p className="text-xs text-secondary text-center">
            Puoi trovare il tuo ordine anche nella <strong>tua area personale</strong>
          </p>
        </div>
      ) : (
        <>
          <Typography variant="body1">
            Con artpay puoi acquistare l'opera pagando subito solo un <strong>acconto del 30%</strong> con carta, e
            scegliere come finanziare il restante importo.
          </Typography>

          {/* Step 1 – Acconto */}
          <Box sx={{ border: "1px solid #E2E6FC", borderRadius: "12px", overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: "#F8F9FF", borderBottom: "1px solid #E2E6FC" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                1 · Paga l'acconto ora
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2">30% del totale — <strong>solo con carta</strong></Typography>
                <Typography variant="caption" color="text.secondary">Pagamento sicuro via Stripe</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                € {formatCurrency(depositAmount || (Number(artwork?.price) * 0.3))}
              </Typography>
            </Box>
          </Box>

          {/* Step 2 – Saldo */}
          <Box sx={{ border: "1px solid #E2E6FC", borderRadius: "12px", overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: "#F8F9FF", borderBottom: "1px solid #E2E6FC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                2 · Finanzia il saldo
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                € {formatCurrency(balanceAmount || (Number(artwork?.price) * 0.7))}
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
              {(() => {
                const balance = balanceAmount || (Number(artwork?.price) * 0.7);
                const options = [
                  { name: "Klarna", desc: "Paga in 3 rate senza interessi", range: "€ 30 – € 2.500", min: 30, max: 2500 },
                  { name: "PayPal Pay Later", desc: "Paga in 3 rate", range: "€ 30 – € 2.000", min: 30, max: 2000 },
                  { name: "Santander", desc: "Finanziamento rateale", range: "€ 1.500 – € 30.000", min: 1500, max: 30000 },
                ].filter(({ min, max }) => balance >= min && balance <= max);

                if (options.length === 0) {
                  return (
                    <Typography variant="caption" color="text.secondary">
                      Nessuna opzione di finanziamento disponibile per questo importo. Potrai pagare il saldo con carta.
                    </Typography>
                  );
                }

                return options.map(({ name, desc, range }) => (
                  <Box key={name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{name}</Typography>
                      <Typography variant="caption" color="text.secondary">{desc}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap", ml: 1 }}>{range}</Typography>
                  </Box>
                ));
              })()}
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary">
            * Il finanziamento del saldo è soggetto ad approvazione. Potrai scegliere il metodo dopo aver pagato l'acconto.
          </Typography>

          {showPaymentForm && depositClientSecret && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Paga l'acconto del 30%
              </Typography>
              <Elements stripe={stripePromise} options={{ ...elementsOptions, clientSecret: depositClientSecret }}>
                <PaymentForm onSuccess={handleDepositPaymentSuccess} onError={handlePaymentError} type="deposit" />
              </Elements>
            </Box>
          )}

          {!showPaymentForm && (
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrepareDeposit}
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}>
              {loading ? <CircularProgress size={24} /> : "Procedi con acconto e finanziamento"}
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

function PaymentForm({ onSuccess, onError, type }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/deposit?payment_type=${type}`,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Pagamento fallito");
      } else {
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Pagamento fallito");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" variant="contained" fullWidth disabled={!stripe || processing} sx={{ mt: 3 }}>
        {processing ? <CircularProgress size={24} /> : `Paga ${type === "deposit" ? "l'acconto" : "il saldo"}`}
      </Button>
    </form>
  );
}

const ArtworkPage: React.FC = () => {
  const data = useData();
  const auth = useAuth();
  const urlParams = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const theme = useTheme();
  const snackbar = useSnackbars();
  const { showToolTip } = useToolTipStore();

  const [isReady, setIsReady] = useState(false);
  const [artwork, setArtwork] = useState<Artwork>();
  const [artistArtworks, setArtistArtworks] = useState<ArtworkCardProps[]>();
  const [galleryDetails, setGalleryDetails] = useState<Gallery | undefined>();
  const [artistDetails, setArtistDetails] = useState<Artist | undefined>();
  const [favouriteArtworks, setFavouriteArtworks] = useState<number[]>([]);
  const [favouriteGalleries, setFavouriteGalleries] = useState<number[]>();
  const [hasCheckedFollow, setHasCheckedFollow] = useState(false);
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



  const handleDepositDialog = async () => {
    if (!artwork) return;

    let pendingOrderId: number | null = null;
    let depositCompleted = false;

    await dialogs.custom(
      "Acconto + Finanziamento",
      (closeDialog) => (
        <DepositDialog
          artwork={artwork}
          onClose={closeDialog}
          onOrderCreated={(id) => { pendingOrderId = id; }}
          onDepositPaid={() => { depositCompleted = true; }}
        />
      ),
      { maxWidth: "md", fullScreen: belowSm },
    );

    // Dialog chiuso: annulla l'ordine se non è stato pagato l'acconto
    if (!depositCompleted && pendingOrderId) {
      data.setOrderStatus(pendingOrderId, "cancelled").catch(console.error);
      localStorage.removeItem("deposit-test-order");
    }
  };

  useEffect(() => {
    const fetchArtworkData = async () => {
      if (!urlParams.slug_opera) {
        navigate("/");
        return;
      }

      try {
        const artwork = await data.getArtworkBySlug(urlParams.slug_opera);
        setArtwork(artwork);

        const [galleryArtworks, favouriteArtworks, favouriteGalleries, galleryDetails, artistDetails, userProfile] =
          await Promise.all([
            data.listArtworksForGallery(artwork.vendor as string),
            data.getFavouriteArtworks().catch(() => []),
            data.getFavouriteGalleries().catch(() => []),
            artwork.vendor ? data.getGallery(artwork.vendor as string) : Promise.resolve(undefined),
            getPropertyFromMetadata(artwork.meta_data, "artist")?.ID
              ? data.getArtist(getPropertyFromMetadata(artwork.meta_data, "artist")!.ID)
              : Promise.resolve(undefined),
            auth.isAuthenticated ? data.getUserProfile().catch(() => undefined) : Promise.resolve(undefined),
          ]);

        setFavouriteArtworks(favouriteArtworks);
        setFavouriteGalleries(favouriteGalleries);
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

  // Controlla se l'utente segue la galleria e gestisce il follow automatico
  useEffect(() => {
    if (!auth.isAuthenticated || !galleryDetails?.id || !favouriteGalleries || hasCheckedFollow) {
      return;
    }

    const isFollowing = favouriteGalleries.indexOf(galleryDetails.id) !== -1;

    // Se l'utente non segue la galleria
    if (!isFollowing) {
      // Se non ha nessuna galleria seguita, seguila automaticamente
      if (favouriteGalleries.length === 0) {
        data
          .addFavouriteGallery(galleryDetails.id.toString())
          .then(() => {
            showToolTip({
              message: "Hai iniziato a seguire questa galleria!",
              visible: true,
              type: "success",
            });
          })
          .catch((e) => {
            console.error("Error auto-following gallery:", e);
          });
      } else {
        // Altrimenti mostra un tooltip/snackbar che invita a seguire
        snackbar.snackbar(<Alert severity="info">Segui questa galleria per vederla nel tuo feed!</Alert>);
      }
    }

    setHasCheckedFollow(true);
  }, [favouriteGalleries, galleryDetails?.id, auth.isAuthenticated, hasCheckedFollow]);

  const px = useMemo(() => getDefaultPaddingX(), []);

  return (
    <DefaultLayout pageLoading={!isReady}>
      {!isReady ? (
        <ArtworkPageSkeleton />
      ) : (
        <Box className={"md:mt-18"} display="flex" justifyContent="center" overflow={"visible"}>
          <div className={"flex flex-col w-full lg:flex-row "}>
            <div className={"w-full max-w-2xl lg:min-w-sm lg:min-h-screen rounded-b-2xl md:rounded-2xl"}>
              <img
                src={artwork?.images?.length ? artwork.images[0].woocommerce_single : ""}
                alt={artwork?.images[0]?.name}
                className={` object-contain sticky top-35 w-full rounded-b-2xl md:rounded-2xl max-h-[600px]`}
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
                sx={{
                  background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                  boxShadow: "0 4px 20px rgba(33, 150, 243, 0.15)",
                  border: "2px solid #2196F3",
                }}
                borderRadius={2}
                padding={3}
                position="relative"
                gap={3}>
                {/* Badge NOVITÀ */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -12,
                    left: 16,
                    bgcolor: "#FFD700",
                    color: "#000",
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                  }}>
                  ✨ Novità
                </Box>

                <Box gap={1.5} display="flex" flexDirection={"column"} mt={1}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#0D47A1" }}>
                    Paga ora solo {formatCurrency((+(artwork?.price || 0) * 30) / 100)} €
                  </Typography>

                  <Typography variant="body1" sx={{ color: "#1565C0" }}>
                    Blocca subito l'opera pagando solo il <strong>30% di acconto</strong> e finanzia il restante importo in modo semplice e veloce.
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: "rgba(33, 150, 243, 0.1)",
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      border: "1px solid rgba(33, 150, 243, 0.2)",
                    }}>
                    <Typography variant="caption" sx={{ color: "#1565C0", fontSize: "0.875rem" }}>
                      Processo sicuro e veloce • Nessun costo nascosto
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDepositDialog}
                  sx={{
                    fontWeight: 600,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                    },
                    transition: "all 0.3s ease",
                  }}>
                  Scopri come funziona →
                </Button>
              </Box>
              <Box
                display="flex"
                flexDirection={"column"}
                mt={4}
                bgcolor={"#EFF1FF"}
                borderRadius={2}
                padding={2}
                position="relative">
                <div className={"flex w-full justify-between items-center pb-6 relative"}>
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
                  <ul className={"flex flex-col gap-6 divide-y divide-[#010F22]/20 text-secondary leading-6 w-full "}>
                    <li className={"flex justify-between items-start lg:items-center pb-6"}>
                      <span>Unica soluzione</span>
                      <div className={"flex gap-2 flex-wrap max-w-40 lg:max-w-none"}>
                        <img src={cards_group} alt={"Other payment cards "} />
                        <img src={paypal_card} alt={"PayPal card "} className={"size-10"} />
                        {/*<img src={revolut_pay} alt={"Revolut Pay card "} className={'size-10'} />
                        <img src={google_pay} alt={"Google Pay cards "} className={'h-10'}/>*/}
                      </div>
                    </li>
                    {Number(artwork?.price) * KLARNA_FEE <= KLARNA_MAX_LIMIT && (
                      <li className={"flex justify-between items-center "}>
                        <span>Pagamento dilazionato</span>
                        <div className={"flex gap-2"}>
                          <img src={paypal_card} alt={"Paypal payment Card "} className={"size-10"} />
                          <img src={klarna_card} alt={"Klarna payment Card "} />
                        </div>
                      </li>
                    )}
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
                    <Typography variant="body1" sx={{ maxWidth: "400px" }}>
                      Registrati per vedere il prezzo e comprare
                    </Typography>
                    <Button variant="contained" onClick={() => auth.login(true)} sx={{ mt: 2 }}>
                      Registrati ora
                    </Button>
                  </Box>
                )}
              </Box>

              {Number(artwork?.price) >= 2500 && auth.isAuthenticated && (
                <>
                  <Box
                    mt={3}
                    sx={{ my: 3 }}
                    display="flex"
                    flexDirection={"column"}
                    gap={1}
                    bgcolor={"#FAFAFB"}
                    borderRadius={2}
                    padding={2}>
                    <div className={"flex w-full justify-between items-center pb-6"}>
                      <Typography variant="h2" sx={{ typography: { xs: "h4", sm: "h2" } }}>
                        € {formatCurrency((+(artwork?.price || 0) * data.downpaymentPercentage()) / 100)}
                      </Typography>
                      <Button variant="outlined" disabled={isOutOfStock || isReserved} onClick={handleLoanPurchase}>
                        Prenota l'opera
                      </Button>
                    </div>
                    <div className={"mb-6 border-b border-[#010F22]/20 pb-6 flex justify-between"}>
                      <p className={" text-secondary"}>Prenota l’opera e paga a rate</p>
                      <img src={santander_card} alt={"Santender payment Card "} />
                    </div>
                    <div className={" text-secondary space-y-2"}>
                      <p>Come funziona?</p>
                      <ol className={"list-decimal ps-5 space-y-2"}>
                        <li>
                          Prenota l’opera per 7 giorni versando solo il 5%. <br />
                          <span className={"text-sm"}>(Se non concludi l’acquisto, ti rimborsiamo tutto.)</span>
                        </li>
                        <li>
                          Richiedi il prestito. <br />
                          <span className={"text-sm"}>(Soggetto ad approvazione dell'istituto di credito.)</span>
                        </li>
                        <li>Concludi l’acquisto e transazione su artpay.</li>
                      </ol>
                      <p className={"mt-6 text-xs"}>
                        <a href="#" className={" text-primary underline"}>
                          Vuoi saperne di più? Leggi qui
                        </a>
                      </p>
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

export default ArtworkPage;
