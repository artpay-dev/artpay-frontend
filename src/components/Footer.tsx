import React from "react";
import { Box, Divider, Grid, IconButton, Link, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowUpward } from "@mui/icons-material";
import NewsletterSmall from "./NewsletterSmall.tsx";
import { getDefaultPaddingX } from "../utils.ts";

export interface FooterProps {
}

const FooterRoot = styled("div", {
  name: "MuiFooter", // The component name
  slot: "root" // The slot name
})(() => ({
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
  const theme = useTheme();

  const px = getDefaultPaddingX();

  const gridProps = {
    maxWidth: theme.breakpoints.values["xl"],
    px: px,
    pt: { xs: 2, md: 6 },
    gap: { xs: 2, md: 0 }
  };


  return (
    <FooterRoot>
      {/*<Grid sx={gridProps} container>
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
      </Grid>*/}
      <Grid sx={gridProps} container>
        <NewsletterSmall />
        <Grid xs={12} md={3} item>
          <Typography variant="body1" fontWeight={600}>
            Per contatti
          </Typography>
          <Typography sx={{ mt: 1 }} variant="body1" fontWeight={400}>
            <Link className="link-secondary" sx={{
              fontWeight: 400,
              color: theme.palette.text.primary,
              textDecorationColor: theme.palette.text.primary
            }} href="mailto:hello@artpay.art">hello@artpay.art</Link>
          </Typography>
        </Grid>
        <Grid xs={12} md={2} item>
          <Typography variant="body1" fontWeight={600}>
            Su di noi
          </Typography>
          <Box display="flex" flexDirection="column" my={1} gap={1}>
            <Typography color="textPrimary" variant="body1">
              <Link className="link" href="/chi-siamo">Chi siamo</Link>
            </Typography>
            <Typography variant="body1">
              <Link className="link" href="/contatti">Contatti</Link>
            </Typography>
          </Box>
        </Grid>
        <Grid xs={12} md={3} item>
          <Typography variant="body1" fontWeight={600}>
            Servizi
          </Typography>
          <Box display="flex" flexDirection="column" my={1} gap={1}>
            <Typography variant="body1">
              <a className="link" href="https://gallerie.artpay.art/">artpay per gallerie</a>
            </Typography>
            <Typography variant="body1">
              <a className="link" href="https://artpay.art/artpay-per-collezionisti/">artpay per collezionisti</a>
            </Typography>
            <Typography variant="body1">
              <a className="link" href="/faq">FAQ</a>
            </Typography>
          </Box>
        </Grid>


      </Grid>

      <Grid sx={{ ...gridProps, pb: { xs: 12, md: 8 }, pt: 0 }} container>
        <Grid xs={12} item><Divider sx={{ width: "100%", borderColor: "#CDCFD3", pt: 6, mb: 2 }} /> </Grid>
        <Grid xs={12} md={3} display="flex" alignItems="center" item>
          <Typography variant="body2" color="textSecondary">
            © artpay srl 2024 - Tutti i diritti riservati
          </Typography>
        </Grid>
        <Grid xs={12} md={6} display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} alignItems="center"
              item>
          <a href="https://www.iubenda.com/privacy-policy/71113702"
             className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe " title="Privacy Policy ">Privacy
            Policy</a>
          <a href="https://www.iubenda.com/privacy-policy/71113702/cookie-policy"
             className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe " title="Cookie Policy ">Cookie
            Policy</a>
          <Typography variant="body2" color="primary">
            <Link sx={{ textDecoration: "none" }} href="/termini-e-condizioni">Termini e condizioni</Link>
          </Typography>
          <Typography variant="body2" color="primary">
            <Link sx={{ textDecoration: "none" }} href="/condizioni-generali-di-acquisto">Condizioni generali di
              acquisto</Link>
          </Typography>
          <Typography variant="body2">

          </Typography>
        </Grid>
        <Grid xs={12} md={3} display="flex" sx={{ justifyContent: { xs: "flex-start", md: "flex-end" } }} item>
          {/*<SocialLinks color="#010F22" instagram="..." facebook="..." twitter="..." youtube="..." sx={{ my: -1 }} />*/}
        </Grid>
        <Grid xs={12} item><Divider sx={{ width: "100%", borderColor: "#CDCFD3", my: 2 }} /> </Grid>
        <Grid xs={12} item>
          <Typography variant="body2" color="textSecondary">artpay S.R.L. Via Carloforte, 60, 09123, Cagliari Partita
            IVA 04065160923</Typography>
        </Grid>
      </Grid>
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          bottom: { xs: "20px", md: "86px" },
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
