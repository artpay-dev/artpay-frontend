import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import { artworkToGalleryItem, galleryToGalleryItem, getDefaultPaddingX } from "../utils.ts";
import { ArrowLeft } from "@mui/icons-material";
import CloseIcon from "../components/icons/CloseIcon.tsx";
import ChatList, { ChatMessage } from "../components/ChatList.tsx";
import dayjs from "dayjs";
import { Message } from "../types/user.ts";
import { GalleryCardProps } from "../components/GalleryCard.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import ChatContent from "../components/ChatContent.tsx";

export interface MessagesProps {

}

const Messages: React.FC<MessagesProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();

  const [ready, setReady] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<GalleryCardProps>();
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkCardProps>();


  const dummyMessages: ChatMessage[] = [
    {
      date: new Date(),
      title: "Galleria Lorem Ipsum",
      excerpt: "Messaggio lorem ipsum dolor sit amet conswehf lore umpur sul lorem ipsum dolor",
      id: 173,
      imgUrl: "/images/gallery-logo-example.png"
    },
    {
      date: dayjs(new Date()).subtract(1, "day").toDate(),
      title: "Galleria Lorem Ipsum",
      excerpt: "Messaggio lorem ipsum dolor sit amet conswehf lore umpur sul lorem ipsum dolor",
      id: 643,
      imgUrl: "/images/gallery-logo-example.png",
      newMessages: 1
    },
    {
      date: dayjs(new Date()).subtract(3, "day").toDate(),
      title: "Galleria Lorem Ipsum",
      excerpt: "Messaggio lorem ipsum dolor sit amet conswehf lore umpur sul lorem ipsum dolor",
      id: 643,
      imgUrl: "/images/gallery-logo-example.png",
      newMessages: 2
    },
    {
      date: dayjs(new Date()).subtract(7, "day").toDate(),
      title: "Galleria Lorem Ipsum",
      excerpt: "Messaggio lorem ipsum dolor sit amet conswehf lore umpur sul lorem ipsum dolor",
      id: 643,
      imgUrl: "/images/gallery-logo-example.png",
      newMessages: 0
    }
  ];

  useEffect(() => {
    setReady(true);
  }, []);

  const handleSelectChat = async (msg: ChatMessage) => {
    setChatReady(false);
    setLoadedMessages([]);
    setSelectedGallery(undefined);
    try {
      const selectedArtwork = await data.getArtwork(msg.id.toString());
      setSelectedArtwork(artworkToGalleryItem(selectedArtwork));
      const selectedGallery = await data.getGallery(selectedArtwork.vendor);
      setSelectedGallery(galleryToGalleryItem(selectedGallery));

      const messages = await data.getChatHistory(msg.id);
      console.log("messages", messages);
      setLoadedMessages(messages);
      setShowDetails(true);
      setChatReady(true);
    } catch (e) {
      await snackbar.error(e);
    }
  };

  const px = getDefaultPaddingX();

  return (<DefaultLayout pageLoading={!ready} sx={{ overflowX: "hidden" }}>
    <Grid sx={{ px: px, mt: { xs: 0, sm: 12, md: 12 }, mb: 12 }} container>
      <Grid sx={{ borderBottom: "1px solid #CDCFD3", py: 5 }} item xs={12}>
        <Button startIcon={<ArrowLeft />} variant="text" color="secondary">Torna al profilo</Button>
      </Grid>
      <Grid item sx={{ borderRight: "1px solid #CDCFD3", minHeight: "60vh" }} xs={12} md={3}>
        <Box sx={{ borderBottom: "1px solid #CDCFD3", height: "68px" }} display="flex" alignItems="center"
             justifyContent="flex-start">
          <Typography variant="subtitle1">Messaggi</Typography>
        </Box>
        <Box>
          <ChatList onClick={handleSelectChat} messages={dummyMessages} />
        </Box>
      </Grid>
      <Grid item sx={{ borderRight: "1px solid #CDCFD3", transition: "all 0.3s" }} xs={12} md={showDetails ? 6 : 9}>
        <Box sx={{ px: 3, borderBottom: "1px solid #CDCFD3", height: "68px" }} display="flex" alignItems="center"
             justifyContent="center">
          <Typography variant="subtitle1">{selectedGallery?.title || ""}</Typography>
          <Box flexGrow={1} />
          <Button variant="text"
                  color="primary"
                  onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Nascondi dettagli" : "Mostra dettagli"}
          </Button>
        </Box>
        <Box>
          <ChatContent ready={chatReady} messages={loadedMessages} />
        </Box>
      </Grid>
      {showDetails && <Grid item sx={{}} xs={12} md={3}>
        <Box display="flex" alignItems="center" justifyContent="center"
             sx={{ borderBottom: "1px solid #CDCFD3", pl: 3, height: "68px" }}>
          <Typography variant="subtitle1">Dettagli</Typography>
          <Box flexGrow={1} />
          <IconButton onClick={() => setShowDetails(false)} color="primary"><CloseIcon
            fontSize="inherit" /></IconButton>
        </Box>
      </Grid>}
    </Grid>
  </DefaultLayout>);
};

export default Messages;
