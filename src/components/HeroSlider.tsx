import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import HeroSlide, { HeroSlideItem } from "./HeroSlide.tsx";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export interface HeroSliderProps {}

const HeroSlider: React.FC<HeroSliderProps> = ({}) => {
  const theme = useTheme();
  const sliderRef = useRef<SwiperRef>(null);
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  useEffect(() => {
    setSlides([
      {
        imgUrl: "/public/gallery_example.jpg",
        subtitle:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        title: "Da oggi l’arte a portata di clic",
      },
      {
        imgUrl: "/public/gallery-event.jpg",
        subtitle:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        title: "Slide 2",
      },
      {
        imgUrl: "/public/gallery_example.jpg",
        subtitle: "",
        title: "Slide 3",
      },
    ]);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        //height: { xs: "600px" },
        pt: { xs: 3, md: 14 },
        pb: { xs: 2, md: 3 },
        px: { xs: 2, md: 6, lg: 12 },
        background: theme.palette.primary.main,
      }}
      display="flex"
      flexDirection="column">
      <Box sx={{ width: "100%", maxWidth: "1440px", height: "100%", position: "relative" }}>
        <Box sx={{ display: { xs: "none", md: "flex" }, mb: 2, ml: -2 }} gap={2}>
          <IconButton onClick={handlePrev} variant="contained">
            <ChevronLeft color="primary" />
          </IconButton>
          <IconButton onClick={handleNext} variant="contained">
            <ChevronRight color="primary" />
          </IconButton>
        </Box>
        <Swiper
          ref={sliderRef}
          navigation={true}
          modules={[Navigation]}
          className="heroSwiper"
          loop
          style={{ maxHeight: "100%" }}>
          {slides.map((slideProps, i) => (
            <SwiperSlide key={`slide-${i}`}>
              <HeroSlide {...slideProps} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default HeroSlider;
