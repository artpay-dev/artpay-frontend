import React from "react";
import { Box, BoxProps, useMediaQuery, useTheme } from "@mui/material";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import VerticalSlide, { VerticalSlideProps } from "./VerticalSlide.tsx";

export interface VerticalSliderProps {
  sx?: BoxProps["sx"];
}

const VerticalSlider: React.FC<VerticalSliderProps> = ({ sx }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));


  const belowMd = useMediaQuery(theme.breakpoints.down("md"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));


  let sliderHeight = "800px";
  if (belowMd) {
    sliderHeight = "auto";
  } else if (isMd) {
    sliderHeight = "500px";
  } else if (isLg) {
    sliderHeight = "650px";
  }

  const slides: VerticalSlideProps[] = [
    {
      cta: { link: "/", text: "Scopri l'artista" },
      imgSrc: "/images/artists_example.png",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      title: "Loren Gallo"
    },
    {
      cta: { link: "/", text: "Scopri l'artista" },
      imgSrc: "/images/artists_example.png",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      title: "Loren Gallo"
    }
  ];

  return (<Box sx={{ ...sx }}>
    <Swiper
      direction={isMobile ? "horizontal" : "vertical"}
      pagination={{
        clickable: true
      }}
      modules={[Pagination, Navigation]}
      className={`verticalResponsiveSwiper ${isMobile ? "mobile" : ""}`}
      loop={true}
      style={{ paddingBottom: 0, height: sliderHeight }}>
      {slides.map((slide, i) => <SwiperSlide key={`slide-${i}`}>
        <VerticalSlide {...slide} />
      </SwiperSlide>)}
    </Swiper>
  </Box>);
};

export default VerticalSlider;
