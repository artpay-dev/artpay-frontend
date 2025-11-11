import { useState, useRef, CSSProperties } from "react";
import { Artwork } from "../../../../types/artwork";
import { IconButton, Typography, Box } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";

interface SwipeCardProps {
  artwork: Artwork;
  onLike: (artwork: Artwork) => void;
  onDislike: (artwork: Artwork) => void;
  isTop?: boolean;
}

const SwipeCard = ({ artwork, onLike, onDislike, isTop = false }: SwipeCardProps) => {
  const [startX, setStartX] = useState<number>(0);
  const [currentX, setCurrentX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handlers per touch (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return;
    const diff = e.touches[0].clientX - startX;
    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);

    const threshold = 100; // Soglia per attivare like/dislike

    if (currentX > threshold) {
      // Swipe a destra -> Like
      handleSwipeComplete("like");
    } else if (currentX < -threshold) {
      // Swipe a sinistra -> Dislike
      handleSwipeComplete("dislike");
    } else {
      // Ritorna alla posizione iniziale
      setCurrentX(0);
    }
  };

  // Handlers per mouse (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating) return;
    const diff = e.clientX - startX;
    setCurrentX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);

    const threshold = 100;

    if (currentX > threshold) {
      handleSwipeComplete("like");
    } else if (currentX < -threshold) {
      handleSwipeComplete("dislike");
    } else {
      setCurrentX(0);
    }
  };

  const handleSwipeComplete = (action: "like" | "dislike") => {
    setIsAnimating(true);
    const direction = action === "like" ? 1 : -1;
    setCurrentX(direction * 500);

    setTimeout(() => {
      if (action === "like") {
        onLike(artwork);
      } else {
        onDislike(artwork);
      }
      setCurrentX(0);
      setIsAnimating(false);
    }, 300);
  };

  const handleLikeClick = () => {
    if (isAnimating) return;
    handleSwipeComplete("like");
  };

  const handleDislikeClick = () => {
    if (isAnimating) return;
    handleSwipeComplete("dislike");
  };

  // Calcola rotazione e opacità basate sullo swipe
  const rotation = currentX / 20;
  const likeOpacity = Math.max(0, Math.min(1, currentX / 150));
  const dislikeOpacity = Math.max(0, Math.min(1, -currentX / 150));

  const cardStyle: CSSProperties = {
    transform: `translateX(${currentX}px) rotate(${rotation}deg)`,
    transition: isDragging ? "none" : "all 0.3s ease-out",
    cursor: isDragging ? "grabbing" : "grab",
  };

  // Ottieni l'immagine principale
  const mainImage = artwork.images && artwork.images.length > 0 ? artwork.images[0].src : "";
  const artistName = artwork.acf?.artist?.[0]?.post_title || "Artista sconosciuto";

  return (
    <Box
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`bg-tertiary`}
      sx={{
        position: "absolute",
        width: "100%",
        maxWidth: "448px",
        height: "720px",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        userSelect: "none",
        touchAction: "none",
        zIndex: isTop ? 2 : 1,
      }}
      style={cardStyle}>
      {/* Immagine prodotto */}
      <Box
        sx={{
          width: "100%",
          height: "60%",
          backgroundImage: `url(${mainImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          borderRadius: "16px",
        }}>
        {/* Overlay Like */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-20deg)",
            opacity: likeOpacity,
            transition: "opacity 0.2s",
            pointerEvents: "none",
          }}>
        </Box>

        {/* Overlay Dislike */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(20deg)",
            opacity: dislikeOpacity,
            transition: "opacity 0.2s",
            pointerEvents: "none",
          }}>
        </Box>
      </Box>

      {/* Info prodotto */}
      <Box
        sx={{
          paddingTop: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
        <Box sx={{ paddingBottom: "48px" }}>
          <Typography variant="body1" sx={{ mb: 0.5 }} color="text.secondary">
            {artwork.name}
          </Typography>
          <Typography variant="h4" color="white">
            {artistName}
          </Typography>
        </Box>

        {/* Bottoni azioni */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 4,
          }}>
          {/* Bottone Dislike */}
          <IconButton
            onClick={handleDislikeClick}
            disabled={isAnimating}
            sx={{
              width: 80,
              height: 80,
              backgroundColor: "#ffebee",
              fontSize: "42px",
              color: "#EC6F7B",
              "&:hover": {
                backgroundColor: "#fff",
              },
              transition: "all 0.2s",
            }}>
            <CloseIcon fontSize="inherit" />
          </IconButton>

          {/* Bottone Like */}
          <IconButton
            onClick={handleLikeClick}
            disabled={isAnimating}
            sx={{
              width: 80,
              height: 80,
              backgroundColor: "#e8f5e9",
              fontSize: "48px",
              color: "#42B396",
              "&:hover": {
                backgroundColor: "#fff",
              },
              transition: "all 0.2s",
            }}>
            <FavoriteIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SwipeCard;