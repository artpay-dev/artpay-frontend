import usePaymentStore from "../../../stores/paymentStore.ts";
import { useEffect, useState } from "react";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import { Order } from "../../../../../types/order.ts";
import { Close } from "@mui/icons-material";
import { orderToOrderHistoryCardProps, useNavigate } from "../../../../../utils.ts";
import { useAuth } from "../../../../../hoc/AuthProvider.tsx";
import { User } from "../../../../../types/user.ts";
import TransactionCard from "../../../../directpurchase/components/transaction-card.tsx";

const PaymentDraw = () => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();
  const { openDraw, setPaymentData, refreshTimestamp } = usePaymentStore();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const user: User = JSON.parse(localStorage.getItem("artpay-user") as string);

  const handleOrderClick = async (orderId: number) => {
    setPaymentData({ openDraw: false });

    const order = orders?.find(o => o.id === orderId);
    if (!order) return;

    if (order.status === "completed") {
      navigate(`/complete-order/${order.id}`);
    } else if (order.created_via === "artpay_deposit_api") {
      navigate(`/saldo-opera/${order.id}`);
    } else if (order.created_via == "gallery_auction") {
      navigate(`/acquisto-esterno?order=${order.id}`);
    } else {
      navigate(`/completa-acquisto/${order.id}`);
    }
  };

  const handleRefreshOrders = async () => {
    // Ricarica la lista degli ordini dopo l'accettazione/rifiuto
    if (!user) return;

    try {
      const listOrders = await data.listOrders({
        status: ["processing", "completed", "on-hold", "failed", "pending", "quote"],
        customer: Number(user.id) || 18,
      });

      if (!listOrders) return;

      setOrders(listOrders.filter(order => order.created_via !== "mvx_vendor_order").filter(order => order.status !== "completed"));
    } catch (e) {
      console.error("Errore durante il refresh degli ordini:", e);
    }
  };

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true);
      try {
        if (!user) return;

        const listOrders = await data.listOrders({
          status: ["processing", "completed", "on-hold", "failed", "pending"],
          customer: Number(user.id) || 18,
        });

        if (!listOrders) throw new Error("Order list not found");

        setOrders(listOrders.filter(order => order.created_via !== "mvx_vendor_order").filter(order => order.status !== "completed"));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      getOrders();
    }
  }, [refreshTimestamp, auth.isAuthenticated]);

  return (
    <aside
      className={`${
        openDraw ? "" : "translate-y-full md:translate-y-0 md:translate-x-full"
      } py-6 payment-draw fixed w-full z-50 rounded-t-3xl bottom-0 h-4/5 bg-white transition-all  md:rounded-s-3xl md:rounded-tr-none md:overflow-y-hidden md:top-0 md:right-0 md:h-screen  md:max-w-md`}>
      <div className={"flex items-center justify-between md:flex-col-reverse md:items-start fixed bg-white px-8 w-full max-w-sm"}>
        <h3 className={"pt-10 text-2xl leading-6 mb-6 "}>Le tue transazioni</h3>
        <button
          className={
            " cursor-pointer -translate-y-full translate-x-1/2 md:translate-0 bg-gray-100 rounded-full p-1 md:self-end "
          }
          onClick={() => setPaymentData({ openDraw: false })}>
          <Close />
        </button>
      </div>
      {loading && <span>Loading</span>}
      <section className={"mt-27 overflow-y-scroll h-full pb-33"}>
        {!loading && orders && orders.length > 0 ? (
          <ul className={"flex flex-col gap-6 mt-4 px-8"}>
            {orders
              .slice(0, 20)
              .map((order) => {
                const formattedOrder = orderToOrderHistoryCardProps(order);

                return (
                  <li key={order.id} className={" max-w-sm"}>
                    <TransactionCard
                      orderType={formattedOrder.orderType}
                      customer_note={formattedOrder.customer_note}
                      id={formattedOrder.id}
                      title={formattedOrder.title}
                      galleryName={formattedOrder.galleryName}
                      formattePrice={formattedOrder.formattePrice}
                      purchaseDate={formattedOrder.purchaseDate}
                      dateCreated={formattedOrder.dateCreated}
                      purchaseMode={formattedOrder.purchaseMode}
                      imgSrc={formattedOrder.imgSrc}
                      status={formattedOrder.status}
                      expiryDate={formattedOrder.expiryDate}
                      onClick={handleOrderClick}
                      orderKey={formattedOrder.orderKey}
                      email={formattedOrder.email}
                      quoteNotes={formattedOrder.quoteNotes}
                      quoteConditions={formattedOrder.quoteConditions}
                      onQuoteAccepted={handleRefreshOrders}
                      onQuoteRejected={handleRefreshOrders}
                      depositAmount={formattedOrder.depositAmount}
                      balanceAmount={formattedOrder.balanceAmount}
                      created_via={formattedOrder.created_via}
                      depositStatus={formattedOrder.depositStatus}
                    />
                  </li>
                );
              })}
          </ul>
        ) : (
          <p className={"text-secondary text-balance px-8 pt-4"}>Non hai transazioni da completare al momento.</p>
        )}
      </section>
    </aside>
  );
};

export default PaymentDraw;
