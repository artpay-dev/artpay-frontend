import React from "react";
import { Message } from "../types/user.ts";
import { Box, Typography } from "@mui/material";
import AvatarCircle from "./AvatarCircle.tsx";
import { formatMessageDate } from "../utils.ts";
import AvatarCircleText from "./AvatarCircleText.tsx";

export interface ChatContentProps {
  ready?: boolean;
  messages?: Message[];
}

const ChatContent: React.FC<ChatContentProps> = ({ ready = false, messages = [] }) => {

  if (!ready) {
    return <></>;
  }
  return <Box display="flex" flexDirection="column" gap={3} p={3}>
    {messages.map((message, i) => (
      <Box key={`chat-msg-${i}`} display="flex"
           sx={{
             background: "#F5F5F5",
             borderRadius: "4px",
             mr: message.userMessage ? 0 : 7,
             ml: message.userMessage ? 7 : 0
           }} p={2}>
        <Box>
          {message.userMessage ? <AvatarCircleText text="LP" /> :
            <AvatarCircle imgUrl="/images/gallery-logo-example.png" />}
        </Box>
        <Box flexGrow={1} pl={1} display="flex" flexDirection="column">
          <Box display="flex">
            <Typography variant="subtitle1" flexGrow={1}>{message.userMessage ? "Tu" : "Galleria"}</Typography>
            <Typography variant="body2" color="textSecondary">{formatMessageDate(message.date.toDate())}</Typography>
          </Box>
          <Typography variant="subtitle1" color="textSecondary">{message.text}</Typography>
        </Box>
      </Box>
    ))}
  </Box>;
};

export default ChatContent;
