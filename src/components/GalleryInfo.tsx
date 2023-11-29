import React from "react";
import { Box, Typography } from "@mui/material";

export interface GalleryInfoProps {
  title: string;
  textContent: string[] | string;
  imageUrl: string;
}

const GalleryInfo: React.FC<GalleryInfoProps> = ({
  title,
  textContent,
  imageUrl,
}) => {
  return (
    <Box sx={{ maxWidth: "900px" }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        {title}
      </Typography>
      {Array.isArray(textContent) ? (
        textContent.map((text, i) => (
          <Typography
            key={i}
            sx={{ mb: 3 }}
            variant="body2"
            color="textSecondary">
            {text}
          </Typography>
        ))
      ) : (
        <Typography sx={{ mb: 3 }} variant="body2" color="textSecondary">
          {textContent}
        </Typography>
      )}

      <img style={{ width: "100%" }} src={imageUrl} />
    </Box>
  );
};

export default GalleryInfo;
