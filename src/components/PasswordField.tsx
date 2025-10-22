import React, { useState } from "react";
import {
  TextFieldProps,
  TextField as BaseTextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ShowIcon from "./icons/ShowIcon.tsx";
import HideIcon from "./icons/HideIcon.tsx";

export interface PasswordFieldProps {
  defaultVisible?: boolean;
}

const PasswordField = React.forwardRef<HTMLDivElement, TextFieldProps & PasswordFieldProps>(
    ({ InputProps = {}, defaultVisible = false, ...props }, ref) => {
      const [visible, setVisible] = useState(defaultVisible);
      InputProps.endAdornment = (
        <InputAdornment position="end">
          <IconButton onClick={() => setVisible(!visible)}>
            {visible ? <ShowIcon /> : <HideIcon />}
          </IconButton>
        </InputAdornment>
      );
      InputProps.type = visible ? "text" : "password";
      return <BaseTextField ref={ref} {...props} InputProps={InputProps} />;
    },
  );

export default PasswordField;
