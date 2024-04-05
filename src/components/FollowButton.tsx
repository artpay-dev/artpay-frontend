import React from "react";
import { Add, Check, Remove } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { ButtonProps } from "@mui/material/Button/Button";

export interface FollowButtonProps {
  isFavourite?: boolean;
  isLoading?: boolean;
  onClick?: (currentValue: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
                                                     isFavourite = false, isLoading = false, onClick = () => {
  }
                                                   }) => {
  return (
    /*    <Button
          disabled={isLoading}
          variant={isFavourite ? "contained" : "outlined"}
          onClick={() => onClick(isFavourite)}
          endIcon={isFavourite ? <Remove /> : <Add />}>
          {isFavourite ? "Following" : "Follow"}
        </Button>*/
    <Box gap={1} display="flex">
      <Typography variant="body1" color="primary">{isFavourite ? "Following" : "Follow"}</Typography>
      <IconButton color="primary" size="xs" variant={isFavourite ? "contained" : "outlined"}
                  onClick={() => onClick(isFavourite)}>{isFavourite ?
        <Check fontSize="small" /> : <Add fontSize="small" />}</IconButton>
    </Box>
  );
};

export default FollowButton;
