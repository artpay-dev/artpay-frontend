import React, { useRef, useState } from "react";
import Avatar from "./Avatar.tsx";
import { Box, Button } from "@mui/material";

export interface AvatarSelectorProps {
  buttonText?: string;
  src?: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ src, buttonText = "Modifica immagine profilo" }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImg, setSelectedImg] = useState(src);

  const handleSelectImage = () => {
    if (!inputRef?.current) {
      return;
    }
    inputRef.current.click();
  };
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function() {
        if (typeof reader.result === "string") {
          setSelectedImg(reader.result);
        }
      };
      reader.readAsDataURL(file);
      //event.target.files[0]
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={3}>
      <Avatar src={selectedImg} />
      <Button variant="link" disabled onClick={() => handleSelectImage()}>
        {buttonText}
      </Button>
      <input
        type="file"
        name="avatar-img"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileSelected}
        accept="image/*"
      />
    </Box>
  );
};

export default AvatarSelector;
