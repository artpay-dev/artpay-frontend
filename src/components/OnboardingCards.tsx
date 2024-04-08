import React from "react";
import { Grid } from "@mui/material";
import { getDefaultPaddingX } from "../utils.ts";
import OnboardingCard from "./OnboardingCard.tsx";
import { useNavigate } from "react-router-dom";
import bgOnboardingGallery from "../assets/images/bg_onboarding_gallery.png";
import bgOnboardingCustomer from "../assets/images/bg_onboarding_customer.png";

export interface OnboardingCardsProps {

}

const OnboardingCards: React.FC<OnboardingCardsProps> = ({}) => {
  const navigate = useNavigate();

  const px = getDefaultPaddingX();

  return (<Grid sx={{ px: px, my: 9 }} spacing={3} container>
    <OnboardingCard title="Sei un gallerista?"
                    subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    ctaText="Scopri di più"
                    ctaVariant="contained"
                    onClick={() => navigate("/artpay-per-gallerie")}
                    background={bgOnboardingGallery} />

    <OnboardingCard title="Sei un collezionista?"
                    subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    ctaText="Scopri di più"
                    onClick={() => navigate("/artpay-per-collezionisti")}
                    background={bgOnboardingCustomer} />
  </Grid>);
};

export default OnboardingCards;
