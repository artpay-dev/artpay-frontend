import React from "react";
import { Tabs, useMediaQuery, useTheme } from "@mui/material";
import { TabsOwnProps } from "@mui/material/Tabs/Tabs";

export interface ResponsiveTabsProps {}

const ResponsiveTabs: React.FC<Pick<TabsOwnProps, "value" | "onChange" | "children">> = ({
  value,
  onChange,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Tabs
      scrollButtons={isMobile ? "auto" : undefined}
      variant={isMobile ? "scrollable" : "standard"}
      allowScrollButtonsMobile={isMobile}
      centered={!isMobile}
      value={value}
      onChange={onChange}
      color="secondary">
      {children}
    </Tabs>
  );
};

export default ResponsiveTabs;
