import React, { useEffect, useState } from "react";
import { Link, Typography } from "@mui/material";
import { artistToGalleryItem } from "../utils.ts";
import { Artist } from "../types/artist.ts";
import sanitizeHtml from "sanitize-html";
import { FAVOURITES_UPDATED_EVENT, useData } from "../hoc/DataProvider.tsx";
import FollowButton from "./FollowButton.tsx";
import { useNavigate } from "../utils.ts";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

export interface ArtistDetailsProps {
  artist: Artist;
}

const ArtistDetails: React.FC<ArtistDetailsProps> = ({ artist }) => {
  const artistContent = artistToGalleryItem(artist);
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();
  const snackbar = useSnackbars();

  const [favourites, setFavourites] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMore, setViewMore] = useState(false);

  const handleViewMoreButton = () => {
    setViewMore(!viewMore);
  };

  useEffect(() => {
    const handleFavouritesUpdated = () => {
      data.getFavouriteArtists().then((resp) => setFavourites(resp));
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
    if (artist?.id) {
      setIsLoading(true);
      try {
        if (isFavourite) {
          await data.removeFavouriteArtist(artist.id.toString()).then((resp) => {
            setFavourites(resp);
          });
        } else {
          await data.addFavouriteArtist(artist.id.toString()).then((resp) => {
            setFavourites(resp);
          });
        }
      } catch (e) {
        console.error(e);
        snackbar.error(e);
      }
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className={"flex gap-2"}>
        <div
          className={"w-11 h-11 rounded-sm overflow-hidden"}
          onClick={() => {
            navigate(`/artisti/${artistContent.slug}`);
          }}>
          <img
            className={"w-full h-full aspect-square object-cover"}
            src={artistContent.imgUrl}
            width={100}
            height={100}
          />
        </div>
        <div className={"w-full"}>
          <div className={"flex items-center"}>
            <div className={"flex-1 flex flex-col space-between"}>
              <Typography variant="subtitle1">
                <Link
                  href={`/artisti/${artistContent.slug}`}
                  style={{
                    color: "#010F22",
                    textDecoration: "none",
                    marginBottom: 4,
                    display: "block",
                  }}>
                  {artistContent.title}
                </Link>
              </Typography>
              <Typography color="textSecondary">{artistContent.subtitle}</Typography>
            </div>
            <div>
              <FollowButton
                isLoading={isLoading}
                isFavourite={favourites.some((artist) => artist.id === artist.id)}
                onClick={handleSetFavourite}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={"mt-4"}>
        <Typography variant="subtitle1" color="textSecondary">
          {artistContent.artworksCount} {artistContent.artworksCount === 1 ? "Opera" : "Opere"}
        </Typography>
      </div>
      {artistContent.description !== "" ? (
        <>
          <p
            className={`${viewMore ? "" : "line-clamp-5"} text-[#666F7A] leading-5 mt-4`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(artistContent.description || "", { allowedAttributes: false }),
            }}
          />
          <button className={"text-primary mt-2 text-sm cursor-pointer"} onClick={handleViewMoreButton} name={"Mostra"}>
            {viewMore ? "Mostra meno" : "Mostra altro"}
          </button>
        </>
      ) : (
        <></>
      )}
    </section>
  );
};

export default ArtistDetails;
