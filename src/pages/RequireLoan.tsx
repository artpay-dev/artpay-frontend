import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Grid, Typography, useTheme } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { artworkToOrderItem } from "../utils.ts";
import OrderLoanCard, { OrderLoanCardProps } from "../components/OrderLoanCard.tsx";
import { UserProfile } from "../types/user.ts";
import PurchaseLoanStepOne from "../components/PurchaseLoanStepOne.tsx";
import PurchaseLoanStepTwo from "../components/PurchaseLoanStepTwo.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import LoanConditionsCard, { LoanConditionsCardProps } from "../components/LoanConditionsCard.tsx";

export interface RequireLoanProps {
  step?: number;
}

const loanConditionsContent: LoanConditionsCardProps = {
  logoSrc: "/santander_logo_1.svg",
  isBestChoice: true,
  monthlyEstimateText: "stima mensile a partire da..",
  monthlyAmount: "120€ al mese",
  taegText: "TAEG: 5,91% (Indice sintetico di costo) / TAN: 5,74% (fisso nel tempo) / Spese iniziali: € 16,00",
  requestQuoteUrl: "https://santanderconsumergs.com/banking4you/",
  requestQuoteText: "Richiedi preventivo",
  freeAndNonBindingText: "Gratis e senza impegno",
};

const RequireLoan: React.FC<RequireLoanProps> = ({ step = 0 }) => {
  const data = useData();
  const urlParams = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const snackbar = useSnackbars();

  const [ready, setReady] = useState(false);
  const [artwork, setArtwork] = useState<OrderLoanCardProps>();
  const [profile, setProfile] = useState<UserProfile>();

  const maxWidth = `${theme.breakpoints.values.xl}px`;

  const handleReserveArtwork = () => {
    if (!artwork?.id) {
      return;
    }
    setReady(false);
    data
      .purchaseArtwork(+artwork.id)
      .then(() => {
        navigate("/accconto-blocca-opera");
      })
      .catch((e) => snackbar.error(e))
      .finally(() => setReady(true));
  };

  useEffect(() => {
    if (!urlParams.slug_opera) {
      navigate("/");
      return;
    }
    Promise.all([
      data.getArtworkBySlug(urlParams.slug_opera).then((resp) => {
        const artworkTechnique = artwork ? data.getCategoryMapValues(resp, "tecnica").join(" ") : "";
        const artworkForCard = artworkToOrderItem(resp);
        artworkForCard.artworkTechnique = artworkTechnique;
        setArtwork(artworkForCard);
      }),
      data.getUserProfile().then((resp) => setProfile(resp)),
    ]).then(() => {
      setReady(true);
    });
  }, [data, navigate, urlParams.slug_opera]);

  //TODO: modulo prestito con link https://santanderconsumergs.com/banking4you/

  return (
    <DefaultLayout pageLoading={!ready} maxWidth={false}>
      <Grid
        mt={16}
        sx={{
          px: { xs: 3, md: 6 },
          mt: { xs: 8, sm: 12, md: 16 },
          mb: { xs: 6, md: 12, lg: 18 },
          maxWidth: maxWidth,
          ml: "auto",
          mr: "auto",
        }}
        justifyContent="center"
        container>
        {step === 0 ? (
          <></>
        ) : (
          <Grid xs={12} mb={6}>
            <PurchaseLoanStepTwo />
          </Grid>
        )}
        <Grid xs={12} lg={6} xl={7} sx={{ pr: { xs: 0, lg: 3 }, mb: { xs: 3, lg: 0 } }} item>
          <Typography sx={{ mb: { xs: 3, md: 6 }, typography: { xs: "h3", sm: "h2" } }} variant="h2">
            Richiedi finanziamento
          </Typography>
          <Typography variant="subtitle1">
            Bla bla bla come funziona l’acquisto a rate, bla bla, lorem ipsum dolor sit amet consectetur. Euismod metus
            pellentesque porta aliquam ipsum aliquam aliquam consectetur dui. Massa diam egestas ultrices diam et eget
            et quis. Enim ipsum praesent venenatis auctor ultrices morbi posuere sit scelerisque. Sit nisl eu sit at
            consectetur odio est interdum.
          </Typography>
        </Grid>
        <Grid xs={12} sm={10} md={8} lg={6} xl={5} item>
          {artwork && (
            <OrderLoanCard {...artwork} profile={profile} onClick={handleReserveArtwork} showCta={step === 0} />
          )}
        </Grid>
      </Grid>
      {step === 0 ? <PurchaseLoanStepOne onClick={handleReserveArtwork} /> : <></>}
      <Grid
        mb={6}
        sx={{ maxWidth: maxWidth, ml: "auto", mr: "auto", mt: { xs: 4, md: 12 }, px: { xs: 3, md: 6 } }}
        container>
        <Grid xs={12} md={12} item>
          <Typography variant="h3">Scegli la finanziaria</Typography>
          <LoanConditionsCard {...loanConditionsContent} sx={{ mt: 2, mb: 6 }} />
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default RequireLoan;
