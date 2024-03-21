import React from "react";
import { Box, Divider, Grid, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaPaypal, FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { ArrowUpward } from "@mui/icons-material";
import SocialLinks from "./SocialLinks.tsx";
import NewsletterSmall from "./NewsletterSmall.tsx";

export interface FooterProps {
}

const FooterRoot = styled("div", {
  name: "MuiFooter", // The component name
  slot: "root" // The slot name
})(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "200px",
  position: "relative"
  //paddingBottom: "64px",
  //backgroundColor: theme.palette.background.paper,
  //color: theme.palette.contrast.main
}));
const Footer: React.FC<FooterProps> = ({}) => {
  const gridProps = { maxWidth: "1036px", px: { xs: 4, md: 3 }, pt: { xs: 2, md: 6 }, gap: { xs: 2, md: 0 } };

  return (
    <FooterRoot>
      <Grid sx={gridProps} container>
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
        <Grid xs={12} md={4} item>
          <a
            target="_blank"
            href="https://uk.trustpilot.com/review/artfinder.com?utm_medium=trustboxes&amp;utm_source=MicroStar"
            title="Trustpilot">
            <img
              className="lazy-load lazy-loaded"
              alt="Excellent - Five stars - Trustpilot"
              style={{ maxWidth: "300px", display: "inline-block" }}
              src="https://d2m7ibezl7l5lt.cloudfront.net/img/trustpilot-artfinder.138b9043dcc0.svg"
            />
          </a>
        </Grid>
        <Grid xs={12} md={4} item></Grid>
      </Grid>
      <Grid sx={gridProps} container>
        <Grid xs={12} md={4} item>
          <Typography variant="body1" fontWeight={600}>
            Chi siamo
          </Typography>
          <Box display="flex" flexDirection="column" my={1} gap={1}>
            <Typography variant="body2">
              <a href="/chi-siamo">Chi siamo</a>
            </Typography>
            <Typography variant="body2">
              <a href="#">Lavora con noi</a>
            </Typography>
            <Typography variant="body2">
              <a href="#">Contatti</a>
            </Typography>
            <Typography variant="body2">
              <a href="#">Press</a>
            </Typography>
            <Typography variant="body2">
              <a href="#1">Il nostro blog sull’arte</a>
            </Typography>
          </Box>
        </Grid>
        <Grid xs={12} md={4} item>
          <Typography variant="body1" fontWeight={600}>
            I nostri servizi
          </Typography>
          <Box display="flex" flexDirection="column" my={1} gap={1}>
            <Typography variant="body2">
              <a href="https://artpay.art/artpay-per-gallerie">ArtPay per gallerie</a>
            </Typography>
            <Typography variant="body2">
              <a href="https://artpay.art/artpay-per-collezionisti/">ArtPay per compratori</a>
            </Typography>
            <Typography variant="body2">
              <a href="#">ArtPay leasing</a>
            </Typography>
            <Typography variant="body2">
              <a href="#">ArtPay per Banche e Fintech</a>
            </Typography>
            <Typography variant="body2">
              <a href="/faq">FAQ</a>
            </Typography>
          </Box>
        </Grid>
        {/*        <Grid xs={12} md={4} py={1} px={2} sx={{ backgroundColor: "rgba(255,255,255,.90)", borderRadius: "8px" }} item>
          <Typography variant="body1" color="textPrimary" fontWeight={600}>
            Newsletter
          </Typography>
          <Box display="flex" flexDirection="column" my={1} gap={1}>
            <TextField placeholder="Email" />
            <Button variant="contained">Iscrivimi</Button>
            <Typography color="textSecondary" variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </Typography>
          </Box>
        </Grid>*/}
        <NewsletterSmall />
        <Grid xs={12} item><Divider sx={{ width: "100%", borderColor: "#010F22", pt: 4 }} /></Grid>
      </Grid>

      <Grid sx={{ ...gridProps, pb: 6, pt: 4 }} container>
        <Grid xs={12} md={4} display="flex" alignItems="center" item>
          <Typography variant="body2" color="textSecondary">
            Tutti i diritti riservati 2023
          </Typography>
        </Grid>
        <Grid xs={12} md={4} display="flex" gap={2} alignItems="center" item>
          <Typography variant="body2">
            <a href="/informativa-sulla-privacy">Privacy Policy</a>
          </Typography>
          <Typography variant="body2">
            <a href="/termini-e-condizioni">Terms of Use</a>
          </Typography>
          <Typography variant="body2">
            <a href="/informativa-e-gestione-dei-cookies">Cookie Policy</a>
          </Typography>
        </Grid>
        <Grid xs={12} md={4} display="flex" sx={{ justifyContent: { xs: "flex-start", md: "flex-end" } }} item>
          <SocialLinks color="#010F22" instagram="..." facebook="..." twitter="..." youtube="..." />
        </Grid>
      </Grid>
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          bottom: { xs: "0", md: "72px" },
          right: { xs: undefined, md: "0px" },
          maxWidth: "100px"
        }}
        py={2}
        px={3}
        display="flex"
        justifyContent="flex-end">
        <IconButton
          onClick={() =>
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth"
            })
          }
          variant="contained"
          color="secondary">
          <ArrowUpward />
        </IconButton>
      </Box>

    </FooterRoot>
  );
};

export default Footer;
