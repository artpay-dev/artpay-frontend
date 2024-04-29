import React from "react";
import { SvgIcon, SvgIconProps, useTheme } from "@mui/material";

export type PaletteColor = "primary" | "secondary" | "error" | "info" | "success" | "warning";

export const paletteColors: string[] = ["primary", "secondary", "error", "info", "success", "warning"];

export type ColorValueHex = `#${string}`;

export interface IconProps extends Omit<SvgIconProps, "color"> {
  render: (color: string) => React.ReactNode;
  color?: SvgIconProps["color"] | ColorValueHex;
}

//
const Icon: React.FC<IconProps> = ({ render, color: colorProp, ...props }) => {
  const theme = useTheme();
  let color = "#666F7A";
  if (colorProp && paletteColors.indexOf(colorProp) !== -1) {
    color = theme.palette[colorProp as PaletteColor].main;
  } else if (colorProp?.match(/#([0-9A-Fa-f]){3,6}/)) {
    color = colorProp;
  } else if (colorProp === "inherit") {
    color = "inherit";
  }
  return <SvgIcon {...props}>{render(color)}</SvgIcon>;
};

export default Icon;
