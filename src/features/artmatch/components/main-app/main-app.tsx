import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { SwipeCard } from "../swipe-card";
import { artmatchService } from "../../services/artmatch-services";
import { Artwork } from "../../../../types/artwork";
import RefreshIcon from "@mui/icons-material/Refresh";

const MainApp = () => {
  const [products, setProducts] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Carica i prodotti iniziali
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await artmatchService.getProducts(10);
      setProducts(data);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Errore nel caricamento dei prodotti:", err);
      setError("Errore nel caricamento dei prodotti. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (artwork: Artwork) => {
    await artmatchService.likeProduct(artwork.id);
    moveToNext();
  };

  const handleDislike = async (artwork: Artwork) => {
    await artmatchService.dislikeProduct(artwork.id);
    moveToNext();
  };

  const moveToNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= products.length) {
      // Ricarica nuovi prodotti quando finiscono
      loadProducts();
    } else {
      setCurrentIndex(nextIndex);
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

  const currentProduct = products[currentIndex];
  const nextProduct = currentIndex + 1 < products.length ? products[currentIndex + 1] : null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "600px",
        padding: 4,
        position: "relative",
      }}>
      {/* Container per le card */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          height: "600px",
        }}>
        {/* Card successiva (sfondo) */}
        {nextProduct && (
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: "scale(0.95)",
              opacity: 0.5,
            }}>
            <SwipeCard artwork={nextProduct} onLike={() => {}} onDislike={() => {}} />
          </Box>
        )}

        {/* Card corrente (in primo piano) */}
        {currentProduct && (
          <SwipeCard artwork={currentProduct} onLike={handleLike} onDislike={handleDislike} isTop={true} />
        )}
      </Box>
    </Box>
  );
};

export default MainApp;