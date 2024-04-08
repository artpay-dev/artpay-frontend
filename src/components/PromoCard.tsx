import React, { ReactNode } from "react";
import { Box, Typography, TypographyProps, useTheme } from "@mui/material";

export interface PromoCardProps {
  title: string | ReactNode;
  children?: ReactNode;
  variant?: "standard" | "contrast";
  titleVariant?: TypographyProps["variant"];
  border?: boolean;
}

const PromoCard: React.FC<PromoCardProps> = ({
                                               title,
                                               children,
                                               variant = "standard",
                                               titleVariant = "display3"
                                             }) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      sx={{
        "&:hover": {
          border: variant === "standard" ? `4px solid ${theme.palette.primary.main}` : "none"
        },
        transition: "0.5s border",
        border: variant === "standard" ? `4px solid transparent` : "none",
        flexDirection: { xs: "column", md: "row" },
        borderRadius: "24px",
        background: variant === "contrast" ? theme.palette.primary.main : "white",
        boxShadow: variant === "contrast" ? "none" : "0px 4px 64px 0px rgba(1, 15, 34, 0.08)",
        alignItems: { xs: "flex-start", md: "center" },
        py: { xs: 6, md: 6 },
        px: { xs: 4, md: 13 }
      }}>
      <Typography
        sx={{ flexGrow: 1, px: { xs: 0, sm: 3 } }}
        color={variant === "contrast" ? theme.palette.primary.contrastText : undefined}
        variant={titleVariant}>
        {title}
      </Typography>
      <Box
        sx={{
          maxWidth: variant === "contrast" ? undefined : { xs: undefined, md: "250px", lg: "400px" },
          mt: { xs: 3, md: 0 }
        }}>
        {children}
      </Box>
    </Box>
  );
};

export default PromoCard;
