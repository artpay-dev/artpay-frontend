import React from "react";
import { Box } from "@mui/material";

export interface AvatarProps {
  src?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src }) => {
  return (
    <Box sx={{ height: "150px", width: "150px", borderRadius: "5px", backgroundColor: "#D9D9D9", overflow: "hidden" }}>
      <img style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} src={src} />
    </Box>
  );
};

export default Avatar;
