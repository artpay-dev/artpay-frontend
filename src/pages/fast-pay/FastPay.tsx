import useListDrawStore from "../../features/fastpay/stores/listDrawStore.tsx";

const FastPay = () => {

  const {setOpenListDraw} = useListDrawStore();

  return (
    <main className="text-white text-2xl flex flex-col h-full mx-auto max-w-lg px-6">
       <h1 className={'text-secondary '}>Menu</h1>
       <ul className={'mt-6 space-y-6'}>
         <li><button onClick={() => setOpenListDraw({openListDraw: true})}>Lista offerte/ Crea offerta</button></li>
         <li className={'opacity-10'}>Lista contatti/ Aggiungi</li>
         <li className={'opacity-10'}>Lista leads</li>
         <li className={'opacity-10'}>Libretto</li>
         <li className={'opacity-10'}>Form Contatto</li>
       </ul>
    </main>
  );
};

export default FastPay;