import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaPaypal, FaCcVisa, FaCcMastercard } from "react-icons/fa";

export interface FooterProps {}

const FooterRoot = styled("div", {
  name: "MuiFooter", // The component name
  slot: "root", // The slot name
})(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "200px",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.contrast.main,
}));
const Footer: React.FC<FooterProps> = ({}) => {
  return (
    <FooterRoot>
      <Grid sx={{ maxWidth: "900px", px: { xs: 1, md: 3 }, pt: { xs: 0, md: 6 } }} container>
        <Grid xs={12} md={4} item>
          <Typography variant="body2" fontWeight={600}>
            Pagamenti sicuri
          </Typography>
          <Box display="flex" my={1} gap={1}>
            <FaCcVisa />
            <FaCcMastercard />
            <FaPaypal />
          </Box>
        </Grid>
        <Grid xs={12} md={4} item></Grid>
        <Grid xs={12} md={4} item></Grid>
      </Grid>
    </FooterRoot>
  );
};

export default Footer;
