import { ComponentsOverrides, ComponentsVariants, Theme as MuiTheme } from "@mui/material/styles";
import { FooterProps } from "./components/Footer.tsx";
import { PaletteColorOptions } from "@mui/material";

export interface FormField {
  label: string;
  description?: string;
}

export interface MetadataItem {
  id: number;
  key: string;
  value: { [key: string]: string };
}

export interface CardItem {
  id: number | string;
  slug: string;
}

export type CardSize = "small" | "medium" | "large";

type Theme = Omit<MuiTheme, "components">;

declare module "@mui/material/styles" {
  interface ComponentNameToClassKey {
    MuiFooter: "root"; // | "value" | "unit";
  }

  interface ComponentsPropsList {
    MuiFooter: Partial<FooterProps>;
  }

  interface Components {
    MuiFooter?: {
      defaultProps?: ComponentsPropsList["MuiFooter"];
      styleOverrides?: ComponentsOverrides<Theme>["MuiFooter"];
      variants?: ComponentsVariants["MuiFooter"];
    };
    MuiChip?: {
      styleOverrides?: ComponentsOverrides<Theme>["MuiChip"] & { sizeLarge?: any };
    };
  }

  interface Palette {
    contrast: Palette["contrast"];
  }

  interface PaletteOptions {
    contrast: PaletteColorOptions;
  }

  interface ButtonPropsColorOverrides {
    contrast: true;
  }

  interface SvgIconPropsColorOverrides {
    contrast: true;
  }

  interface ChipPropsSizeOverrides {
    large: true;
  }

  interface IconButtonPropsSizeOverrides {
    xs: true;
  }

  interface TypographyVariants {
    display1: React.CSSProperties;
    display2: React.CSSProperties;
    display3: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    display1?: React.CSSProperties;
    display2?: React.CSSProperties;
    display3?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    display1: true;
    display2: true;
    display3: true;
  }
}
declare module "@mui/material/Chip" {
  interface ChipPropsSizeOverrides {
    large: true;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonPropsSizeOverrides {
    xs: true;
  }
}

declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    contrast: Palette["contrast"];
  }

  interface PaletteOptions {
    contrast: PaletteOptions["contrast"];
  }
}

declare module "@mui/material/styles/createMuiTheme" {
  interface ThemeOptions {
    themeName?: string; // optional
  }


}
