import React, { useCallback, useEffect, useRef } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import HeroSlide, { HeroSlideItem } from "./HeroSlide.tsx";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export interface HeroSliderProps {
  slides?: HeroSlideItem[];
}

const SLIDER_INTERVAL_MS = 5000;

const HeroSlider: React.FC<HeroSliderProps> = ({ slides = [] }) => {
  const theme = useTheme();
  const sliderRef = useRef<SwiperRef>(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  useEffect(() => {
    const timeoutHandler = () => {
      handleNext();
    };
    let timeoutId: number;
    if (SLIDER_INTERVAL_MS) {
      timeoutId = setInterval(timeoutHandler, SLIDER_INTERVAL_MS);
    }
    return () => {
      if (timeoutId) {
        clearInterval(timeoutId);
      }
    };
  }, [handleNext]);

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "auto" },
        pt: { xs: 3, md: 14 },
        pb: { xs: 4, md: 3 },
        px: { xs: 2, md: 6, lg: 12 },
        background: theme.palette.primary.main,
      }}
      display="flex"
      alignItems="center"
      flexDirection="column">
      <Box sx={{ width: "100%", height: "100%", position: "relative", maxWidth: `${theme.breakpoints.values.xl}px` }}>
        <Box
          sx={{
            display: { xs: "flex", md: "flex" },
            position: { xs: "absolute", md: "static" },
            zIndex: 5,
            right: 0,
            mb: 2,
            ml: -2,
            gap: { xs: 1, sm: 2 },
          }}>
          <IconButton onClick={handlePrev} variant="contained" size="small">
            <ChevronLeft color="primary" />
          </IconButton>
          <IconButton onClick={handleNext} variant="contained" size="small">
            <ChevronRight color="primary" />
          </IconButton>
        </Box>
        <Swiper
          ref={sliderRef}
          navigation={true}
          pagination={true}
          modules={[Navigation, Pagination]}
          className="heroSwiper"
          loop
          style={{ maxHeight: "calc(100% - 50px)", paddingBottom: theme.spacing(5) }}>
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
