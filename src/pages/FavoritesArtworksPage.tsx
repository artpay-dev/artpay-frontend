import DefaultLayout from "../components/DefaultLayout.tsx";
import { useEffect, useState } from "react";
import GenericPageSkeleton from "../components/GenericPageSkeleton.tsx";
import FavouriteArtworks from "../components/FavouriteArtworks.tsx";


const FavoritesArtworksPage = () => {
 const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <DefaultLayout authRequired>
      <section className={'pt-35 md:pt-0 space-y-12 mb-24 px-8 md:px-0'}>
        {isReady ? (
        <>
          <h1 className={'text-5xl leading-[105%] font-normal'}>La tua lista dei desideri</h1>
          <p className={'mt-6 text-secondary'}>In questa sezione trovi tutte le opere che hai salvato.</p>
          <div className={' border-t border-[#CDCFD3] pt-12'}>
            <FavouriteArtworks />
          </div>
        </>
        ) : (
          <>
            <GenericPageSkeleton />
          </>
        )}

      </section>
    </DefaultLayout>
  );
};

export default FavoritesArtworksPage;