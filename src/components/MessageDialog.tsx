import React, { useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface MessageDialogProps {
  closeDialog: (value: unknown) => void;
  galleryName?: string;
}

const MessageDialog: React.FC<MessageDialogProps> = ({ galleryName }) => {
  const auth = useAuth();
  const [messageSent, setMessageSent] = useState(false);

  const handleSendMessage = () => {

  };

  return (<Box px={3} pt={1} pb={3} display="flex" flexDirection="column">
    <Box display="grid" sx={{ gridTemplateColumns: "24px 1fr", gap: 2 }}>
      <Typography variant="body1" color="textSecondary">Da: </Typography>
      <Typography variant="body1">{auth.user?.email}</Typography>
    </Box>
    <Box display="grid" sx={{ gridTemplateColumns: "24px 1fr", gap: 2 }} my={2}>
      <Typography variant="body1" color="textSecondary">A: </Typography>
      <Typography variant="body1">{galleryName}</Typography>
    </Box>
    <Divider />
  </Box>);
};

export default MessageDialog;
