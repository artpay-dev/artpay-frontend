import React, { ReactNode } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";

export interface OrderCardProps {
  children?: ReactNode | ReactNode[];
  imgSrc?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ children, imgSrc }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px solid #D9D9D9`,
        borderRadius: "5px",
        p: 3,
        flex: "200px 0",
        height: "100%",
        flexDirection: { xs: "column", sm: "row" },
      }}
      gap={3}
      display="flex">
      <Box>
        <img
          style={{ width: useMediaQuery(theme.breakpoints.down("sm")) ? "100%" : "200px", borderRadius: "5px" }}
          src={imgSrc}
        />
      </Box>
      <Box display="flex" flexDirection="column">
        {children}
      </Box>
    </Box>
  );
};

export default OrderCard;
