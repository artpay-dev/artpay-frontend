import React from "react";
import { Add, Remove } from "@mui/icons-material";
import { Button } from "@mui/material";

export interface FollowButtonProps {
  isFavourite?: boolean;
  isLoading?: boolean;
  onClick?: (currentValue: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ isFavourite = false, isLoading = false, onClick = () => {} }) => {
  return (
    <Button
      disabled={isLoading}
      variant={isFavourite ? "contained" : "outlined"}
      onClick={() => onClick(isFavourite)}
      endIcon={isFavourite ? <Remove /> : <Add />}>
      {isFavourite ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default FollowButton;
