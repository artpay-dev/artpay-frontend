import { Box, Typography } from "@mui/material";
import React, { ReactNode } from "react";

export interface CardListProps {
  title?: string;
  children?: ReactNode | ReactNode[];
}

const CardList: React.FC<CardListProps> = ({ title, children }) => {
  return (
    <Box sx={{ px: { xs: 3, md: 6 }, maxWidth: "100%" }}>
      {title && (
        <Typography sx={{ mb: { md: 6 } }} variant="h3">
          {title}
        </Typography>
      )}
      <Box
        display="flex"
        gap={3}
        sx={{
          maxWidth: "100%",
          overflow: "auto",
          minHeight: "318px",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: { xs: "wrap", md: "nowrap" },
          justifyContent: { xs: "center", md: "flex-start" },
        }}>
        {children}
      </Box>
    </Box>
  );
};

export default CardList;
