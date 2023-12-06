import React from "react";
import { Box, Typography } from "@mui/material";

export interface DisplayPropertyProps {
  label: string;
  value: string;
}

const DisplayProperty: React.FC<DisplayPropertyProps> = ({ label, value }) => {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>
        {label}
      </Typography>
      <Typography sx={{ mt: 1 }} variant="subtitle1">
        {value || "-"}
      </Typography>
    </Box>
  );
};

export default DisplayProperty;
