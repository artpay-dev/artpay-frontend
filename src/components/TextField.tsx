import React from "react";
import {
  TextFieldProps,
  TextField as BaseTextField,
  InputAdornment,
} from "@mui/material";
import ErrorIcon from "./icons/ErrorIcon.tsx";
import CheckIcon from "./icons/CheckIcon.tsx";

export interface ExtendedTextFieldProp {

}

const TextField: React.FC<TextFieldProps & ExtendedTextFieldProp> =
  React.forwardRef(({ ...props }, ref) => {
    const extraProps: Partial<TextFieldProps> = {};
    if (props.error) {
      extraProps.InputProps = {
        endAdornment: props.InputProps?.endAdornment || (
          <InputAdornment position="end">
            <ErrorIcon sx={{ mr: 1 }} color="error" />
          </InputAdornment>
        )
      };
    }
    if (props.color === "success") {
      extraProps.InputProps = {
        endAdornment: props.InputProps?.endAdornment || (
          <InputAdornment position="end">
            <CheckIcon sx={{ mr: 1 }} color="success" />
          </InputAdornment>
        )
      };
    }

    return <BaseTextField ref={ref} {...props} {...extraProps} />;
  });

export default TextField;
