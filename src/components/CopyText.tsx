import React, { useRef, useState } from "react";
import { Box, IconButton, Popover, Typography, TypographyProps } from "@mui/material";
import { CopyAll } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";

export interface CopyTextProps extends TypographyProps{
  text: string;
}

const CopyText: React.FC<CopyTextProps> = ({ text, ...props }) => {
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const handleClose = () => {
    setCopied(false);
  };

  return (<>
    <Box display="flex">
      <CopyToClipboard text={text} onCopy={() => handleCopy()}>
        <IconButton ref={copyButtonRef}>
          <CopyAll color="primary" />
        </IconButton>
      </CopyToClipboard>
      <Typography {...props}>
        {text}
      </Typography>
    </Box>
    {copyButtonRef?.current && (
      <Popover
        id="copy-link"
        anchorEl={copyButtonRef.current}
        open={copied}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}>
        <Typography sx={{ p: 2 }}>Testo copiato</Typography>
      </Popover>
    )}
  </>);
};

export default CopyText;
