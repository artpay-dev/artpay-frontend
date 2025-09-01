import React, { ReactNode } from "react";
import { Box, PaperProps, Typography } from "@mui/material";

export interface ContentCardProps {
  icon?: ReactNode;
  title?: string;
  children?: ReactNode | ReactNode[];
  headerButtons?: ReactNode[];
  contentPadding?: number;
  contentPaddingMobile?: number;
  hideHeader?: boolean;
  sx?: PaperProps["sx"];
  variant?: "default" | "shadow";
}

const ContentCard: React.FC<ContentCardProps> = ({
                                                   icon,
                                                   title,
                                                   headerButtons = [],
                                                   children,
                                                   contentPadding = 5,
                                                   contentPaddingMobile = 3,
                                                   hideHeader = false,
                                                   variant= "default"
                                                 }) => {
  const style = {
    default: 'md:border-t border-[#CDCFD3] pt-6 px-2 md:px-0',
    shadow: 'shadow-custom-variant pt-6 rounded-3xl px-10'
  }

  return (
    <div className={`${style[variant]} pb-6 w-full `}>
      <Box display="flex" flexDirection="column">
        {!hideHeader && <Box gap={2} mb={4} alignItems="center" display="flex">
          {icon}
          <Typography className={`flex-1 ${variant == "default" ? 'text-secondary' : 'text-[#010F22]'}`}>
            {title}
          </Typography>
          <Box>{headerButtons}</Box>
        </Box>}
        <Box sx={{ px: { xs: contentPaddingMobile, md: contentPadding } }}>{children}</Box>
      </Box>
    </div>
  );
};

export default ContentCard;
