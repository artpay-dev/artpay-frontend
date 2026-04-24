import { ReactNode, useEffect, useState } from "react";
import Logo from "../../../../components/icons/Logo.tsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArticleDraw } from "../../components/ui/articledraw/ArticleDraw.tsx";
import useArticleStore from "../../stores/articleDrawStore.ts";
import LogoSa from "../../../../components/LogoSa.tsx";
import { fetchOrderDetails } from "@/features/cdspayments/api.ts";

const MiddleInfoLayout = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { setOpenArticleDraw, openArticleDraw } = useArticleStore();
  const navigate = useNavigate();
  const orderKey = searchParams.get('order_id') ?? searchParams.get('order');

  console.log(orderKey);

  const trackEvent = () => {
    const event_name = "go_back_to_SA";
    const properties = {
      id: "anonimo",
      username: "Utente SA",
    };

    window.Brevo.push(["track", event_name, properties]);

    console.log("push", event_name, properties);
  }

  const orderDetails = async () => {
    if (!orderKey) return;
    setLoading(true);

    try {
      const orderDetails = await fetchOrderDetails(orderKey);
      console.log("orderDetails", orderDetails);
    } catch (error) {
      console.log(error);
    } finally {}
    setLoading(false);
  }

  useEffect(() => {


    if (openArticleDraw) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [openArticleDraw]);

  useEffect(() => {
    if (orderKey) orderDetails();

  }, []);

  return (
    <section>
      {openArticleDraw && (
        <div className={"overlay fixed z-50 inset-0 w-full h-screen bg-zinc-950/65 animate-fade-in"}></div>
      )}
      <div className={` min-h-screen flex flex-col bg-primary`}>
        <div className={` mx-auto container max-w-2xl relative bg-white`}>
          <ArticleDraw />
          <header className={"fixed w-full z-30 top-6 px-2 max-w-2xl "}>
            <nav className={"p-4 custom-navbar flex justify-center items-center w-full bg-white "}>
              <Logo />
            </nav>
          </header>
          <section className="bg-[#F5F5F5] pt-40 rounded-b-3xl">
            {loading ? (
              <div className="space-y-4 animate-pulse pb-12 px-8 -mt-14">
                <div className="flex items-center gap-2.5"></div>
                <div className="h-30 w-full bg-gray-400 rounded"></div>
                <div className="flex flex-col gap-1">
                  <span className="h-4 w-2/4 bg-gray-400 rounded"></span>
                  <span className="h-4 w-2/2 bg-gray-400 rounded"></span>
                  <span className="h-4 w-2/4 bg-gray-400 rounded"></span>
                  <span className="h-4 w-2/4 bg-gray-400 rounded"></span>
                  <span className="h-4 w-1/3 bg-gray-300 rounded inline-block mt-6"></span>
                </div>
              </div>
            ) : (
              <article className="space-y-3 pb-12">
                <div className={"flex items-center space-x-2"}>
                  <div className=" overflow-hidden absolute left-0 px-4">
                    <LogoSa />
                  </div>
                </div>
                <p className={"mt-40 mb-4 leading-[125%] line-clamp-5 text-balance px-8"}>
                  Stai per completare l’acquisto con artpay, un nuovo servizio selezionato da Sant’Agostino casa d'aste
                  per rendere l’arte più accessibile Rateizza il tuo pagamento in modo sicuro, 100% online scegliendo
                  tra i nostri partner selezionati.
                </p>
                <button
                  onClick={() => {
                    setOpenArticleDraw({ openArticleDraw: true });
                  }}
                  className={"underline text-secondary cursor-pointer ps-8"}>
                  Leggi articolo
                </button>
              </article>
            )}
          </section>
          <main className="flex-1 bg-white pt-6 px-8 pb-50 ">{children}</main>
          <section className="fixed bottom-0 w-full shadow-custom-top  bg-white rounded-t-3xl py-6 px-8 flex flex-col items-center justify-center space-y-4 md:max-w-2xl max-w-full">
            <button
              className={"artpay-button-style bg-primary hover:bg-primary-hover text-white"}
              onClick={() => {
                if (openArticleDraw) {
                  document.body.classList.remove("overflow-hidden");
                }
                if (!document.body.classList.contains("overflow-hidden")) {
                  navigate(`/acquisto-esterno?order=${orderKey}`);
                }
              }}>
              Paga a rate
            </button>
            <Link
              onClick={trackEvent}
              to={"https://www.santagostinoaste.it/clienti-i-miei-acquisti.asp"}
              className={"text-secondary artpay-button-style"}>
              Torna su Sant'Agostino
            </Link>
          </section>
        </div>
      </div>
    </section>
  );
};

export default MiddleInfoLayout;
