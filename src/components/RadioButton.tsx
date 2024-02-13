import React, { ReactNode } from "react";
import { Box, FormControlLabel, FormControlLabelProps, Radio, Typography } from "@mui/material";
import RadioIcon from "./icons/RadioIcon.tsx";

export interface RadioButtonProps {
  description?: string | ReactNode;
}

const RadioButton: React.FC<Omit<FormControlLabelProps, "control"> & RadioButtonProps> = ({
  description,
  label,
  ...props
}) => {
  return (
    <FormControlLabel
      sx={{ alignItems: description ? "baseline" : "center" }}
      control={
        <Radio
          icon={<RadioIcon disabled={props.disabled} />}
          checkedIcon={<RadioIcon checked disabled={props.disabled} />}
        />
      }
      label={
        description ? (
          <Box>
            <Typography variant="body1">{label}</Typography>
            <Typography sx={{ pt: 0.5 }} variant="body2" color="textSecondary">
              {description}
            </Typography>
          </Box>
        ) : (
          label
        )
      }
      {...props}
    />
  );
};

export default RadioButton;
