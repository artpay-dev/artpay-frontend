import React from "react";
import {
  FormControlLabel,
  Checkbox as BaseCheckbox,
  CheckboxProps,
} from "@mui/material";
import CheckboxIcon from "./icons/CheckboxIcon.tsx";

export interface ExtendedCheckboxProps {
  label: string;
}

const Checkbox: React.FC<ExtendedCheckboxProps & CheckboxProps> = ({
  label,
  ...props
}) => {
  return (
    <FormControlLabel
      label={label}
      control={
        <BaseCheckbox
          icon={<CheckboxIcon size={props.size} disabled={props.disabled} />}
          checkedIcon={
            <CheckboxIcon size={props.size} disabled={props.disabled} checked />
          }
          {...props}
        />
      }
    />
  );
};

export default Checkbox;
