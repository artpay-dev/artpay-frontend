import React from "react";
import { Box, SxProps, Theme } from "@mui/material";

export interface DisplayImageProps {
  src?: string;
  width?: number | string;
  height?: number | string;
  sx?: SxProps<Theme>;
}

const DisplayImage: React.FC<DisplayImageProps> = ({
  src,
  width,
  height,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        ...sx,
        height: height || "auto",
        minHeight: height || "auto",
        width: width || "auto",
        minWidth: width || "auto",
        background: "rgba(0,0,0,0.2)",
      }}
      className="borderRadius">
      <img src={src} />
    </Box>
  );
};

export default DisplayImage;
