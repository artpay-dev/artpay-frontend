import Anchor from "../anchor/Anchor.tsx";

const LandingCampaignCopy = () => {
  return (
    <section className={'max-w-xl'}>
      <section className={"leading-[105%] space-y-4 mb-12"}>
        <div>
          <span className={"text-[#6576EE] uppercase text-lg font-bold"}>L'arte di vendere a rate</span>
          <h1 className={"text-[#808791] text-lg uppercase"}>Scopri come far crescere la tua galleria con artpay</h1>
        </div>
        <h2 className={"font-bold text-4xl text-balance"}>Offri ai tuoi clienti l’arte che desiderano, in comode rate</h2>
        <p className={"text-2xl"}>
          Con artpay aumenti le vendite e fidelizzi i tuoi collezionisti.
          Proponi pagamenti dilazionati semplici e garantiti, senza alcun rischio per la tua galleria.
        </p>
      </section>
      <Anchor />
      <section className={'lg:mb-12'}>
        <h3 className={"text-[#808791] text-2xl font-medium mb-12"}>Perché scegliere artpay?</h3>
        <ul className={"ps-4 text-lg space-y-4"}>
          <li
            className={
              'before:text-[#6576EE] before:content-["•"] relative before:absolute before:-top-2 before:-left-4 before:text-2xl ps-4 leading-[115%]'
            }>
            <strong>Più vendite, meno barriere</strong>
            <p>
              Rendi le tue opere accessibili a un pubblico più ampio con piani di pagamento personalizzati. Più collezionisti potranno acquistare, senza compromettere il valore dell’arte.
            </p>
          </li>
          <li
            className={
              'before:text-[#6576EE] before:content-["•"] relative before:absolute before:-top-2 before:-left-4 before:text-2xl ps-4 leading-[115%]'
            }>
            <strong>Il prezzo non è più un ostacolo</strong>
            <p>
              Con artpay, acquistare diventa più semplice. I tuoi clienti possono pagare in più rate, in totale sicurezza e trasparenza.
            </p>
          </li>
          <li
            className={
              'before:text-[#6576EE] before:content-["•"] relative before:absolute before:-top-2 before:-left-4 before:text-2xl ps-4 leading-[115%]'
            }>
            <strong>Pagamenti garantiti, zero rischi</strong>
            <p>
              Dimentica insolvenze e ritardi: con artpay incassi l’intero importo in poche settimane, sempre in sicurezza.
            </p>
          </li>
          <li
            className={
              'before:text-[#6576EE] before:content-["•"] relative before:absolute before:-top-2 before:-left-4 before:text-2xl ps-4 leading-[115%]'
            }>
            <strong>Una soluzione pensata per l’arte</strong>
            <p>
              artpay nasce per gallerie e professionisti del settore. Una piattaforma digitale su misura, sviluppata insieme a partner finanziari selezionati.
            </p>
          </li>
        </ul>
      </section>
      <Anchor />
    </section>
  );
};

export default LandingCampaignCopy;