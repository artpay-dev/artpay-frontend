import { ReactNode, useEffect, useState } from "react";
import Logo from "../../../../components/icons/Logo.tsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useData } from "../../../../hoc/DataProvider.tsx";
import { Gallery } from "../../../../types/gallery.ts";
import { ArticleDraw } from "../../components/ui/articledraw/ArticleDraw.tsx";
import useArticleStore from "../../stores/articleDrawStore.ts";
import LogoSa from "../../../../components/LogoSa.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";

const MiddleInfoLayout = ({ children }: { children: ReactNode }) => {
  const { setOpenArticleDraw, openArticleDraw } = useArticleStore();
  const { order } = usePaymentStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vendor, setVendor] = useState<Gallery | null>(null);
  const data = useData();

  console.log(order)

  const getVendor = async () => {
    try {
      //const galleryId = environment == 'production' ? '76' : '21'

      const vendorResp: Gallery = await data.getGallery("21");
      if (!vendorResp) throw new Error("Vendor not found");
      setVendor(vendorResp);
    } catch (e) {
      console.error(e);
    }
  };

  const trackEvent = () => {
    const event_name = "go_back_to_SA";
    const properties = {
      id: "anonimo",
      username: "Utente SA",
    };

    window.Brevo.push(["track", event_name, properties]);

    console.log("push", event_name, properties);
  }

  useEffect(() => {
    if (!vendor) getVendor();

    if (openArticleDraw) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [openArticleDraw]);

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
            {!vendor ? (
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
                <p className={"mt-32 mb-4 leading-[125%] line-clamp-5  px-8"}>
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
          <main className="flex-1 bg-white pt-6 px-8 pb-50">{children}</main>
          <section className="fixed bottom-0 w-full shadow-custom-top  bg-white rounded-t-3xl py-6 px-8 flex flex-col items-center justify-center space-y-4 md:max-w-2xl max-w-full">
            <button
              className={"artpay-button-style bg-primary hover:bg-primary-hover text-white py-3!"}
              onClick={() => {
                if (openArticleDraw) {
                  document.body.classList.remove("overflow-hidden");
                }
                if (!document.body.classList.contains("overflow-hidden")) {
                  // Recupera l'order ID da varie fonti (in ordine di priorità)
                  let orderId = null;

                  // 1. Dallo store (se già caricato)
                  if (order?.id) {
                    orderId = order.id;
                  }

                  // 2. Da localStorage cdsOrderId (salvato dopo regain)
                  if (!orderId) {
                    const savedOrderId = localStorage.getItem("cdsOrderId");
                    if (savedOrderId) {
                      orderId = savedOrderId;
                    }
                  }

                  // 3. Dall'URL
                  if (!orderId) {
                    const orderIdFromUrl = searchParams.get("order_id");
                    if (orderIdFromUrl) {
                      orderId = orderIdFromUrl;
                    }
                  }

                  // 4. Da localStorage externalOrderKey (prima della regain)
                  if (!orderId) {
                    const orderIdFromStorage = localStorage.getItem("externalOrderKey");
                    if (orderIdFromStorage) {
                      orderId = orderIdFromStorage;
                    }
                  }

                  // 5. Fallback: prova da localStorage CdsOrder (oggetto completo)
                  if (!orderId) {
                    try {
                      const cdsOrderString = localStorage.getItem("CdsOrder");
                      if (cdsOrderString) {
                        const cdsOrder = JSON.parse(cdsOrderString);
                        if (cdsOrder?.id) {
                          orderId = cdsOrder.id;
                        }
                      }
                    } catch (e) {
                      console.error("Error parsing CdsOrder from localStorage:", e);
                    }
                  }

                  // Naviga con il parametro order
                  if (orderId) {
                    navigate(`/acquisto-esterno?order=${orderId}`);
                  } else {
                    console.error("Order ID non trovato in nessuna fonte");
                    // Naviga comunque, il provider gestirà l'errore
                    navigate("/acquisto-esterno");
                  }
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
