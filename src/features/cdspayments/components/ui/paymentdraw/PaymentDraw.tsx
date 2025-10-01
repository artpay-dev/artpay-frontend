import usePaymentStore from "../../../stores/paymentStore.ts";
import { useEffect, useState } from "react";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import { Order } from "../../../../../types/order.ts";
import { CheckCircle, Close } from "@mui/icons-material";
import { useNavigate } from "../../../../../utils.ts";
import { useAuth } from "../../../../../hoc/AuthProvider.tsx";
import { User } from "../../../../../types/user.ts";

const PaymentDraw = () => {
  const data = useData();
  const auth = useAuth();
  const { openDraw, setPaymentData } = usePaymentStore();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const user: User = JSON.parse(localStorage.getItem("artpay-user") as string);
  console.log(orders);

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
        setOrders(listOrders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (!orders) {
      if (auth.isAuthenticated) {
        getOrders();
      }
    }
  }, []);

  return (
    <aside
      className={`${
        openDraw ? "" : "translate-y-full md:translate-y-0 md:translate-x-full"
      } py-6 payment-draw fixed w-full z-50 rounded-t-3xl bottom-0 h-4/5 bg-white transition-all  md:rounded-s-3xl md:rounded-tr-none md:overflow-y-hidden md:top-0 md:right-0 md:h-screen  md:max-w-sm`}>
      <div
        className={
          "flex items-center justify-between md:flex-col-reverse md:items-start fixed bg-white px-8 w-full max-w-sm"
        }>
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
              .slice(0, 10)
              .filter((order) => order.created_via != "mvx_vendor_order")
              .map((order) => {
                const orderDesc: string[] = order?.meta_data
                  .filter((data) => data.key == "original_order_desc")
                  .map((data) => data.value);

                const subtotal = Number(order.total);

                return (
                  <li key={order.id} className={"border border-[#E2E6FC] p-4 rounded-lg space-y-4 max-w-sm"}>
                    <div className={"flex items-center"}>
                      <p className={"text-secondary"}>{orderDesc.length > 0 ? orderDesc : order?.line_items[0].name}</p>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>Tipo</span>
                      <span className={"text-tertiary"}>
                        {order.created_via == "gallery_auction" ? "Casa D'Asta" : "Galleria"}
                      </span>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>Prezzo</span>
                      <span className={"text-tertiary"}>€&nbsp;{subtotal.toFixed(2)}</span>
                    </div>
                    {order.status != "completed" ? (
                      <div className={"mt-6 border-t border-[#E2E6FC] pt-4"}>
                        <button
                          onClick={() => {
                            setPaymentData({
                              openDraw: !openDraw,
                            });
                            order.created_via == "gallery_auction"
                              ? navigate(`/acquisto-esterno?order=${order.id}`)
                              : navigate(`/acquisto?order=${order.id}`);
                          }}
                          className={
                            "cursor-pointer rounded-full bg-white border border-primary  text-primary py-2 px-6 w-full hover:text-primary-hover hover:border-primary-hover transition-all"
                          }>
                          Gestisci transazione
                        </button>
                      </div>
                    ) : (
                      <div className={"mt-6 border-t border-[#E2E6FC] pt-4"}>
                        <p className={"bg-[#42B39640] py-2 px-6 rounded-lg flex items-center justify-center gap-2"}>
                          <CheckCircle color={"success"} /> Transazione conclusa
                        </p>
                      </div>
                    )}
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
