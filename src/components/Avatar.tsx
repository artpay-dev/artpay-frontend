import React from "react";
import { Box } from "@mui/material";

export interface AvatarProps {
  src?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, firstName, lastName, username }) => {
  let initials = ((firstName || "").substring(0, 1) + (lastName || "").substring(0, 1)).toUpperCase();
  if (!initials && username && username.length > 1) {
    initials = username.substring(0, 2).toUpperCase();
  }
  if (!src) {

    return (
      <Box sx={{ height: "106px", width: "106px", borderRadius: "5px", overflow: "hidden" }} className={'bg-primary flex items-center justify-center'}>
        <span className={'text-white text-6xl font-light'}>{initials}</span>
      </Box>
    )
  }
  return (
    <Box sx={{ height: "106px", width: "106px", borderRadius: "5px", backgroundColor: "#D9D9D9", overflow: "hidden" }}>
      <img style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} src={src} />
    </Box>
  );
};

export default Avatar;
