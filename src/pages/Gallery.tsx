import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Chip, Grid, Tab, Tabs, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import TabPanel from "../components/TabPanel.tsx";
import GalleryInfo, { GalleryInfoProps } from "../components/GalleryInfo.tsx";
import GalleryEvents, {
  GalleryEventsProps,
} from "../components/GalleryEvents.tsx";
import GalleryContacts, {
  GalleryContactsProps,
} from "../components/GalleryContacts.tsx";

export interface GalleryProps {}

interface GalleryContent {
  imageSrc: string;
  title: string;
  subtitle: string;
  description: string;
  categories: string[];
}

const Gallery: React.FC<GalleryProps> = ({}) => {
  const [selectedTabPanel, setSelectedTabPanel] = useState(0);

  useEffect(() => {
    // TODO: loadData
  }, []);

  const galleryContent: GalleryContent = {
    imageSrc: "/gallery_example.jpg",
    title: "Crag – Chiono Reisova Art Gallery",
    subtitle: "Torino, 1992",
    description: `CRAG – Chiono Reisova Art Gallery nasce nel 2016 in un loft
    nel centro Piero della Francesca di Torino, fondata
    da Elisabetta Chiono e Karin Reisovà con uno sguardo verso artisti emergenti, sia italiani che stranieri.`,
    categories: ["CATEGORY1", "CATEGORY2", "CATEGORY3"],
  };

  const galleryInfo: GalleryInfoProps = {
    title:
      "Siamo entusiasti di darvi il benvenuto nella nostra galleria d'arte, un luogo dove la creatività prende vita e l'arte diventa un'esperienza coinvolgente.",
    textContent: [
      "La nostra galleria è più di un semplice spazio espositivo; è un rifugio per gli amanti dell'arte, un luogo dove artisti e appassionati si incontrano per celebrare l'arte in tutte le sue forme. Siamo dedicati alla promozione di artisti emergenti e affermati, offrendo una piattaforma per esporre le loro opere più significative.",
      "La nostra missione è quella di condividere l'arte con il mondo, ispirando, educando e coinvolgendo il pubblico. Crediamo che l'arte abbia il potere di trasformare, di aprire nuove prospettive e di collegare le persone attraverso la bellezza e la creatività.",
      "Nella nostra galleria troverete una vasta collezione di opere d'arte uniche, dalla pittura alla scultura, dalla fotografia all'arte digitale. Ogni opera ha una storia da raccontare, un messaggio da trasmettere e un'emozione da condividere.",
    ],
    imageUrl: "/gallery-info-image.png",
  };

  const galleryEvents: GalleryEventsProps = {
    eventDate: "11 ottobre 2023 / ore 20:00",
    eventText:
      "Un evento speciale dedicato alla presentazione delle opere più recentie straordinarie della nostra collezione. Ammirate le creazioni di talentuosi artisti contemporanei, interagite con gli artisti stessi e immergetevi nell'atmosfera vibrante dell'arte.",
    imgUrl: "/gallery-event.jpg",
    title: "Vernissage di Primavera: celebrazione dell'arte e della creatività",
    artists: [...Array(8).keys()].map((i) => ({
      isFavourite: i % 3 === 0,
      subtitle: "Torino, 1984",
      title: "Nome dell'artista",
    })),
    artworks: [...Array(8).keys()].map(() => ({
      artistName: "Nome dell' artista",
      galleryName: "Nome della galleria",
      price: 20000,
      size: "large",
      title: "Titolo dell’opera d’arte esposta sul sito di Artpay",
    })),
  };

  const galleryContacts: GalleryContactsProps = {
    address: "via della Rocca 39/A 10100, Torino",
    email: "info@galleria.it",
    phoneNumbers: ["+39 011 11 22 333", "+39 393 11 22 333"],
    website: "galleria.it",
  };

  return (
    <DefaultLayout>
      <Grid sx={{ p: 0, maxWidth: "1440px" }} container>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            maxHeight: { xs: "315px", sm: "660px" },
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}>
          <img src={galleryContent.imageSrc} style={{ width: "100%" }} />
        </Grid>
        <Grid
          item
          xs={12}
          p={3}
          md
          display="flex"
          justifyContent="center"
          flexDirection="column">
          <Typography sx={{ typography: { sm: "h1", xs: "h3" } }}>
            {galleryContent.title}
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
            {galleryContent.subtitle}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mt: 2, maxWidth: { md: "560px" } }}>
            {galleryContent.description}
          </Typography>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 3, sm: 0 }}
            mt={{ xs: 3, md: 7 }}
            sx={{ maxWidth: { md: "560px" } }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between">
            <Box display="flex" gap={{ xs: 1, md: 2 }}>
              {galleryContent.categories.map((category, index) => (
                <Chip
                  key={index}
                  label={category}
                  color="secondary"
                  size="small"
                />
              ))}
            </Box>
            <Button variant="outlined" endIcon={<Add />}>
              Follow
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Box mt={12}>
        <Box sx={{ borderBottom: 1, borderColor: "secondary", mx: 6 }}>
          <Tabs
            value={selectedTabPanel}
            onChange={(_, newValue) => setSelectedTabPanel(newValue)}
            color="secondary"
            centered>
            <Tab label="Informazioni galleria" />
            <Tab label="Eventi" />
            <Tab label="Contatti" />
          </Tabs>
        </Box>
        <TabPanel value={selectedTabPanel} index={0}>
          <GalleryInfo {...galleryInfo} />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={1}>
          <GalleryEvents {...galleryEvents} />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={2}>
          <GalleryContacts {...galleryContacts} />
        </TabPanel>
      </Box>
    </DefaultLayout>
  );
};
export default Gallery;
