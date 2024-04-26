import React, { useState } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { ArtworkCardProps } from "./ArtworkCard.tsx";
import TextField from "./TextField.tsx";
import UserIcon from "./icons/UserIcon.tsx";
import SuccessIcon from "./icons/SuccessIcon.tsx";
import AlertIcon from "./icons/AlertIcon.tsx";
import { UserProfile } from "../types/user.ts";
import { DataContext } from "../hoc/DataProvider.tsx";

export interface MessageDialogProps {
  closeDialog: (value: unknown) => void;
  galleryName?: string;
  artwork?: ArtworkCardProps;
  userProfile?: UserProfile;
  data: DataContext;
}

const MessageDialog: React.FC<MessageDialogProps> = ({ data, galleryName, artwork, userProfile, closeDialog }) => {
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSaving, setIsSaving] = useState(false);


  const handleSendMessage = () => {
    if (!artwork) {
      setError(true);
      console.error("no artwork");
      return;
    }
    setIsSaving(true);
    if (error) {
      setError(false);
    }


    data.sendQuestionToVendor({
      product_id: +artwork.id,
      question: messageText
    }).then(() => {
      setMessageSent(true);
    }).catch((e) => {
      setError(true);
    }).finally(() => setIsSaving(false));
  };

  const handleClose = () => {
    closeDialog(true);
  };

  return (
    <Box px={3} pt={1} pb={3} sx={{ minWidth: { xs: undefined, sm: "560px" } }} display="flex" flexDirection="column">
      <Box display="grid" sx={{ gridTemplateColumns: "24px 1fr", gap: 2 }}>
        <Typography variant="body1" color="textSecondary">Da: </Typography>
        <Typography
          variant="body1">{userProfile?.first_name} {userProfile?.last_name} ({userProfile?.email})</Typography>
      </Box>
      <Box display="grid" sx={{ gridTemplateColumns: "24px 1fr", gap: 2 }} my={2}>
        <Typography variant="body1" color="textSecondary">A: </Typography>
        <Typography variant="body1">{galleryName}</Typography>
      </Box>
      <Divider />
      <Box mt={2} mb={4} display="flex" alignItems="center">
        <img src={artwork?.imgUrl}
             style={{
               borderRadius: "4px",
               width: "48px",
               height: "48px",
               background: "#CDCFD3",
               objectFit: "cover"
             }} />
        <Box ml={2}>
          <Typography variant="body1">{artwork?.title}</Typography>
          <Typography variant="body1" color="textSecondary">{artwork?.artistName}</Typography>
        </Box>
      </Box>
      {messageSent ?
        <>
          <Typography variant="body1" color="textSecondary">Messaggio:</Typography>
          <Typography variant="body1" component="pre" sx={{ mt: 1, mb: 5 }}>{messageText}</Typography>
          <Typography variant="body2" color="success.main"><SuccessIcon color="success" fontSize="inherit" />
            Messaggio inviato con successo!</Typography>
        </> :
        <>
          <TextField placeholder="Il tuo messaggio"
                     disabled={isSaving}
                     onChange={(e) => setMessageText(e.currentTarget.value)} multiline
                     rows={8} />
        </>
      }
      <Typography sx={{ mt: 1 }} variant="body2" color="textSecondary"> <UserIcon fontSize="inherit" /> Nella tua
        area riservata puoi controllare tutti messaggi inviati e ricevuti.</Typography>
      {messageSent ?
        <Button sx={{ mt: 4 }} color="primary" variant="outlined" fullWidth onClick={handleClose}> Chiudi</Button> :
        <Button sx={{ mt: 4 }} color="primary" variant="contained" disabled={!messageText || isSaving} fullWidth
                onClick={handleSendMessage}>Invia
          messaggio</Button>
      }
      {(error && !messageSent) &&
        <Typography sx={{ mt: 1 }} variant="body2" color="error"><AlertIcon color="error" fontSize="inherit" /> Si è
          verificato un problema: riprova.</Typography>}
    </Box>);
};

export default MessageDialog;
