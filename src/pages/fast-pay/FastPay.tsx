import useListDrawStore from "../../features/fastpay/stores/listDrawStore.tsx";

const FastPay = () => {

  const {setOpenListDraw} = useListDrawStore();

  return (
    <main className="text-white text-2xl flex flex-col h-full flex-1">
       <h1 className={'text-secondary '}>Menu</h1>
       <ul className={'mt-6 space-y-6'}>
         <li><button onClick={() => setOpenListDraw({openListDraw: true})}>Lista offerte/ Crea offerta</button></li>
         <li>Lista contatti/ Aggiungi</li>
         <li>Lista leads</li>
         <li>Libretto</li>
         <li>Form Contatto</li>
       </ul>
    </main>
  );
};

export default FastPay;