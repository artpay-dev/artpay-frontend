import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../hoc/DataProvider.tsx";
import { OrderLoanCardProps } from "../components/OrderLoanCard.tsx";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { artworkToOrderItem, galleryToGalleryContent, getDefaultPaddingX } from "../utils.ts";
import { Box, Button, Chip, Grid, Typography } from "@mui/material";
import LockIcon from "../components/icons/LockIcon.tsx";
import HourglassIcon from "../components/icons/HourglassIcon.tsx";
import PromoCardSmall from "../components/PromoCardSmall.tsx";
import prenotaOpera from "../assets/images/prenota_opera_dark.svg";
import richiediPrestito from "../assets/images/richiedi_prestito.svg";
import completaAcquisto from "../assets/images/completa_acquisto_white.svg";
import LoanCard from "../components/LoanCard.tsx";
import { UserProfile } from "../types/user.ts";
import { GalleryContent } from "../types/gallery.ts";
import dayjs from "dayjs";

export interface ArtworkReservedProps {

}

const ArtworkReserved: React.FC<ArtworkReservedProps> = ({}) => {
  const data = useData();
  const urlParams = useParams();

  const [ready, setReady] = useState(false);
  const [artwork, setArtwork] = useState<OrderLoanCardProps>();
  const [profile, setProfile] = useState<UserProfile>();
  const [galleryInfo, setGalleryInfo] = useState<GalleryContent>();

  const px = getDefaultPaddingX();
  const border = "1px solid #CDCFD3";

  const handleFinalizeOrder = () => {

  };

  useEffect(() => {
    if (!urlParams.slug_opera) {
      return;
    }

    const completedOrderId = localStorage.getItem("completed-order");
    if (completedOrderId) {
      data
        .setOrderStatus(+completedOrderId, "on-hold", {
          payment_method: "Acconto blocco opera",
          payment_method_title: "Blocco opera",
          customer_note: `Versato acconto ${data.downpaymentPercentage()}%`
        })
        .then(() => {
          localStorage.removeItem("completed-order");
        });
    }

    Promise.all([
      data.getArtworkBySlug(urlParams.slug_opera).then(async (resp) => {
        const artworkTechnique = data.getCategoryMapValues(resp, "tecnica").join(" ");
        const artworkForCard = artworkToOrderItem(resp);
        artworkForCard.artworkTechnique = artworkTechnique;
        artworkForCard.reservedUntil = artworkForCard.reservedUntil || dayjs().add(7, "day").format("DD/MM/YYYY");
        setArtwork(artworkForCard);
        data.getGallery(resp.vendor).then(gallery => {
          setGalleryInfo(galleryToGalleryContent(gallery));
        });

      }),
      data.getUserProfile().then((resp) => setProfile(resp))
    ]).then(() => {
      setReady(true);
    });
  }, [data, urlParams.slug_opera]);

  return (<DefaultLayout authRequired pageLoading={!ready}>
    <Grid container sx={{ px: px, mt: { xs: 12, md: 18 } }} spacing={3}>
      <Grid item xs={12} md={5} lg={6}>
        <Box sx={{ borderBottom: border, borderTop: border, py: 3, height: "100%" }}>
          <Typography variant="h1">Complimenti {profile?.first_name || profile?.billing.first_name}</Typography>
          <Typography sx={{ maxWidth: "400px", mt: 3 }} variant="body1">
            Per 7 giorni avrai diritto esclusivo di acquisto di quest’opera. Nessun altro potrà prenotarla o
            acquistarla. Durante questo periodo, potrai completare l’acquisto con le modalità a te preferite.
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={7} lg={6}>
        <Box sx={{ borderRadius: "5px", border: border, flexDirection: { xs: "column", sm: "row" } }} p={3}
             display="flex">
          <Box sx={{
            maxHeight: "260px",
            maxWidth: "294px"
          }}>
            <img src={artwork?.imgUrl}
                 style={{
                   borderRadius: "5px",
                   objectFit: "cover",
                   height: "100%",
                   width: "100%"
                 }} />
          </Box>
          <Box px={2} sx={{ pt: { xs: 2, sm: 0 } }} display="flex" justifyContent="center" flexDirection="column">
            <Typography variant="body1" fontWeight={500}>{artwork?.title}</Typography>
            <Typography variant="body1" fontWeight={500} color="textSecondary">{artwork?.artistName}</Typography>
            <Typography variant="body2" fontWeight={500} color="textSecondary"
                        sx={{ mt: 2 }}>{artwork?.artworkTechnique}</Typography>
            <Typography variant="body2" fontWeight={500} color="textSecondary">{artwork?.artworkSize}</Typography>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>{artwork?.galleryName}</Typography>
            <Typography variant="subtitle1"
                        color="textSecondary">{galleryInfo?.subtitle || ""}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}><LockIcon color="error"
                                                                                       fontSize="inherit" /> Opera
              prenotata</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}><HourglassIcon fontSize="inherit" /> Opera
              bloccata fino a {artwork?.reservedUntil}</Typography>
          </Box>
        </Box>
      </Grid>

    </Grid>
    <Grid sx={{ pt: 12, px: px }} spacing={3} display="flex" container>
      <Grid xs={12} md={4} px={1} item>
        <PromoCardSmall
          variant="white"
          imgSrc={prenotaOpera}
          title={
            <>
              Prenotazione <br />
              avvenuta
            </>
          }
          text="L’opera che ti interessa acquistare è riservata a tuo nome per 7 giorni. "
          footer={<Chip sx={{ width: "100%" }} size="large" color="primary"
                        label="Prenotazione valida fino al 12.03.2024" />}
        />
      </Grid>
      <Grid xs={12} md={4} px={1} item>
        <PromoCardSmall
          variant="secondary"
          imgSrc={richiediPrestito}
          title={
            <>
              Richiedi <br />
              un prestito
            </>
          }
          link="Scopri i nostri partner"
          text="Con artpay puoi finalmente accedere a prestiti personalizzati. Per i tuoi acquisti d'arte scegli la migliore proposta di prestito tra quelle degli istituti bancari nostri partner. Di norma l’approvazione avviene in poche ore. "
        />
      </Grid>
      <Grid xs={12} md={4} px={1} item>
        <PromoCardSmall

          imgSrc={completaAcquisto}
          title={
            <>
              Completa l’acquisto <br />
              dell’opera
            </>
          }
          text="Ad acquisto avvenuto, l’opera è tua e avrai massima libertà di personalizzare le modalità di consegna, confrontandoti direttamente col personale della galleria d’arte responsabile della vendita."
          footer={<Button onClick={() => handleFinalizeOrder()} color="contrast">Compra l'opera</Button>}
        />
      </Grid>
    </Grid>
    <Box sx={{ px: { ...px, xs: 0 }, mt: 3, mb: 12 }}>
      <LoanCard />
    </Box>

  </DefaultLayout>);
};

export default ArtworkReserved;
