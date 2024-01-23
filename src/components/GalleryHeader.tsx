import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export interface GalleryHeaderProps {
  logo: string;
  slug: string;
  displayName: string;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ logo, slug, displayName }) => {
  const navigate = useNavigate();

  return (
    <Box
      mt={12}
      sx={{ borderBottom: "1px solid #666F7A", px: { xs: 3, sm: 6, md: 8 }, pb: 1, mt: { xs: 8, sm: 12 } }}
      gap={2}
      display="flex">
      <img className="borderRadius" src={logo} style={{ maxHeight: "72px" }} />
      <Box display="flex" flexDirection="column" justifyContent="center" gap={0.5}>
        <Typography variant="h5" style={{ cursor: "pointer" }} onClick={() => navigate(`/gallerie/${slug}`)}>
          {displayName}
        </Typography>
      </Box>
    </Box>
  );
};

export default GalleryHeader;
