import React from "react";
import { Box } from "@mui/material";

export interface AvatarCircleProps {
  imgUrl?: string;
  alt?: string;
}

const AvatarCircle: React.FC<AvatarCircleProps> = ({ imgUrl = "", alt = "" }) => {

  return (<Box sx={{
    height: "48px",
    width: "48px",
    p: 1,
    borderRadius: "24px",
    border: "1px solid #CDCFD3",
    textAlign: "center"
  }}>
    <img src={imgUrl} alt={alt}
         style={{
           maxWidth: "32px",
           maxHeight: "32px",
           overflow: "visible"
           //objectFit: "cover"
         }} />
  </Box>);
};

export default AvatarCircle;
