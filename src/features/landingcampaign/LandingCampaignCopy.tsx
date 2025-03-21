const LandingCampaignCopy = () => {
  return (
    <section className={'max-w-5xl mx-auto text-center'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Scopri come far crescere la tua galleria con <span className="text-primary">artPay</span>
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Offri ai tuoi clienti l’arte che desiderano, in comode rate.
      </p>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Perché scegliere ArtPay?</h2>
        <ul className="text-center space-y-4 text-gray-700">
          <li className="flex  flex-col gap-2">
            <span className="text-xl pr-4">✅<strong>Aumenta le vendite</strong></span>
             – Con le nostre soluzioni di pagamento dilazionato, rendi l’arte più accessibile senza compromettere il valore delle tue opere.
          </li>
          <li className="flex  flex-col gap-2">
            <span className="text-xl pr-4">✅<strong>Pagamenti sicuri e garantiti</strong></span>
             – Ricevi l’intero importo in poche settimane, senza alcun rischio di insolvenza.
          </li>
          <li className="flex  flex-col gap-2">
            <span className="text-xl pr-4">✅<strong>Soluzione esclusiva per il mondo dell’arte</strong></span>
             – Sviluppata su misura per le gallerie, in collaborazione con partner finanziari affidabili.
          </li>
          <li className="flex  flex-col ">
            <span className="text-xl mr-2">✅<strong>Supera il freno del prezzo</strong></span>
             – I tuoi clienti potranno acquistare le opere che amano con soluzioni di pagamento su misura, in totale sicurezza e nel rispetto delle loro possibilità.
          </li>
        </ul>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Come funziona?</h2>
        <ol className="text-left space-y-4 text-gray-700">
          <li><span className="font-bold">1️⃣</span> Registri la tua galleria in pochi minuti.</li>
          <li><span className="font-bold">2️⃣</span> Offri soluzioni di pagamento dilazionato ai tuoi clienti, senza rischi per te.</li>
          <li><span className="font-bold">3️⃣</span> ArtPay si occupa del resto: approvazione rapida, pagamenti garantiti.</li>
        </ol>
      </div>
    </section>
  );
}

export default LandingCampaignCopy;