import React from "react";
import { Gallery } from "../types/gallery";
import { Box, Button, Typography } from "@mui/material";
import DisplayImage from "./DisplayImage.tsx";

export interface GalleryDetailsProps {
  gallery: Gallery;
}

//TODO: descrizione galleria
const placeholderText =
  "Lorem ipsum dolor sit amet consectetur. Id nunc viverra faucibus molestie pretium massa proin. Sagittis orci adipiscing nunc ac. Risus tellus volutpat diam ut quis. Quis felis ut ornare justo ultrices amet nascetur consectetur orci. Amet sed senectus ridiculus ac eleifend. A quam lorem neque vestibulum adipiscing ac justo etiam.";

const GalleryDetails: React.FC<GalleryDetailsProps> = ({ gallery }) => {
  return (
    <Box sx={{ maxWidth: "900px", width: "100%" }} display="flex">
      <DisplayImage src={gallery.avatar_url} width={320} height={320} />
      <Box flexGrow={1} px={3}>
        <Box display="flex">
          <Box flexGrow={1}>
            <Typography variant="h6">{gallery.username}</Typography>
            <Typography variant="h6" color="textSecondary">
              {gallery.username}
            </Typography>
          </Box>
          <Box>
            <Button variant="outlined">Follow</Button>
          </Box>
        </Box>
        <Typography sx={{ mt: 3 }} variant="subtitle1">
          {placeholderText}
        </Typography>
      </Box>
    </Box>
  );
};

export default GalleryDetails;
