import { Box, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { CardSize } from "../types";

export interface CardListProps {
  title?: string;
  children?: ReactNode[];
  cardSize?: CardSize;
  showEmpty?: boolean;
}

const CardList: React.FC<CardListProps> = ({ title, children = [], cardSize = "medium", showEmpty = false }) => {
  if (!showEmpty && !children?.length) {
    return <></>;
  }
  return (
    <Box sx={{ px: { xs: 3, md: 6 }, maxWidth: "100%" }}>
      {title && (
        <Typography sx={{ mb: { xs: 3, md: 6 }, typography: { xs: "h4", sm: "h3" } }} variant="h3">
          {title}
        </Typography>
      )}
      <Box
        display="flex"
        gap={3}
        sx={{
          maxWidth: "100%",
          overflow: "auto",
          /*          minHeight: "318px",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: { xs: "wrap", md: "nowrap" },
          justifyContent: { xs: "center", md: "flex-start" },*/
        }}>
        <Swiper slidesPerView={"auto"} spaceBetween={30} freeMode={true} modules={[FreeMode]} className="mySwiper">
          {children.map((child, i) => (
            <SwiperSlide className={`SwiperCard-${cardSize}`} key={i}>
              {child}
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default CardList;
