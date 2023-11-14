import React from "react";
import { FormControlLabel, FormControlLabelProps, Radio } from "@mui/material";
import RadioIcon from "./icons/RadioIcon.tsx";

export interface RadioButtonProps {}

const RadioButton: React.FC<
  Omit<FormControlLabelProps, "control"> & RadioButtonProps
> = (props) => {
  return (
    <FormControlLabel
      control={
        <Radio
          icon={<RadioIcon disabled={props.disabled} />}
          checkedIcon={<RadioIcon checked disabled={props.disabled} />}
        />
      }
      {...props}
    />
  );
};

export default RadioButton;
