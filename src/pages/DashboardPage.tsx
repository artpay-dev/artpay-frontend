import PrivateLayout from "../components/PrivateLayout.tsx";
import { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { artworksToGalleryItems } from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import ArtworksList from "../components/ArtworksList.tsx";

const Skeleton = () => {
  return (
    <div className={`pl-4 lg:pl-0 h-full min-w-60 `}>
      <div className="w-full rounded-sm overflow-hidden">
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

  const getArtworks = async () => {
    try {
      const resp = await data.listArtworks();
      if (!resp) throw new Error("No resp data");
      setArtworks(artworksToGalleryItems(resp, "large"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getArtworks();
  }, []);

  return (
    <PrivateLayout>
      <section className="pe-8">
        <h2 className={"text-5xl leading-[105%] font-normal max-w-lg text-balance pb-16"}>
          Inizia la tua collezione d'arte - a rate.
        </h2>
      </section>
      <section>
        <div className={"flex justify-between pe-8"}>
          <h3 className={"text-3xl leading-[105%] font-normal max-w-lg text-balance"}>Opere in evidenza</h3>
          <button
            className={
              "cursor-pointer border border-primary py-2 px-4 text-primary rounded-full hover:bg-primary hover:text-white transition-all"
            }>
            Vedi tutte
          </button>
        </div>
        {loading ? (
          <div className={"flex gap-8 my-12 overflow-x-hidden"}>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : (
          <div className={"my-12"}>
            <ArtworksList items={artworks} disablePadding cardSize="medium" />
          </div>
        )}
      </section>
    </PrivateLayout>
  );
};

export default DashboardPage;
