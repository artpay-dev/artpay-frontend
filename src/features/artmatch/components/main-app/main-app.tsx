import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { SwipeCard } from "../swipe-card";
import { artmatchService } from "../../services/artmatch-services";
import { Artwork } from "../../../../types/artwork";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../../../../hoc/AuthProvider";
import { useData } from "../../../../hoc/DataProvider";
import { useFiltersStore } from "../../store/filters-store";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "../../styles/artmatch.css";

interface MainAppProps {
  aiResults?: Artwork[] | null;
}

const MainApp = ({ aiResults }: MainAppProps) => {
  const [products, setProducts] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const auth = useAuth();
  const dataProvider = useData();
  const { filters } = useFiltersStore();

  // Carica i prodotti iniziali
  useEffect(() => {
    loadProducts();
  }, []);

  // Ricarica i prodotti quando cambiano i filtri
  useEffect(() => {
    // Non ricaricare al primo render (già gestito dall'useEffect precedente)
    if (products.length > 0) {
      loadProducts();
    }
  }, [filters]);

  // Aggiorna i prodotti quando arrivano risultati AI
  useEffect(() => {
    if (aiResults && aiResults.length > 0) {
      setProducts(aiResults);
      setCurrentIndex(0);
      // Reset swiper alla prima card
      if (swiperRef.current) {
        swiperRef.current.slideTo(0);
      }
    }
  }, [aiResults]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carica i prodotti dal backend con i filtri attivi
      const data = await artmatchService.getProducts(50, 0, filters); // Carica più prodotti per compensare il filtering

      // Se l'utente è autenticato, filtra le opere già viste
      if (auth.isAuthenticated) {
        try {
          const [likedIds, dislikedIds] = await Promise.all([
            dataProvider.getFavouriteArtworks(),
            dataProvider.getDislikedArtworks(),
          ]);

          // Crea un Set di tutti gli ID già visti (liked + disliked)
          const seenIds = new Set([...likedIds, ...dislikedIds]);

          // Filtra le opere per escludere quelle già viste
          const filteredProducts = data.filter((artwork) => !seenIds.has(artwork.id));

          setProducts(filteredProducts);
        } catch (filterErr) {
          console.error("Errore nel filtraggio dei prodotti:", filterErr);
          // In caso di errore, mostra comunque tutti i prodotti
          setProducts(data);
        }
      } else {
        setProducts(data);
      }

      setCurrentIndex(0);
    } catch (err) {
      console.error("Errore nel caricamento dei prodotti:", err);
      setError("Errore nel caricamento dei prodotti. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (artwork: Artwork) => {
    // Cambia card immediatamente
    moveToNext();

    // Salva il like in background usando il DataProvider
    try {
      if (!auth.isAuthenticated) {
        console.error("User not authenticated");
        auth.login();
        return;
      }

      // Salva il like
      dataProvider.addFavouriteArtwork(artwork.id.toString()).catch((err) => {
        console.error("Errore nel salvare il like:", err);
      });

      // Invia messaggio automatico alla galleria con prefisso "ArtMatch"
      const artworkName = artwork.name || "quest'opera";
      const artistName = artwork.acf?.artist?.[0]?.post_title || "questo artista";
      const message = `ArtMatch - Sono interessato a ${artworkName} di ${artistName}. Vorrei avere maggiori informazioni.`;

      dataProvider
        .sendQuestionToVendor({
          product_id: artwork.id,
          question: message,
        })
        .catch((err) => {
          console.error("Errore nell'invio del messaggio alla galleria:", err);
        });
    } catch (err) {
      console.error("Errore nel salvare il like:", err);
    }
  };

  const handleDislike = async (artwork: Artwork) => {
    // Cambia card immediatamente
    moveToNext();

    // Salva il dislike in background
    try {
      const authToken = auth.getAuthToken();
      if (!authToken) {
        console.error("User not authenticated");
        auth.login();
        return;
      }
      artmatchService.dislikeProduct(artwork.id, authToken).catch((err) => {
        console.error("Errore nel salvare il dislike:", err);
      });
    } catch (err) {
      console.error("Errore nel salvare il dislike:", err);
    }
  };

  const moveToNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setCurrentIndex(newIndex);
  };

  const handleReload = () => {
    loadProducts();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "600px",
          width: "fit-content",
        }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "600px",
          gap: 2,
        }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" onClick={handleReload} startIcon={<RefreshIcon />}>
          Riprova
        </Button>
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "600px",
          gap: 2,
        }}>
        <Typography variant="h6">Nessun prodotto disponibile</Typography>
        <Button variant="contained" onClick={handleReload} startIcon={<RefreshIcon />}>
          Ricarica
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "600px",
        width: "100%",
        padding: 4,
        position: "relative",
      }}>
      {/* Swiper con effetto cards */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          height: "720px",
        }}>
        <Swiper
          effect="cards"
          grabCursor={true}
          modules={[EffectCards]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          cardsEffect={{
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
          }}
          className="artmatch-swiper">
          {products.map((artwork, index) => (
            <SwiperSlide key={artwork.id}>
              <SwipeCard
                artwork={artwork}
                onLike={handleLike}
                onDislike={handleDislike}
                isTop={index === currentIndex}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default MainApp;