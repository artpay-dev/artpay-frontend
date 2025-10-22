import React, { ReactNode } from "react";
import { Box } from "@mui/material";

export interface OrderCardProps {
  children?: ReactNode | ReactNode[];
  imgSrc?: string;
  leftCta?: ReactNode | ReactNode[];
}

const OrderCard: React.FC<OrderCardProps> = ({ children, imgSrc, leftCta }) => {

  return (
    <Box
      sx={{
        borderRadius: "8px",
        backgroundColor: "#FAFAFB",
        p: 3,
        flex: "2 1",
        gridTemplateColumns: { xs: undefined, sm: "250px 1fr", md: "150px 1fr", lg: "200px 1fr" },
        height: "100%",
        flexDirection: { xs: "column", sm: "row" }
      }}
      gap={3}
      display="grid">
        {imgSrc === "" ? (<></>) : (
          <Box sx={{ width: { xs: "auto" } }} display="flex" flexDirection="column">
            <img
              style={{
                width: "100%",//useMediaQuery(theme.breakpoints.down("sm")) ? "100%" : "100%",
                borderRadius: "8px",
                aspectRatio: 1,
                objectFit: "cover"
              }}
              alt={'Order image'}
              src={imgSrc}
            />
            {leftCta}
          </Box>
        )}
      <Box display="flex" flexDirection="column">
        {children}
      </Box>
    </Box>
  );
};

export default OrderCard;
