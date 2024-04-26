import React, { useState } from "react";
import { Message, UserProfile } from "../types/user.ts";
import { Box, IconButton, Typography } from "@mui/material";
import AvatarCircle from "./AvatarCircle.tsx";
import { formatMessageDate } from "../utils.ts";
import AvatarCircleText from "./AvatarCircleText.tsx";
import TextField from "./TextField.tsx";
import { Send } from "@mui/icons-material";

export interface ChatContentProps {
  ready?: boolean;
  messages?: Message[];
  userProfile?: UserProfile;
  galleryImage?: string;
  onSendMessage?: (message: string) => Promise<void>;
}

const ChatContent: React.FC<ChatContentProps> = ({
                                                   ready = false,
                                                   messages = [],
                                                   galleryImage,
                                                   onSendMessage,
                                                   userProfile
                                                 }) => {
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    const msg = messageText;
    setSending(true);
    setMessageText("");
    if (onSendMessage) {
      await onSendMessage(msg);
    }
    setSending(false);
  };

  const initials = ((userProfile?.first_name || "").substring(0, 1) + (userProfile?.last_name || "").substring(0, 1)).toUpperCase();

  if (!ready) {
    return <></>;
  }
  return <Box display="flex" flexDirection="column" gap={3} sx={{ py: 3, px: { xs: 0, sm: 3 } }}>
    {messages.map((message, i) => (
      <Box key={`chat-msg-${i}`} display="flex"
           sx={{
             background: "#F5F5F5",
             borderRadius: "4px",
             mr: message.userMessage ? 0 : { xs: 4, sm: 7 },
             ml: message.userMessage ? { xs: 4, sm: 7 } : 0
           }} p={2}>
        <Box>
          {message.userMessage ? <AvatarCircleText text={initials} /> :
            <AvatarCircle imgUrl={galleryImage || "/images/gallery-logo-example.png"} />}
        </Box>
        <Box flexGrow={1} pl={1} display="flex" flexDirection="column">
          <Box display="flex">
            <Typography variant="subtitle1" flexGrow={1}>{message.userMessage ? "Tu" : "Galleria"}</Typography>
            <Typography variant="body2" color="textSecondary">{formatMessageDate(message.date.toDate())}</Typography>
          </Box>
          <Typography variant="subtitle1" color="textSecondary"
                      sx={{ whiteSpace: "preserve-breaks" }}>{message.text}</Typography>
        </Box>
      </Box>
    ))}
    <Box>
      <TextField placeholder="Scrivi un messaggio"
                 sx={{ mt: 6 }}
                 disabled={sending}
                 InputProps={{
                   endAdornment: <IconButton disabled={sending} onClick={handleSendMessage}
                                             color="primary"><Send /></IconButton>
                 }}
                 value={messageText}
                 onChange={(e) => setMessageText(e.target.value)}
                 onKeyUp={(e) => (e.key === "Enter" && !e.shiftKey) ? handleSendMessage() : undefined}
                 fullWidth />
    </Box>
  </Box>;
};

export default ChatContent;
