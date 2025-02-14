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
  disablePadding?: boolean;
  maxItems?: number;
  marginTop?: number
}

const CardList: React.FC<CardListProps> = ({
                                             title,
                                             children = [],
                                             cardSize = "medium",
                                             showEmpty = false,
                                             disablePadding,
                                             maxItems,
                                             marginTop
                                           }) => {
  if (!showEmpty && !children?.length) {
    return <></>;
  }
  return (
    <Box sx={{ px: disablePadding ? 0 : { xs: 3, md: 6 }, maxWidth: "100%", marginTop: marginTop ? marginTop : 0 }}>
      {title && (
        <Typography sx={{ mb: { xs: 3, md: 6 } }} variant="h2">
          {title}
        </Typography>
      )}
      <Box
        display="flex"
        gap={3}
        sx={{
          maxWidth: "100%",
          overflow: "auto"
          /*          minHeight: "318px",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: { xs: "wrap", md: "nowrap" },
          justifyContent: { xs: "center", md: "flex-start" },*/
        }}>
        <Swiper slidesPerView={"auto"} spaceBetween={24} freeMode={true} modules={[FreeMode]} className="mySwiper" style={{paddingRight: 24}}>
          {children.filter((_, i) => !maxItems || i < maxItems).map((child, i) => (
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
