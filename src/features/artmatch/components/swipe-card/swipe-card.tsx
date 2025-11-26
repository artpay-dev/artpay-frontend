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

const SwipeCard = ({ artwork, onLike, onDislike }: SwipeCardProps) => {
  const handleLikeClick = () => {
    onLike(artwork);
  };

  const handleDislikeClick = () => {
    onDislike(artwork);
  };

  // Ottieni l'immagine principale
  const mainImage = artwork.images && artwork.images.length > 0 ? artwork.images[0].src : "";
  const artistName = artwork.acf?.artist?.[0]?.post_title || "Artista sconosciuto";

  return (
    <Box
      className="bg-tertiary"
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
      }}>
      {/* Immagine prodotto */}
      <Box
        sx={{
          width: "100%",
          height: "65%",
          backgroundImage: `url(${mainImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          borderRadius: "8px",
        }}
      />

      {/* Info prodotto */}
      <Box
        sx={{
          padding: "24px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
        <Box>
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