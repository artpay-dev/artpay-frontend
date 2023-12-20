import React from "react";
import { Box, SxProps, Theme } from "@mui/material";

export interface DisplayImageProps {
  src?: string;
  width?: number | string;
  height?: number | string;
  sx?: SxProps<Theme>;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ src, width, height, sx = {} }) => {
  return (
    <Box
      sx={{
        ...sx,
        height: height || "auto",
        maxHeight: height || "auto",
        width: width || "auto",
        maxWidth: width || "auto",
        //background: "rgba(0,0,0,0.2)",
        flexShrink: 0,
      }}
      className="borderRadius">
      <img style={{ maxHeight: height || "auto", maxWidth: width || "auto" }} src={src} />
    </Box>
  );
};

export default DisplayImage;
