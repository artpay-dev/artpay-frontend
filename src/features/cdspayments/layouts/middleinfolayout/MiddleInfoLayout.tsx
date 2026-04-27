import { ReactNode, useEffect, useState } from "react";
import Logo from "../../../../components/icons/Logo.tsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArticleDraw } from "../../components/ui/articledraw/ArticleDraw.tsx";
import useArticleStore from "../../stores/articleDrawStore.ts";
import { fetchOrderDetails } from "@/features/cdspayments/api.ts";
import type { CdsOrderDetails } from "../../types.ts";

const MiddleInfoLayout = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<CdsOrderDetails | null>(null);
  const { setOpenArticleDraw, openArticleDraw } = useArticleStore();
  const navigate = useNavigate();
  const orderKey = searchParams.get('order_id') ?? searchParams.get('order');

  const trackEvent = () => {
    window.Brevo?.push([
      "track",
      "go_back_to_vendor",
      {
        id: order?.customer_email ?? "anonimo",
        username: order?.customer_email ?? "anonimo",
        event_data: {
          order: order?.order_id,
          vendor: order?.vendor_name,
        },
      },
    ]);
  };

  useEffect(() => {
    if (!orderKey) return;
    setLoading(true);
    fetchOrderDetails(orderKey)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderKey]);

  useEffect(() => {
    if (openArticleDraw) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [openArticleDraw]);

  return (
    <section>
      {openArticleDraw && (
        <div className={"overlay fixed z-50 inset-0 w-full h-screen bg-zinc-950/65 animate-fade-in"} />
      )}
      <div className="min-h-screen flex flex-col bg-primary">
        <div className="mx-auto container max-w-2xl relative bg-white">
          <ArticleDraw />
          <header className={"fixed w-full z-30 top-6 px-2 max-w-2xl"}>
            <nav className={"p-4 custom-navbar flex justify-center items-center w-full bg-white"}>
              <Logo />
            </nav>
          </header>
          <section className="bg-[#F5F5F5] pt-32 pb-12 rounded-b-3xl px-8">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 w-40 bg-gray-300 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                <div className="h-4 w-full bg-gray-300 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                <div className="h-4 w-1/3 bg-gray-300 rounded mt-2"></div>
              </div>
            ) : (
              <article className="space-y-4">
                {order?.vendor_logo_url && (
                  <img
                    src={order.vendor_logo_url}
                    alt={order.vendor_name}
                    className="max-h-16 w-auto object-contain border border-gray-200 rounded-md p-2 bg-white"
                  />
                )}
                <p className="leading-[125%] text-balance text-secondary">
                  Stai per completare l'acquisto con Artpay, un nuovo servizio selezionato
                  {order?.vendor_name ? ` da ${order.vendor_name}` : ""} per rendere l'arte più accessibile.
                  Rateizza il tuo pagamento in modo sicuro, 100% online scegliendo tra i nostri partner selezionati.
                </p>
                <button
                  onClick={() => setOpenArticleDraw({ openArticleDraw: true })}
                  className="underline text-secondary cursor-pointer">
                  Leggi articolo
                </button>
              </article>
            )}
          </section>
          <main className="flex-1 bg-white pt-6 px-8 pb-50">{children}</main>
          <section className="fixed bottom-0 w-full shadow-custom-top bg-white rounded-t-3xl py-6 px-8 flex flex-col items-center justify-center space-y-4 md:max-w-2xl max-w-full">
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
            {order?.return_url ? (
              <Link
                onClick={trackEvent}
                to={order.return_url}
                className={"text-secondary artpay-button-style"}>
                Torna su {order.vendor_name}
              </Link>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
};

export default MiddleInfoLayout;