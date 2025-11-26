import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { SwipeCard } from "../swipe-card";
import { artmatchService } from "../../services/artmatch-services";
import { Artwork } from "../../../../types/artwork";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../../../../hoc/AuthProvider";
import { useData } from "../../../../hoc/DataProvider";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "../../styles/artmatch.css";

const MainApp = () => {
  const [products, setProducts] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const auth = useAuth();
  const dataProvider = useData();

  // Carica i prodotti iniziali
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carica i prodotti dal backend
      const data = await artmatchService.getProducts(50); // Carica più prodotti per compensare il filtering

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
      dataProvider.addFavouriteArtwork(artwork.id.toString()).catch((err) => {
        console.error("Errore nel salvare il like:", err);
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

    // Ricarica nuovi prodotti quando si avvicina alla fine
    if (newIndex >= products.length - 2) {
      loadProducts();
    }
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