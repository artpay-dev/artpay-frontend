import { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { artworksToGalleryItems } from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import ArtworksList from "../components/ArtworksList.tsx";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { PostList } from "../components/PostList.tsx";
import NewsletterBig from "../components/NewsletterBig.tsx";
import FavouriteGalleriesList from "../components/FavouriteGalleriesList.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { NavLink } from "react-router-dom";
//import ArtMatch from "../components/ArtMatch.tsx";

const Skeleton = () => {
  return (
    <div className={`pl-4 lg:pl-0 h-full min-w-80 `}>
      <div className="w-full rounded-2xl overflow-hidden">
        <div className="bg-gray-300 animate-pulse h-full w-full aspect-square" />
      </div>

      <div className="mt-4 py-4 flex flex-col justify-between">
        <div className="flex">
          <div className="flex flex-col flex-1 h-full min-h-40 space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded w-1/4 mt-4 animate-pulse" />
          </div>
          <div className="flex flex-col items-end justify-between max-w-[50px] ml-4">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [artworks, setArtworks] = useState<ArtworkCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const data = useData();
  const snackbar = useSnackbars();

  const getArtworks = async () => {
    try {
      const responseIds = await data.getFavouriteArtworks();
      if (!responseIds) throw new Error("Failed to fetch artwork ids");

      const favArtworks = await data.getArtworks(responseIds);
      if (!favArtworks) throw new Error("Failed to fetch artworks");
      setArtworks(artworksToGalleryItems(favArtworks.filter((artwork) => artwork.status != "trash")));
    } catch (error) {
      snackbar.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getArtworks();
  }, [data]);

  return (
    <DefaultLayout hasNavBar>
      <section className="ps-8 pe-8 md:px-0 pt-36 md:pt-0">
        <h2 className={"text-5xl leading-[105%] font-light max-w-lg text-balance pb-16 text-primary"}>
          Inizia a collezionare
        </h2>
      </section>
      <section className={"space-y-24 mb-22"}>
        {/*<ArtMatch />*/}
        <div >
          {loading ? (
            <>
              <div className={"flex justify-between pe-8 md:pe-0"}>
                <div className="ps-8 md:px-0 animate-pulse">
                  <div className="h-9 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse hidden md:block">
                  <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className={"flex gap-8 my-12 overflow-x-hidden ps-4"}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            </>
          ) : (
            <>
            <div className={"flex justify-between pe-8 md:pe-0"}>
              <h3 className={"ps-8 md:px-0 text-3xl leading-[105%] font-normal max-w-lg text-balance"}>
                Lista dei desideri
              </h3>
              <NavLink
                to={"/profile/opere-preferite"}
                className={
                  "cursor-pointer border border-primary py-2 px-4 text-primary rounded-full hover:bg-primary hover:text-white transition-all hidden md:block"
                }>
                Vedi tutte
              </NavLink>
            </div>
            <div className={"my-12 min-h-80"}>
              <ArtworksList items={artworks} disablePadding cardSize="medium" />
            </div>
            </>
          )}
        </div>
          <div className={"my-12 pl-8 md:pl-0"}>
            <FavouriteGalleriesList />
          </div>
        <div className={"tutorials-wrapper pl-8 md:pl-0"}>
          <div className={"flex justify-between pe-8 md:pe-0 items-center"}>
            <div className={"space-y-2"}>
              <h3 className={"md:px-0 text-3xl leading-[105%] font-normal max-w-lg text-balance"}>
                Hai bisogno di aiuto? Parti da qui.
              </h3>
              <p className={"text-secondary text-xl max-w-xl "}>
                Scopri come esplorare gli spazi, salvare le tue opere preferite e acquistare con artpay in modo semplice
                e sicuro.
              </p>
            </div>
            <NavLink
              to={"/guide"}
              className={
                "cursor-pointer border border-primary py-2 px-4 text-primary rounded-full hover:bg-primary hover:text-white transition-all hidden md:block mb-6"
              }>
              Leggi tutto
            </NavLink>
          </div>
          <PostList />
        </div>
        <div className={"px-8 md:px-0"}>
          <NewsletterBig title="Accedi in anteprima a opere, artisti e storie selezionate." />
        </div>
      </section>
    </DefaultLayout>
  );
};

export default DashboardPage;
