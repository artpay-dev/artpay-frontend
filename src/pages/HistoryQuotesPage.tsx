import DefaultLayout from "../components/DefaultLayout.tsx";
import { useEffect, useState } from "react";
import GenericPageSkeleton from "../components/GenericPageSkeleton.tsx";
import OrdersHistory from "../components/OrdersHistory.tsx";


const HistoryQuotesPage = () => {
 const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <DefaultLayout authRequired>
      <section className={'pt-35 md:pt-0 space-y-12 mb-24 px-8 md:px-0'}>
        {isReady ? (
        <>
          <h1 className={'text-5xl leading-[105%] font-normal'}>Le mie offerte</h1>
          <p className={'mt-6 text-secondary'}>In questa sezione troverai le offerte inviate dai galleristi. </p>
          <div className={' border-t border-[#CDCFD3] pt-12'}>
            <OrdersHistory mode={["quote"]} title={"Offerte ricevute"} />
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

export default HistoryQuotesPage;