import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { formatMessageDate } from "../utils.ts";
import AvatarCircle from "./AvatarCircle.tsx";

export interface ChatMessage {
  id: number;
  imgUrl: string;
  title: string;
  excerpt: string;
  date: Date;
  newMessages?: number;
}

export interface ChatListProps {
  messages: ChatMessage[];
  onClick?: (msg: ChatMessage) => void;
}

const ChatList: React.FC<ChatListProps> = ({ messages, onClick }) => {

  const theme = useTheme();

  const handleClick = (msg: ChatMessage) => {
    if (onClick) {
      onClick(msg);
    }
  };

  return (<Box display="flex" flexDirection="column">
    {messages.map((message, i) => <Box sx={{
      borderBottom: "1px solid #CDCFD3",
      display: "flex",
      gap: 1,
      px: 1,
      cursor: "pointer",
      "&:hover": {
        background: "#F5F5F5"
      }
    }} onClick={() => handleClick(message)} key={`msg-${i}`} py={2}>
      <AvatarCircle imgUrl={message.imgUrl} alt={message.title} />
      <Box display="flex" flexDirection="column" justifyContent="space-between">
        <Box display="flex">
          <Typography variant="body2" fontWeight={500} flexGrow={1}>{message.title}</Typography>
          <Typography variant="body2" fontWeight={500}
                      color={message.newMessages ? "primary" : "textSecondary"}>{formatMessageDate(message.date)}</Typography>
        </Box>
        <Box display="flex">
          <Typography variant="body2" fontWeight={500} color="textSecondary"
                      sx={{ maxHeight: "28px", overflow: "hidden" }}
                      flexGrow={1}>{message.excerpt}</Typography>
          <Box sx={{ width: "80px" }} display="flex" alignItems="center" justifyContent="flex-end">
            {message.newMessages ? <Box
              display="flex" alignItems="center" justifyContent="center"
              sx={{
                background: theme.palette.primary.main,
                height: "20px",
                width: "20px",
                borderRadius: "10px",
                textAlign: "center"
              }}>
              <Typography variant="body2" textAlign="center" fontWeight={500}
                          color="white">{message.newMessages}</Typography>
            </Box> : <></>}
          </Box>
        </Box>
      </Box>

    </Box>)}
  </Box>);
};

export default ChatList;
