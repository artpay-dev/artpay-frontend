import React from "react";
import { Box, BoxProps, IconButton } from "@mui/material";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaWhatsapp, FaYoutube } from "react-icons/fa6";

export interface SocialLinksProps {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
  instagram?: string;
  youtube?: string;
}

const SocialLinks: React.FC<SocialLinksProps & BoxProps> = ({
  facebook,
  twitter,
  linkedin,
  whatsapp,
  instagram,
  youtube,
  sx = {},
  ...other
}) => {
  return (
    <Box display="flex" flexDirection="row" sx={{ gap: { xs: 2, md: 2 }, ...sx }} {...other}>
      {facebook && (
        <IconButton href={facebook} target="_blank">
          <FaFacebook size="22px" color="#9FA9F3" />
        </IconButton>
      )}
      {twitter && (
        <IconButton href={twitter} target="_blank">
          <FaTwitter size="22px" color="#9FA9F3" />
        </IconButton>
      )}
      {linkedin && (
        <IconButton href={linkedin} target="_blank">
          <FaLinkedin size="22px" color="#9FA9F3" />
        </IconButton>
      )}
      {whatsapp && (
        <IconButton href={whatsapp} target="_blank">
          <FaWhatsapp size="22px" color="#9FA9F3" />
        </IconButton>
      )}
      {instagram && (
        <IconButton href={instagram} target="_blank">
          <FaInstagram size="22px" color="#9FA9F3" />
        </IconButton>
      )}
      {youtube && (
        <IconButton href={youtube} target="_blank">
          <FaYoutube size="22px" color="#9FA9F3" />
        </IconButton>
      )}
    </Box>
  );
};

export default SocialLinks;
