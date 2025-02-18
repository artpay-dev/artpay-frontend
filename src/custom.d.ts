import "react";
import { PaletteColor } from "@mui/material/styles/createPalette";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonOwnProps {
    variant?: "outlined" | "contained";
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    contrast: true;
  }
  interface ButtonPropsVariantOverrides {
    link: true;
  }
}

declare module "@mui/material/styles/createPalette" {
  export interface PaletteOptions {
    tertiary: PaletteColor;
    contrast: PaletteColor;
  }
}

declare global {
  interface Window {
    Brevo?: any;
  }
}
