import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { Box, Button, CircularProgress, Divider, Grid, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { galleryToGalleryItem, getDefaultPaddingX, getVendorId } from "../utils.ts";
import CloseIcon from "../components/icons/CloseIcon.tsx";
import ChatList, { ChatMessage } from "../components/ChatList.tsx";
import { Message, UserProfile } from "../types/user.ts";
import { GalleryCardProps } from "../components/GalleryCard.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import ChatContent from "../components/ChatContent.tsx";
import ArtworkMessageDetails from "../components/ArtworkMessageDetails.tsx";
import { Artwork } from "../types/artwork.ts";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon.tsx";

export interface MessagesProps {}

const Messages: React.FC<MessagesProps> = ({}) => {
  const data = useData();
  const snackbar = useSnackbars();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [ready, setReady] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDetailsAnimationEnded, setShowDetailsAnimationEnded] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<GalleryCardProps>();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork>();
  const [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    Promise.all([
      data.getUserProfile().then((resp) => {
        setUserProfile(resp);
      }),
      data.getChatHistory().then(async (groupedMessages) => {
        const chatHistory: ChatMessage[] = await Promise.all(
          groupedMessages.map(async (msg) => {
            const vendorId = getVendorId(msg.product);
            const gallery = vendorId
              ? galleryToGalleryItem(await data.getGallery(vendorId))
              : galleryToGalleryItem(undefined);
            const mappedMsg: ChatMessage = {
              date: msg.lastMessageDate.toDate(),
              excerpt: msg.product.name,
              id: msg.product.id,
              imgUrl: gallery.logoUrl || "",
              newMessages: 0,
              title: gallery.title,
            };
            return mappedMsg;
          }),
        );
        setChatHistory(chatHistory);
      }),
    ]).then(() => {
      setReady(true);
    });
  }, []);

  const handleSelectChat = async (msg: ChatMessage) => {
    const wasReady = chatReady;
    setChatReady(false);
    setLoadedMessages([]);
    setSelectedGallery(undefined);
    try {
      const selectedArtwork = await data.getArtwork(msg.id.toString());
      setSelectedArtwork(selectedArtwork);
      const vendorId = getVendorId(selectedArtwork);
      const selectedGallery = vendorId
        ? await data.getGallery(vendorId)
        : undefined;
      setSelectedGallery(galleryToGalleryItem(selectedGallery));

      const messages = await data.getProductChatHistory(msg.id);
      setLoadedMessages(messages);
      if (!wasReady && !isMobile) {
        setShowDetails(true);
      }

      setChatReady(true);
    } catch (e) {
      await snackbar.error(e);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedArtwork?.id) {
      return;
    }
    try {
      await data.sendQuestionToVendor({ product_id: selectedArtwork?.id, question: text });
      const messages = await data.getProductChatHistory(selectedArtwork?.id);
      setLoadedMessages(messages);
    } catch (e) {
      await snackbar.error(e);
    }
  };

  const px = getDefaultPaddingX();

  if (isMobile) {
    return (
      <DefaultLayout pageLoading={!ready} sx={{ overflowX: "hidden", minHeight: "30vh" }}>
        <Grid sx={{ px: px, mt: { xs: 11, sm: 12, md: 12 }, mb: 12 }} container>
          <Grid sx={{ borderBottom: "1px solid #CDCFD3", py: { xs: 1, md: 5 } }} item xs={12}>
            {chatReady ? (
              showDetails ? (
                <Button
                  variant="text"
                  color="secondary"
                  sx={{ px: 2, mx: -2 }}
                  onClick={() => setShowDetails(false)}
                  startIcon={<ArrowLeftIcon fontSize="inherit" color="secondary" />}>
                  Torna alla conversazione
                </Button>
              ) : (
                <Box display="flex">
                  <Button
                    variant="text"
                    color="secondary"
                    sx={{ px: 2, mx: -2 }}
                    onClick={() => {
                      setShowDetails(false);
                      setChatReady(false);
                    }}
                    startIcon={<ArrowLeftIcon fontSize="inherit" color="secondary" />}>
                    Torna ai messaggi
                  </Button>
                  <Box flexGrow={1} />
                  <Button variant="text" color="secondary" sx={{ px: 2, mx: -2 }} onClick={() => setShowDetails(true)}>
                    Dettagli
                  </Button>
                </Box>
              )
            ) :
              <></>
            }
          </Grid>
          {chatReady ? (
            showDetails ? (
              <Grid item xs={12}>
                <ArtworkMessageDetails artwork={selectedArtwork} />
              </Grid>
            ) : (
              <Grid item sx={{ minHeight: { xs: 0 } }} xs={12}>
                <ChatContent
                  ready={chatReady}
                  messages={loadedMessages}
                  userProfile={userProfile}
                  galleryImage={selectedGallery?.logoUrl}
                  onSendMessage={handleSendMessage}
                />
              </Grid>
            )
          ) : (
            <Grid item sx={{ minHeight: { xs: 0 } }} xs={12}>
              {!ready ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                  <CircularProgress />
                </Box>
              ) : chatHistory.length > 0 ? (
                <ChatList onClick={handleSelectChat} messages={chatHistory} />
              ) : (
                <div className={"emptyBoxMessages"}>
                  <Typography variant={"subtitle1"} marginTop={4}>Nessun messaggio qui, per ora.</Typography>
                </div>
              )}
            </Grid>
          )}
        </Grid>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout pageLoading={!ready} sx={{ overflowX: "hidden" }}>
      <Grid sx={{ px: px, mt: { xs: 10, sm: 12, md: 12 }, mb: 12 }} container>

        <Grid item sx={{ borderRight: "1px solid #CDCFD3", minHeight: isMobile ? undefined : "60vh" }} xs={12} md={3}>
          <Box
            sx={{ borderBottom: "1px solid #CDCFD3", height: "68px" }}
            display="flex"
            alignItems="center"
            justifyContent="flex-start">
            <Typography variant="subtitle1">Messaggi</Typography>
          </Box>
          <Box>
            <ChatList onClick={handleSelectChat} messages={chatHistory} />
          </Box>
        </Grid>

        <Grid
          item
          sx={{ borderRight: "1px solid #CDCFD3", transition: "all 0.3s" }}
          onTransitionEnd={() => setTimeout(() => setShowDetailsAnimationEnded(showDetails), 50)}
          xs={12}
          md={showDetails ? 6 : 9}>
          <Box
            sx={{ px: 3, borderBottom: "1px solid #CDCFD3", height: "68px" }}
            display="flex"
            alignItems="center"
            justifyContent="center">
            <Typography variant="subtitle1">{selectedGallery?.title || ""}</Typography>
            <Box flexGrow={1} />
            {selectedArtwork && !isMobile && (
              <Button
                variant="text"
                color="primary"
                disabled={showDetails !== showDetailsAnimationEnded}
                onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Nascondi dettagli" : "Mostra dettagli"}
              </Button>
            )}
          </Box>
          <Box height={"100%"}>
            {!ready ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                <CircularProgress />
              </Box>
            ) : chatHistory.length > 0 ? (
              <ChatContent
                ready={chatReady}
                messages={loadedMessages}
                galleryImage={selectedGallery?.logoUrl}
                onSendMessage={handleSendMessage}
                userProfile={userProfile}
              />
            ) : (
              <div className={"emptyBoxMessages"}>
                <Typography variant={"subtitle1"}>Nessun messaggio qui, per ora.</Typography>
              </div>
            )}
          </Box>
        </Grid>
        {showDetails && !isMobile && (
          <Grid item xs={12} md={3}>
            {showDetailsAnimationEnded && (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{ borderBottom: "1px solid #CDCFD3", pl: 3, height: "68px" }}>
                  <Typography variant="subtitle1">Dettagli</Typography>
                  <Box flexGrow={1} />
                  <IconButton
                    onClick={() => {
                      setShowDetailsAnimationEnded(false);
                      setShowDetails(false);
                    }}
                    color="primary">
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </Box>
                <ArtworkMessageDetails artwork={selectedArtwork} />
                <Divider sx={{ mx: 3 }} />
              </>
            )}
          </Grid>
        )}
      </Grid>
    </DefaultLayout>
  );
};

export default Messages;
