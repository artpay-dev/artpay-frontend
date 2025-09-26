import { Close } from "@mui/icons-material";
import useArticleStore from "../../../stores/articleDrawStore";
import cover_Sa from "../../../../../assets/images/cover_Sa.svg";

export const ArticleDraw = () => {
  const { openArticleDraw, setOpenArticleDraw } = useArticleStore();


  return (
    <aside
      className={`${
        openArticleDraw ? "" : "translate-y-full "
      } py-6 payment-draw shadow-custom-top fixed w-full z-50 rounded-t-3xl bottom-0 h-7/8 bg-white transition-all  max-w-md`}>
      <div className={"flex items-center justify-end bg-white  w-full pe-8"}>
        <button
          className={" cursor-pointer bg-gray-100 rounded-full p-1 "}
          onClick={() => setOpenArticleDraw({ openArticleDraw: false })}>
          <Close />
        </button>
      </div>
      <section className={"mt-12 h-full pb-33 px-8 overflow-y-scroll"}>
        <article className={"leading-[125%] pb-24"}>
          <header className={"space-y-4 flex flex-col mb-10"}>
            <span className={"text-primary uppercase"}>Guide</span>
            <h1 className={"text-balance text-3xl"}>Acquista in asta e paga a rate con artpay</h1>
          </header>
          <p className={"leading-[125%]"}>
            Hai appena vinto un’asta o stai per concludere un acquisto importante? Con <strong>artpay</strong> puoi
            scegliere di pagare in comode rate, in modo semplice, veloce e sicuro.
          </p>
          <p className={"text-secondary text-sm mt-10 mb-16"}>8 giugno 2025 - 2 minuti di lettura</p>
          <main>
            <img
              src={cover_Sa}
              width={600}
              height={400}
              alt="Artpay per Sant'Agostino"
              className="border border-gray-200 w-full h-full aspect-video object-cover"
            />
            <h2 className={"text-balance text-3xl mt-16 mb-10"}>Perché scegliere artpay?</h2>
            <section className={"space-y-6 leading-[125%] text-balance mt-10"}>
              <p>
                <strong>artpay</strong> è una fintech italiana specializzata in soluzioni di pagamento rateale per il
                mondo dell’arte.
              </p>
              <p>
                Collaboriamo con istituti di credito, gallerie e case d’asta per rendere l’acquisto di opere d’arte più
                accessibile, senza compromessi sulla qualità e sulla trasparenza.
              </p>
              <h2 className={"text-balance text-3xl mt-16 mb-10"}>Cosa succede ora?</h2>
              <p className={"leading-[125%]"}>
                Se hai cliccato <em>“Paga a rate”</em> da una casa d’asta partner, sei nel posto giusto.
              </p>
              <p className={"leading-[125%]"}>Ecco cosa troverai nel percorso artpay</p>
              <h3 className={"text-2xl text-balance mt-10"}>
                1. Scegli il partner finanziario e seleziona il metodo di pagamento più adatto a te
              </h3>
              <ul className={"space-y-4"}>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-0 before:-left-2 before:text-3xl ps-4 leading-[115%]'
                  }>
                  Finanziamento con rate personalizzabili fino a €30.000
                </li>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-0 before:-left-2 before:text-3xl ps-4 leading-[115%]'
                  }>
                  Klarna (paga in 3 rate senza interessi, fino a €2.500)
                </li>
              </ul>
              <h3 className={"text-2xl text-balance mt-10"}>2. Inserisci i tuoi dati e verifica la tua identità</h3>
              <p className={"leading-[125%]"}>Ti guideremo passo dopo passo. La registrazione è semplice e veloce.</p>
              <h3 className={"text-2xl text-balance mt-10"}>3. Firma digitale e approvazione in tempo reale*</h3>
              <p className={"leading-[125%]"}>
                Nessuna burocrazia inutile. Puoi concludere tutto in autonomia, online. <br />
                <em className={"inline-block text-secondary mt-6"}>*solo per klarna</em>
              </p>
              <h2 className={"text-balance text-3xl mt-16 mb-10"}>È sicuro?</h2>
              <p className={'leading-[125%] text-balance '}>
                Assolutamente sì. <strong>artpay</strong> è una piattaforma progettata per garantire la massima sicurezza dei tuoi dati e
                delle tue transazioni. Tutti i processi sono criptati e conformi alle normative europee (PSD2, GDPR).
                <br/>
                <br/>
                Hai bisogno di aiuto? Un consulente artpay è sempre a tua disposizione per guidarti o rispondere a
                qualsiasi dubbio, anche via mail o o WhatsApp.(inseriamo whatsapp business?) (va capito chi lo fa)
              </p>
              <h2 className={"text-balance text-3xl mt-16 mb-10"}>Chi può usare artpay?</h2>
              <p className={'leading-[125%] text-balance'}>Chiunque abbia appena acquistato (o voglia acquistare) un’opera in asta presso una casa d’asta partner.
                <br/>
                <br/>
                Non serve alcuna competenza tecnica: bastano pochi minuti e un documento valido.</p>
              <h2 className={"text-balance text-3xl mt-16 mb-10"}>Perché artpay è diversa?</h2>
              <ul className={"space-y-4"}>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:-top-2.5 before:-left-2 before:text-3xl ps-4 leading-[115%]'
                  }>
                  100% digitale, ma con persone vere dietro
                </li>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-0 before:-left-2 before:text-3xl ps-4 leading-[115%]'
                  }>
                  Tempi rapidi, massima chiarezza su costi e condizioni
                </li>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-1 before:-left-2 before:text-3xl ps-4 leading-[115%]'
                  }>
                  Nessun obbligo se cambi idea e vuoi pagare con modalità tradizionali offerte dalla casa d'asta
                </li>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-1 before:-left-2 before:text-3xl ps-4 leading-[115%]'
                  }>
                  Puoi simulare il piano e decidere con calma il partner finanziario: scegli tu come pagare, noi ci occupiamo del resto
                </li>
              </ul>
              <h2 className={"text-balance text-3xl mt-16 mb-10"}>Premi e riconoscimenti</h2>
              <p className={'text-balance leading-[125%]'}>
                <strong>artpay è stata premiata come Startup globale dell’anno agli HTSI Luxury Start Up Award 2025 del Sole 24 Ore</strong>, per le sue soluzioni innovative nella compravendita di opere d’arte.
              </p>
              <h2 className={"text-balance text-3xl mt-16 mb-10"}>Inizia ora la tua esperienza con artpay</h2>
              <p className={'leading-[125%] text-balance'}>
                <strong>Semplifica il tuo acquisto in asta. Scopri come è facile pagare a rate.</strong>
              </p>
            </section>
          </main>
        </article>
      </section>
      <section className="fixed bottom-0 w-full shadow-custom-top  bg-white rounded-t-3xl py-6 px-8 flex flex-col items-center justify-center space-y-4 md:max-w-md max-w-full">
        <button
          className={"artpay-button-style text-primary border border-primary hover:border-primary-hover hover:text-primary-hover cursor-pointer"}
          onClick={() => {
            setOpenArticleDraw({openArticleDraw: false});
          }}>
          Chiudi
        </button>
      </section>
    </aside>
  );
};
