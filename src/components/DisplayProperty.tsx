import React from "react";
import { Box, BoxProps, Typography, TypographyOwnProps } from "@mui/material";
import CopyText from "./CopyText.tsx";

export interface DisplayPropertyProps {
  label: string;
  value: string;
  gap?: number;
  copy?: boolean;
  variant?: TypographyOwnProps["variant"];
  sx?: BoxProps["sx"];
}

const DisplayProperty: React.FC<DisplayPropertyProps> = ({
                                                           label,
                                                           value,
                                                           copy = false,
                                                           gap = 1,
                                                           variant = "subtitle1",
                                                           sx = {}
                                                         }) => {
  return (
    <Box sx={sx}>
      <Typography variant={variant} fontWeight={600}>
        {label}
      </Typography>
      {copy ?
        <CopyText sx={{ mt: gap }} text={value} variant={variant}/> :
        <Typography sx={{ mt: gap }} variant={variant}>
          {value || "-"}
        </Typography>}
    </Box>
  );
};

export default DisplayProperty;
