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
  }

  interface Palette {
    contrast: Palette["contrast"];
  }

  interface PaletteOptions {
    contrast: PaletteColorOptions;
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
