import React, { useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import PromoCard from "../components/PromoCard.tsx";
// import reservationBackground from "../assets/images/reservation-box-background.png";
import onboardingBackground from "../assets/images/background-onboarding.svg";

import PromoCardSmall from "../components/PromoCardSmall.tsx";

import prenotaOpera from "../assets/images/prenota_opera.svg";
import richiediPrestito from "../assets/images/richiedi_prestito.svg";
import completaAcquisto from "../assets/images/completa_acquisto.svg";
import LoanCard from "../components/LoanCard.tsx";
import { getDefaultPaddingX } from "../utils.ts";
// import { useData } from "../hoc/DataProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import Hero from "../components/Hero.tsx";

export interface CustomerOnboardingProps {
}

const CustomerOnboarding: React.FC<CustomerOnboardingProps> = ({}) => {
  // const data = useData();
  const auth = useAuth();

  const theme = useTheme();

  //const [featuredArtists, setFeaturedArtists] = useState<ArtistCardProps[]>();

  const handleRegistration = () => {
    auth.login(false);
  };

  useEffect(() => {
    // data.listFeaturedArtists().then((resp) => setFeaturedArtists(artistsToGalleryItems(resp)));
  }, []);

  const px = getDefaultPaddingX();

  return (
    <DefaultLayout sx={{ overflowX: "hidden" }}>
      <Hero imgOffset={{ xs: 6, sm: 8 }}>
        <Typography variant="body1" color="primary" sx={{ textTransform: "uppercase" }}>
          Artpay per gli appassionati d'arte
        </Typography>
        <Typography variant="display1" color="primary" sx={{ mt: 1 }}>
          Scopri come ACQUISTARE ONLINE OPERE D’ARTE CERTIFICATE in modo più accessibile e veloce, con artpay.
        </Typography>
        <Typography variant="body1" sx={{ mt: 6, maxWidth: "400px" }}>
          Vivi la tua passione per l’arte in modo ancora più soddisfacente.<br />
          Con Artpay puoi acquistare online opere d’arte dalle più rinomate gallerie d’arte italiane e pagarle
          direttamente o tramite alla flessibilità dei SERVIZI FINANZIARI RATEALI delle nostre banche partner.
        </Typography>
      </Hero>
      <Box sx={{ py: 12, background: `url(${onboardingBackground})`, px: px }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <PromoCard
            border
            title={
              <>
                Esplora le opere d’arte del nostro network di gallerie
              </>
            }>
            <Typography variant="body1">
              Dopo l’iscrizione ad Artpay, esplora l’offerta di opere d’arte online delle gallerie del nostro network.
              Troverai tutte le informazioni su ciascuna opera e sulla galleria che le mette in vendita.<br />
              In alternativa, visita di persona una galleria del nostro network e, se un’opera ti interessa, richiedi di
              acquistarla tramite Artpay.
            </Typography>
          </PromoCard>
          <PromoCard
            title={
              <>
                Ti interessa un’opera d’arte? prenotala!
              </>
            }>
            <Typography variant="body1">
              Hai trovato un’opera d’arte che ti interessa e vorresti acquistare? Non serve pagare tutto subito: puoi
              prenotarla con la tua carta di credito. Scegli l’opzione “Prenota l’opera” e potrai prenotarla con una
              piccola trattenuta sulla tua carta di credito, proporzionale al valore dell’opera, a garanzia delle tue
              intenzioni d’acquisto. Hai 7 giorni per scegliere la modalità di pagamento che preferisci. Durante tutto
              questo tempo, l’opera è prenotata a tuo nome e non disponibile per l’acquisto da parte di altre persone.
            </Typography>
          </PromoCard>
          <PromoCard
            title={
              <>
                Opzioni di <br />acquisto
              </>
            }>
            <Typography variant="body1">
              Se vuoi acquistare subito l’opera d’arte di tuo interesse, scegli l’opzione “Compra subito”. Potrai
              procedere al pagamento online con la tua carta di credito o via bonifico o scegliendo le migliori proposte
              di finanziamento per il tuo acquisto offerto dai nostri partner selezionati: una volta completata la
              procedura, spetterà all’istituto finanziario valutare la tua pratica e concedere il credito per
              l’acquisto, che arriverà alla galleria d’arte entro 7 giorni circa, dando il via alla sua spedizione al
              tuo indirizzo.
              Una volta approvato il finanziamento, proseguirai con il pagamento delle singole rate per tutto il periodo
              di finanziamento evidenziato dal piano finanziario, avendo come interlocutore direttamente l’istituto
              bancario erogante.
            </Typography>
          </PromoCard>
          <PromoCard
            title={
              <>
                Consegna <br />dell’opera
              </>
            }>
            <Typography variant="body1">
              Una volta completato l’acquisto con una delle tante opzioni messe a disposizione da Artpay, è il momento
              della consegna dell’opera d’arte.<br />
              Anche in questo caso, avrai massima libertà di personalizzare la tua esperienza di consegna già a partire
              dal carrello di acquisto o prenotare il ritiro presso la galleria che vende l’opera confrontandoti
              direttamente, attraverso il sistema di messaggistica integrato all’interno della piattaforma, con il
              personale dedicato della galleria stessa.
            </Typography>
          </PromoCard>

          <PromoCard titleVariant="h2" title="Cosa aspetti? Entra subito a far parte di artpay!" variant="contrast">
            <Typography variant="body1" color="white" sx={{ mb: 2 }}>
              Ad acquisto avvenuto, l’opera è tua e avrai massima libertà di personalizzare la tua esperienza di
              consegna già a partire dal carrello di acquisto o prenotare il ritiro presso la galleria che vende l’opera
              confrontandoti direttamente, attraverso il sistema di messaggistica integrato all’interno della
              piattaforma, con il personale dedicato della galleria stessa.
            </Typography>
            {!auth.isAuthenticated && <Button variant="outlined" color="contrast" onClick={handleRegistration}>
              Registrati
            </Button>}

          </PromoCard>
        </Box>
      </Box>
      <Grid sx={{ py: 12, px: px }} container>
        <Grid item xs={12} sx={{ mb: { xs: 3, sm: 0 } }}>
          <Typography variant="h2">
            Non vuoi farti sfuggire un’opera? <span style={{ color: theme.palette.primary.main }}>Prenotala!</span>
          </Typography>
          <Typography variant="body1" fontWeight={500} sx={{ maxWidth: "400px", mt: 2 }}>
            Se sei intenzionato ad acquistare un’opera, non devi fare altro che prenotarla e non fartela scappare!
          </Typography>
        </Grid>
      </Grid>
      <Grid sx={{ py: 0, px: px }} spacing={3} display="flex" container>
        <Grid xs={12} md={4} px={1} item>
          <PromoCardSmall
            imgSrc={prenotaOpera}
            title={
              <>
                Prenota <br />
                l’opera
              </>
            }
            text="Con una piccola quota bloccata sulla tua carta di credito, proporzionale al prezzo d’acquisto, prenoti l’opera che ti interessa e ti garantisci i diritti esclusivi d’acquisto. Dal momento della prenotazione, l’opera sarà riservata a tuo nome per 7 giorni. In caso di mancato acquisto, la somma sarà sbloccata entro 5 giorni lavorativi. "
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
            linkHref="#partners"
            text="Con artpay puoi finalmente accedere a prestiti personalizzati. Per i tuoi acquisti d'arte scegli la migliore proposta di prestito tra quelle degli istituti bancari nostri partner. Di norma l’approvazione avviene in poche ore. "
          />
        </Grid>
        <Grid xs={12} md={4} px={1} item>
          <PromoCardSmall
            variant="white"
            imgSrc={completaAcquisto}
            title={
              <>
                Completa l’acquisto <br />
                dell’opera
              </>
            }
            text="Ad acquisto avvenuto, l’opera è tua e avrai massima libertà di personalizzare le modalità di consegna, confrontandoti direttamente col personale della galleria d’arte responsabile della vendita."
          />
        </Grid>
      </Grid>
      <div id="partners" style={{ top: "-80px", position: "relative", visibility: "hidden" }} />
      <Box sx={{ px: { ...px, xs: 0 }, mt: 3, mb: 12 }}>
        <LoanCard />
      </Box>
      <Box sx={{ px: px, mb: { xs: 12 } }}>
        {/*<ArtistsList
          items={featuredArtists || []}
          disablePadding
          maxItems={4}
          size="medium"
          title="Artisti in evidenza"
        />*/}
      </Box>
    </DefaultLayout>
  );
};

export default CustomerOnboarding;
