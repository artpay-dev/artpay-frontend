import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Cta } from "../types/ui.ts";
import sanitizeHtml from "sanitize-html";

export interface HeroSlideItem {
  imgUrl: string;
  title: string;
  subtitle: string;
  cta?: Cta;
}

export interface HeroSlideProps extends HeroSlideItem {
  onClick?: () => void;
}

const HeroSlide: React.FC<HeroSlideProps> = ({ title, subtitle, imgUrl, cta, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Box
      sx={{
        height: { xs: "auto" }, // , md: height
        gridAutoFlow: { xs: undefined, md: "column" },
        gridTemplateColumns: { xs: undefined, sm: "1fr 1fr", md: "1fr 1.5fr", xl: "1fr 2fr" },
        display: { xs: "flex", md: "grid" },
        flexDirection: { xs: "column", md: undefined },
        gap: { xs: 3, md: undefined },
      }}
      display="grid"
      alignItems="stretch">
      <Box
        sx={{ overflow: "hidden", height: { xs: "auto" } }} // md: height
        gap={2}
        display="flex"
        flexDirection="column"
        justifyContent="flex-start">
        <Typography
          variant="h3"
          sx={{
            typography: { xs: "h4", sm: "h3" },
            maxWidth: { xs: "calc(100vw - 110px)", sm: "calc(100vw - 160px)", md: "auto" },
          }}
          color="white">
          {title}
        </Typography>
        <Typography
          sx={{ typography: { xs: "h6", md: "subtitle1" } }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(subtitle || "") }}
          color="white"
        />
        {cta && (
          <Box>
            <Button color="contrast" href={!onClick ? cta?.link || "" : ""} onClick={handleClick}>
              {cta.text}
            </Button>
          </Box>
        )}
      </Box>
      <Box
        onClick={onClick}
        sx={{
          overflow: "hidden",
          //height: { xs: "250px", sm: "450px", md: height },
          position: "relative",
          display: "grid",
          alignContent: "center",
          /*display: "grid",
                    alignItems: "center",
                    justifyItems: "center",*/
          textAlign: "center",
        }}>
        <Box
          display="flex"
          sx={{
            width: "100%",
            aspectRatio: "16 / 9",
            overflow: "hidden",
          }}>
          <img src={imgUrl} style={{ width: "100%", objectFit: "cover" }} />
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSlide;
