import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Typography, Button, Grid, Card, CardMedia, CardContent, IconButton } from "@mui/material";
import { SwipeCard } from "../swipe-card";
import { artmatchService } from "../../services/artmatch-services";
import { Artwork } from "../../../../types/artwork";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useAuth } from "../../../../hoc/AuthProvider";
import { useData } from "../../../../hoc/DataProvider";
import { useFiltersStore } from "../../store/filters-store";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useNavigate } from "react-router-dom";

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
  const [showAiGrid, setShowAiGrid] = useState<boolean>(false);
  const [aiGridResults, setAiGridResults] = useState<Artwork[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const touchStartX = useRef<number>(0);
  const swipeStartIndex = useRef<number>(0);
  const isForceSliding = useRef<boolean>(false);
  const auth = useAuth();
  const dataProvider = useData();
  const { filters } = useFiltersStore();
  const navigate = useNavigate();

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
      setAiGridResults(aiResults);
      setShowAiGrid(true);
    }
  }, [aiResults]);

  const handleCloseAiGrid = () => {
    setShowAiGrid(false);
    setAiGridResults([]);
  };

  const handleArtworkClick = (artwork: Artwork) => {
    navigate(`/opere/${artwork.slug}`);
  };

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

  const handleLike = async (artwork: Artwork, autoAdvance: boolean = true) => {
    // Cambia card immediatamente solo se siamo nello swiper e autoAdvance è true
    if (!showAiGrid && autoAdvance) {
      moveToNext();
    } else if (showAiGrid) {
      // Nella griglia, rimuovi la card dalla lista
      setAiGridResults((prev) => prev.filter((item) => item.id !== artwork.id));
    }

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

  const handleDislike = async (artwork: Artwork, autoAdvance: boolean = true) => {
    // Cambia card immediatamente solo se siamo nello swiper e autoAdvance è true
    if (!showAiGrid && autoAdvance) {
      moveToNext();
    } else if (showAiGrid) {
      // Nella griglia, rimuovi la card dalla lista
      setAiGridResults((prev) => prev.filter((item) => item.id !== artwork.id));
    }

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

  const handleTouchStart = (swiper: SwiperType, event: TouchEvent | MouseEvent | PointerEvent) => {
    if ('touches' in event) {
      touchStartX.current = event.touches[0].clientX;
    } else {
      touchStartX.current = event.clientX;
    }
    swipeStartIndex.current = swiper.activeIndex;
  };

  const handleTouchEnd = (swiper: SwiperType, event: TouchEvent | MouseEvent | PointerEvent) => {
    let touchEndX: number;

    if ('changedTouches' in event) {
      touchEndX = event.changedTouches[0].clientX;
    } else {
      touchEndX = event.clientX;
    }

    const diff = touchEndX - touchStartX.current;
    const threshold = 50; // Soglia minima di movimento in pixel

    // Se lo swipe è significativo
    if (Math.abs(diff) > threshold) {
      const swipedArtwork = products[swipeStartIndex.current];

      if (diff > 0) {
        // Swipe verso destra = Like
        handleLike(swipedArtwork, false);
      } else {
        // Swipe verso sinistra = Dislike
        handleDislike(swipedArtwork, false);
      }
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;

    // Se stiamo forzando lo slide, ignora
    if (isForceSliding.current) {
      isForceSliding.current = false;
      setCurrentIndex(newIndex);
      return;
    }

    // Se l'utente ha provato a tornare indietro (swipe verso destra),
    // forza l'avanzamento alla prossima card
    if (newIndex < swipeStartIndex.current) {
      isForceSliding.current = true;
      setTimeout(() => {
        if (swiperRef.current) {
          swiperRef.current.slideTo(swipeStartIndex.current + 1);
        }
      }, 0);
      return;
    }

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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "600px",
          gap: 3,
        }}>
        {/* CircularProgress con gradiente */}
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
          }}>
          <CircularProgress
            size={80}
            thickness={4}
            sx={{
              color: "#667eea",
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />
        </Box>

        {/* Testo caricamento */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          Caricamento opere d'arte...
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          Stiamo cercando le opere perfette per te
        </Typography>
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
          maxWidth: "500px",
          margin: "0 auto",
          padding: 4,
          gap: 3,
        }}>
        {/* Icona errore */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #EC6F7B 0%, #D9534F 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 40px rgba(236, 111, 123, 0.3)",
          }}>
          <ErrorOutlineIcon sx={{ fontSize: 60, color: "white" }} />
        </Box>

        {/* Titolo */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            textAlign: "center",
            color: "#EC6F7B",
          }}>
          Oops! Qualcosa è andato storto
        </Typography>

        {/* Messaggio descrittivo */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: "400px",
          }}>
          {error}
        </Typography>

        {/* Bottone azione */}
        <Button
          variant="contained"
          onClick={handleReload}
          startIcon={<RefreshIcon />}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "12px 32px",
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #653a91 100%)",
              boxShadow: "0 6px 24px rgba(102, 126, 234, 0.5)",
            },
          }}>
          Riprova
        </Button>

        {/* Suggerimento */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: "center",
            fontSize: "0.875rem",
            fontStyle: "italic",
          }}>
          💡 Se il problema persiste, ricarica la pagina o contatta l'assistenza
        </Typography>
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
          maxWidth: "500px",
          margin: "0 auto",
          padding: 4,
          gap: 3,
        }}>
        {/* Icona con gradiente */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 40px rgba(102, 126, 234, 0.3)",
          }}>
          <SearchOffIcon sx={{ fontSize: 60, color: "white" }} />
        </Box>

        {/* Titolo */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          Nessuna opera trovata
        </Typography>

        {/* Messaggio descrittivo */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: "400px",
          }}>
          Non abbiamo trovato opere che corrispondono ai tuoi criteri di ricerca.
          {auth.isAuthenticated
            ? " Hai già visto tutte le opere disponibili o i filtri attuali sono troppo restrittivi."
            : " Prova a modificare i filtri per vedere più risultati."}
        </Typography>

        {/* Bottoni azione */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
            maxWidth: "300px",
          }}>
          <Button
            variant="contained"
            onClick={handleReload}
            startIcon={<RefreshIcon />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #653a91 100%)",
                boxShadow: "0 6px 24px rgba(102, 126, 234, 0.5)",
              },
            }}>
            Ricarica opere
          </Button>

          <Button
            variant="outlined"
            startIcon={<FilterAltIcon />}
            onClick={() => {
              // Apri il pannello filtri tramite lo store
              useFiltersStore.getState().setFiltersPanelOpen(true);
            }}
            sx={{
              borderColor: "#667eea",
              color: "#667eea",
              padding: "12px 24px",
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              borderWidth: 2,
              "&:hover": {
                borderColor: "#5568d3",
                backgroundColor: "rgba(102, 126, 234, 0.04)",
                borderWidth: 2,
              },
            }}>
            Modifica filtri
          </Button>
        </Box>

        {/* Suggerimento */}
        {!auth.isAuthenticated && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "center",
              fontSize: "0.875rem",
              fontStyle: "italic",
            }}>
            💡 Accedi per vedere opere personalizzate in base ai tuoi gusti
          </Typography>
        )}
      </Box>
    );
  }

  // Renderizza griglia AI se attiva
  if (showAiGrid && aiGridResults.length > 0) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "600px",
          padding: 4,
          position: "relative",
        }}>
        {/* Header con titolo e pulsante chiudi */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            px: 2,
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Risultati ArtMatch ({aiGridResults.length})
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleCloseAiGrid}
            startIcon={<CloseIcon />}
            sx={{
              borderColor: "#667eea",
              color: "#667eea",
              "&:hover": {
                borderColor: "#5568d3",
                backgroundColor: "rgba(102, 126, 234, 0.04)",
              },
            }}>
            Chiudi
          </Button>
        </Box>

        {/* Griglia delle opere */}
        <Grid container spacing={3}>
          {aiGridResults.map((artwork) => {
            const imageUrl = artwork.images?.[0]?.src || "../images/artists_example.png";
            const artistName = artwork.acf?.artist?.[0]?.post_title || "Artista sconosciuto";
            const galleryName = artwork.store_name || "Galleria";

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={artwork.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 24px rgba(102, 126, 234, 0.2)",
                    },
                  }}>
                  <Box
                    onClick={() => handleArtworkClick(artwork)}
                    sx={{
                      cursor: "pointer",
                      position: "relative",
                    }}>
                    <CardMedia
                      component="img"
                      image={imageUrl}
                      alt={artwork.name}
                      sx={{
                        height: 280,
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box onClick={() => handleArtworkClick(artwork)} sx={{ cursor: "pointer", flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 0.5, fontSize: "0.875rem" }}>
                        {artistName}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 1,
                          fontWeight: 500,
                          fontSize: "1rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                        {artwork.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                        {galleryName}
                      </Typography>
                    </Box>

                    {/* Pulsanti Like/Dislike */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                        pt: 1,
                        borderTop: "1px solid #f0f0f0",
                      }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDislike(artwork);
                        }}
                        sx={{
                          flex: 1,
                          height: 48,
                          backgroundColor: "#ffebee",
                          borderRadius: "12px",
                          color: "#EC6F7B",
                          "&:hover": {
                            backgroundColor: "#ffcdd2",
                          },
                          transition: "all 0.2s",
                        }}>
                        <CloseIcon />
                      </IconButton>

                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(artwork);
                        }}
                        sx={{
                          flex: 1,
                          height: 48,
                          backgroundColor: "#e8f5e9",
                          borderRadius: "12px",
                          color: "#42B396",
                          "&:hover": {
                            backgroundColor: "#c8e6c9",
                          },
                          transition: "all 0.2s",
                        }}>
                        <FavoriteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }

  // Renderizza swiper normale
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
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
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