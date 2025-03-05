import React, { useEffect, useRef, useState } from "react";
import { Gallery } from "../types/gallery";
import { Link } from "@mui/material";
import { galleryToGalleryContent } from "../utils.ts";
import { useNavigate } from "../utils.ts";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import FollowButton from "./FollowButton.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import sanitizeHtml from "sanitize-html";

export interface GalleryDetailsProps {
  gallery: Gallery;
}

const GalleryDetails: React.FC<GalleryDetailsProps> = ({ gallery }) => {
  const galleryContent = galleryToGalleryContent(gallery);
  const navigate = useNavigate();
  const data = useData();
  const auth = useAuth();
  const contentRef = useRef<HTMLDivElement | null>(null)

  const [favourites, setFavourites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0)

  const handleExpanded = () => {
    setIsExpanded(!isExpanded);
  };


  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, []);

  useEffect(() => {
    const handleFavouritesUpdated = () => {
      data.getFavouriteGalleries().then((resp) => setFavourites(resp));
    };
    handleFavouritesUpdated();
    document.addEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdated);
    return () => {
      document.removeEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdated);
    };
  }, [data]);
  const handleSetFavourite = async (isFavourite: boolean) => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (galleryContent?.id) {
      setIsLoading(true);
      try {
        if (isFavourite) {
          await data.removeFavouriteGallery(galleryContent.id.toString()).then((resp) => {
            setFavourites(resp);
          });
        } else {
          await data.addFavouriteGallery(galleryContent.id.toString()).then((resp) => {
            setFavourites(resp);
          });
        }
      } catch (e) {
        //TODO: notify error
        console.error(e);
      }
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (gallery?.shop.slug) {
      navigate(`/gallerie/${gallery.shop?.slug}`);
    }
  };

  return (
    <section className={"w-full flex flex-col "}>
      <div className={"flex justify-between items-center"}>
        <div className={'flex space-x-2'}>
          <div className={"w-11 h-11 rounded-sm overflow-hidden"} onClick={handleClick}>
            <img
              className={"w-full h-full aspect-square object-cover"}
              src={galleryContent.coverImage}
              width={100}
              height={100}
              alt={galleryContent.title}
            />
          </div>
          <div className={"flex-1 flex flex-col justify-between"}>
            <h4>
              <Link href={`/gallerie/${gallery.shop?.slug}`} className={'text-tertiary! no-underline!'}>{galleryContent.title}</Link>
            </h4>
            <p className={'text-secondary'}>
              {galleryContent.subtitle}
            </p>
          </div>
        </div>
          <FollowButton
            isLoading={isLoading}
            isFavourite={favourites.indexOf(+galleryContent.id) !== -1}
            onClick={handleSetFavourite}
          />
      </div>
      {galleryContent.description !== "" ? (
        <>
          <p
            ref={contentRef}
            className={`${isExpanded ? contentHeight : 'line-clamp-3'} overflow-hidden text-[#666F7A] leading-5 mt-4`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(galleryContent.description || "", { allowedAttributes: false }),
            }}
          />
          {contentRef.current && contentRef.current.scrollHeight >= 100 && (
            <button className={"text-primary mt-2 text-sm cursor-pointer self-start"} onClick={handleExpanded} name={"Mostra"}>
              {isExpanded ? "Mostra meno" : "Mostra altro"}
            </button>
          )}
        </>
      ) : (
        <></>
      )}

    </section>
  );
};

export default GalleryDetails;
