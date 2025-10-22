import DefaultLayout from "../components/DefaultLayout.tsx";
import { useEffect, useState } from "react";
import GenericPageSkeleton from "../components/GenericPageSkeleton.tsx";
import FavouriteGalleriesGrid from "../components/FavouriteGalleriesGrid.tsx";


const FollowedGalleriesPage = () => {
 const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <DefaultLayout authRequired>
      <section className={'pt-35 md:pt-0 space-y-12 mb-24 px-8 md:px-0'}>
        {isReady ? (
        <>
          <h1 className={'text-5xl leading-[105%] font-normal'}>Le gallerie che segui</h1>
          <p className={'mt-6 text-secondary'}>Gli spazi che hai deciso di seguire, per non perderti le nuove proposte.</p>
          <div className={' border-t border-[#CDCFD3] pt-12'}>
            <FavouriteGalleriesGrid />
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

export default FollowedGalleriesPage;