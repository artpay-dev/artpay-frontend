import React from "react";
import {IconButton} from "@mui/material";
import FavouriteIcon from "./icons/FavouriteIcon.tsx";
import { CardSize } from "../types";
import FavouriteFilledIcon from "./icons/FavouriteFilledIcon.tsx";
import QrCodeIcon from "./icons/QrCodeIcon.tsx";
import { useDialogs } from "../hoc/DialogProvider.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface ArtworkCardProps {
  id: string;
  artistName: string;
  title: string;
  slug: string;
  galleryName: string;
  galleryId: string;
  isFavourite?: boolean;
  price?: number;
  size?: CardSize;
  dimensions?: string;
  technique?: string;
  year?: string;
  imgUrl?: string;
  estimatedShippingCost?: string;
  onClick?: () => void;
  onSetFavourite?: (currentValue: boolean) => void;
  mode?: "grid" | "list";
  fitWidth?: boolean;
}

/*const cardSizes: { [key in CardSize]: string } = {
  small: "180px",
  medium: "294px",
  large: "320px",
};*/

const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artistName,
  title,
  galleryName,
  price,
  size = "medium",
  imgUrl,
  isFavourite = false,
  onClick,
  mode= 'list',
  onSetFavourite,
  slug,
  fitWidth = false,
}) => {
  const dialogs = useDialogs();
  const auth = useAuth();

  const cardSizeClass = fitWidth ? `SwiperCard-fit` : `SwiperCard-${size}`;

  const formattedPrice = price
    ? `€ ${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`
    : "";

  const handleSetFavourite = () => {
    if (onSetFavourite) {
      onSetFavourite(isFavourite);
    }
  };

  const handleShowQrCode = () => {
    const qrUrl = `${window.location.protocol}//${window.location.host}/opere/${slug}`;
    dialogs.qrCode(qrUrl);
  };


  return (
    <div className={`w-fit ${mode === 'grid' ? '' : 'pl-8'} lg:pl-0 h-full ` + cardSizeClass}>
      <div className={'w-full rounded-2xl overflow-hidden cursor-pointer'}>
        <img
          src={imgUrl}
          onClick={onClick}
          className={'object-cover h-full w-full aspect-square rounded-2xl'}
        />
      </div>
      <div className={`mt-4 py-4 flex flex-col justify-between `}>
        <div className={'flex '}>
          <div className={'flex cursor-pointer flex-col flex-1 h-full min-h-40'} onClick={onClick}>
            <p className={'text-secondary '}>
              {artistName || "-"}
            </p>
            <h4
              className={'mt-1 mb-2 w-full cursor-pointer text-2xl flex-1'}
              onClick={onClick}
              >
              {title}
            </h4>
            <p className={'text-secondary'}>
              {galleryName || "-"}
            </p>
            {price && (
              <div className=" mt-4">
                {!auth.isAuthenticated ? (
                    <div className="rounded inset-0 flex items-center h-8 backdrop-blur-2xl ">
                      <span className="text-xs text-primary rounded">
                          Accedi per vedere il prezzo
                      </span>
                    </div>
                ) : (
                  <h4 className={`text-2xl `}>
                    {formattedPrice}
                  </h4>
                )}
              </div>
            )}
          </div>
          <div
            className={'flex flex-col items-end justify-between max-w-[50px] '}>
            <IconButton onClick={() => handleSetFavourite()} size="small" sx={{ mt: -0.5 }}>
              {isFavourite ? (
                <FavouriteFilledIcon color="primary" fontSize="small" />
              ) : (
                <FavouriteIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton onClick={handleShowQrCode} sx={{ mb: -1 }} size="medium">
              <QrCodeIcon color="primary" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;
