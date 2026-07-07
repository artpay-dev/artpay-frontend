import { ReactNode, useEffect, useState } from "react";
import Logo from "../../../../components/icons/Logo.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ArticleDraw } from "../../components/ui/articledraw/ArticleDraw.tsx";
//import useArticleStore from "../../stores/articleDrawStore.ts";
import { fetchOrderDetails } from "@/features/cdspayments/api.ts";
import type { CdsOrderDetails } from "../../types.ts";
import { track } from "../../lib/pillarAnalytics.ts";
import AbandonCartModal from "../../components/abandonmodal/AbandonCartModal.tsx";

const MiddleInfoLayout = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<CdsOrderDetails | null>(null);
  const vendorName = order?.vendor_name?.toLowerCase() ?? '';
  const isSantagostino = vendorName.includes("sant'agostino") || vendorName.includes('auction-house-test');
  const [modalOpen, setModalOpen] = useState(false);
  //const { setOpenArticleDraw, openArticleDraw } = useArticleStore();
  const navigate = useNavigate();
  const orderKey = searchParams.get('order_id') ?? searchParams.get('order');

  const doGoBackToVendor = () => {
    track("go_back_to_vendor", {
      email: order?.customer_email ?? "anonimo",
      order: order?.order_id,
      vendor: order?.vendor_name,
      total: order?.grand_total,
    });
    if (order?.return_url) window.location.href = order.return_url;
  };

  const trackPayaRate = () => {
    track("paga_a_rate_clicked", {
      email: order?.customer_email ?? "anonimo",
      order: order?.order_id,
      vendor: order?.vendor_name,
      total: order?.grand_total,
    });
  };

  useEffect(() => {
    if (!orderKey) return;
    setLoading(true);
    fetchOrderDetails(orderKey)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderKey]);

/*  useEffect(() => {
    if (openArticleDraw) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [openArticleDraw]);*/

  return (
    <section>
      {/*{openArticleDraw && (
        <div className={"overlay fixed z-50 inset-0 w-full h-screen bg-zinc-950/65 animate-fade-in"} />
      )}*/}
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: !order ? '#ffffff' : isSantagostino ? '#8C0000' : 'var(--color-primary)' }}>
        <div className="mx-auto container max-w-2xl relative bg-white">
          <ArticleDraw />
          <header className={"fixed w-full z-30 top-6 px-2 max-w-2xl"}>
            <nav className={"p-4 custom-navbar flex justify-center items-center w-full bg-white"}>
              {isSantagostino && order?.vendor_logo_url ? (
                <img src={order.vendor_logo_url} alt={order.vendor_name} className="h-8 w-auto object-contain" />
              ) : (
                <Logo />
              )}
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
                {/*<button
                  onClick={() => setOpenArticleDraw({ openArticleDraw: true })}
                  className="underline text-secondary cursor-pointer">
                  Leggi articolo
                </button>*/}
              </article>
            )}
          </section>
          <main className="flex-1 bg-white pt-6 px-8 pb-50">{children}</main>
          <section className="fixed bottom-0 w-full shadow-custom-top bg-white rounded-t-3xl py-6 px-8 flex flex-col items-center justify-center space-y-4 md:max-w-2xl max-w-full">
            <button
              className={"artpay-button-style bg-primary hover:bg-primary-hover text-white"}
              onClick={() => {
                if (!document.body.classList.contains("overflow-hidden")) {
                  trackPayaRate();
                  navigate(`/acquisto-esterno?order=${orderKey}`);
                }
              }}>
              Paga a rate
            </button>
            {order?.return_url ? (
              <button
                onClick={() => setModalOpen(true)}
                className={"text-secondary artpay-button-style"}>
                Torna su {order.vendor_name}
              </button>
            ) : null}
          </section>
        </div>
      </div>

      <AbandonCartModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirmLeave={doGoBackToVendor}
      />
    </section>
  );
};

export default MiddleInfoLayout;