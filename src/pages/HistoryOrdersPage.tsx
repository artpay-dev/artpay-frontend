import DefaultLayout from "../components/DefaultLayout.tsx";
import { useEffect, useState } from "react";
import GenericPageSkeleton from "../components/GenericPageSkeleton.tsx";
import OrdersHistory from "../components/OrdersHistory.tsx";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";


const HistoryOrdersPage = () => {
 const [isReady, setIsReady] = useState<boolean>(false);
 const navigate = useNavigate();

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <DefaultLayout authRequired>
      <section className={'pt-35 md:pt-0 space-y-12 mb-24 px-8 md:px-0'}>
        {isReady ? (
        <>
          <h1 className={'text-5xl leading-[105%] font-normal'}>I miei ordini</h1>
          <p className={'mt-6 text-secondary'}>In questa sezione trovi tutte le tue transazioni: in corso, concluse e non andate a buon fine. </p>
          <div className={' border-t border-[#CDCFD3] pt-12'}>
            <OrdersHistory mode={["on-hold", "pending", "processing"]} title={'Transazioni in corso'} />
          </div>
          <div className={'bg-[#EC6F7B26] mt-12 flex flex-col gap-4 md:flex-row justify-between items-center p-6 rounded-lg leading-[125%]'}>
            <span>Le tue transazioni non andate a buon fine</span>
            <Button variant={'contained'} onClick={() => navigate('/profile/history-failed-orders')}>Vedi Storico</Button>
          </div>
          <div className={'pt-12'}>
            <OrdersHistory mode={["completed"]} title={'Transazioni concluse'} />
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

export default HistoryOrdersPage;