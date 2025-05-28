import { Close } from "@mui/icons-material";
import useArticleStore from "../../../stores/articleDrawStore.ts";
import cover_Sa from "../../../../../assets/images/cover_Sa.svg";
import { Link, useNavigate } from "react-router-dom";

const ArticleDraw = () => {
  const { openArticleDraw, setOpenArticleDraw } = useArticleStore();
  const navigate = useNavigate();

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
            <span className={"text-primary uppercase"}>Partnership</span>
            <h1 className={"text-balance text-3xl"}>Artpay per Sant'Agostino</h1>
          </header>
          <p className={'leading-[125%]'}>
            Sant’Agostino casa d'aste ha scelto artpay come partner ufficiale per offrirti una <strong>nuova</strong> modalità di
            pagamento rateale: semplice, flessibile, 100% digitale. artpay è una fintech indipendente, specializzata nel
            settore dell’arte, che ha già aiutato gallerie, collezionisti e case d’asta a rendere l’arte più
            accessibile.
          </p>
          <p className={"text-secondary text-sm mt-10 mb-16"}>By artpay - 20 Aprile 2025 - 1 minuto di lettura</p>
          <main>
            <img
              src={cover_Sa}
              width={600}
              height={400}
              alt="Artpay per Sant'Agostino"
              className="border border-gray-200 w-full h-full aspect-video object-cover"
            />
            {/*<h2 className={"text-balance text-2xl mt-16 mb-10"}>Sottotitolo di due righe</h2>*/}
            <section className={"space-y-8 leading-[125%] text-balance mt-16"}>
              <p>
                Grazie a questa <strong>nuova</strong> collaborazione puoi acquistare le opere che ami dilazionando il pagamento
                in modo trasparente, grazie ai partner di artpay senza complicazioni.
              </p>
               <ul className={'ps-8 list-disc space-y-2 l leading-[125%] '}>
                 <li>Scegli tra più soluzioni</li>
                 <li>Piani su misura per i tuoi acquisti</li>
                 <li>Finanzi fino a €30.000 in 84 rate</li>
               </ul>
              <p className={"leading-[125%]"}>
                La tua sicurezza è garantita conforme ai più alti standard di privacy e sicurezza.
              </p>
              <p className={'leading-[125%]'}>
                Vuoi saperne di più? Scopri la sezione “Come funziona” o <Link to={'mailto:hello@artpay.art'} className={'text-primary hover:text-primary-hover transition-all'}>contatta il nostro team.</Link>
              </p>
              <p className={'leading-[125%]'}>
                <strong>Scopri perché sempre più Gallerie e Case d’Asta scelgono Artpay</strong>,
                la fintech premiata al HTSI Luxury Startup Award 2025 de Il Sole 24 Ore per le sue soluzioni innovative nella compravendita d’arte
              </p>
            </section>
          </main>
        </article>
      </section>
      <section className="fixed bottom-0 w-full shadow-custom-top  bg-white rounded-t-3xl py-6 px-8 flex flex-col items-center justify-center space-y-4 md:max-w-md max-w-full">
        <button
          className={"artpay-button-style bg-primary hover:bg-primary-hover text-white"}
          onClick={() => {
            if (openArticleDraw) {
              document.body.classList.remove("overflow-hidden");
            }
            if (!document.body.classList.contains("overflow-hidden")) {
              navigate("/acquisto-esterno");
            }
          }}>
          Paga a rate
        </button>
      </section>
    </aside>
  );
};

export default ArticleDraw;
