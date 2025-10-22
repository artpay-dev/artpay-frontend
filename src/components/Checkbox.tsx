import React, { ReactNode } from "react";
import {
  FormControlLabel,
  Checkbox as BaseCheckbox,
  CheckboxProps,
  SxProps,
  Theme, TypographyProps
} from "@mui/material";
import CheckboxIcon from "./icons/CheckboxIcon.tsx";

export interface ExtendedCheckboxProps {
  label: string | ReactNode;
  checkboxSx?: SxProps<Theme>;
  alignTop?: boolean;
  error?: boolean;
  textColor?: TypographyProps["color"];
}

const Checkbox = React.forwardRef<HTMLButtonElement, ExtendedCheckboxProps & CheckboxProps>(
    ({ label, checkboxSx = {}, alignTop = false, error, textColor = "inherit", ...props }, ref) => {
      const sx: { [key: string]: unknown } = {};
      if (alignTop) {
        sx["transform"] = "translateY(-5px)";
        sx["alignSelf"] = "flex-start";
      }
      Object.assign(sx, checkboxSx);
      return (
        <FormControlLabel
          label={label}
          componentsProps={{
            typography: {
              color: error ? "error" : textColor,
              variant: props.size === "small" ? "body2" : "body1"
            }
          }}
          control={
            <BaseCheckbox
              ref={ref}
              sx={{ ...sx, ...checkboxSx }}
              icon={
                <CheckboxIcon size={props.size} disabled={props.disabled} />
              }
              checkedIcon={
                <CheckboxIcon
                  size={props.size}
                  disabled={props.disabled}
                  checked
                />
              }
              {...props}
            />
          }
        />
      );
    }
  );

export default Checkbox;
