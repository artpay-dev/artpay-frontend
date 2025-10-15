import React, { ReactNode } from "react";
import { Box } from "@mui/material";

export interface OrderCardProps {
  children?: ReactNode | ReactNode[];
  imgSrc?: string;
  leftCta?: ReactNode | ReactNode[];
  orderId?: number;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ children, imgSrc, leftCta, orderId, onClick }) => {


  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: "8px",
        backgroundColor: "#FAFAFB",
        p: 3,
        flex: "2 1",
        gridTemplateColumns: { xs: undefined, sm: "250px 1fr", md: "150px 1fr", lg: "200px 1fr" },
        height: "100%",
        flexDirection: { xs: "column", sm: "row" },
        cursor: onClick ? "pointer" : "default",
        transition: "background-color 0.2s",
        "&:hover": onClick ? {
          backgroundColor: "#f0f0f5"
        } : {}
      }}
      gap={3}
      display="grid">
        {imgSrc === "" ? (<></>) : (
          <Box sx={{ width: { xs: "auto" } }} display="flex" flexDirection="column" gap={4}>
            <span>N. Ordine {orderId}</span>
            <img
              style={{
                width: "100%",//useMediaQuery(theme.breakpoints.down("sm")) ? "100%" : "100%",
                borderRadius: "8px",
                aspectRatio: 1,
                objectFit: "cover",
                height: "100%"
              }}
              alt={'Order image'}
              src={imgSrc}
            />
            {leftCta}
          </Box>
        )}
      <Box display="flex" flexDirection="column" mt={6}>
        {children}
      </Box>
    </Box>
  );
};

export default OrderCard;
