import usePaymentStore from "../../../stores/paymentStore.ts";
import { useEffect, useState } from "react";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import { Order } from "../../../../../types/order.ts";
import { Close } from "@mui/icons-material";
import { useNavigate } from "../../../../../utils.ts";
import { useAuth } from "../../../../../hoc/AuthProvider.tsx";
import { User } from "../../../../../types/user.ts";

const PaymentDraw = () => {
  const data = useData()
  const auth = useAuth()
  const {openDraw, setPaymentData} = usePaymentStore()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const user:User = JSON.parse(localStorage.getItem("artpay-user") as string)

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true)
      try {

        if (!user) return

        const listOrders = await data.listOrders({
          customer: Number(user.id) || 18,
        });
        console.log(listOrders);
        if (!listOrders) throw new Error('Order list not found');
        setOrders(listOrders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false)
      }
    }

    if(!orders) {
      if(auth.isAuthenticated) {
        getOrders()
      }
    }

  }, [])

 return (
    <aside className={`${openDraw ? '' : 'translate-y-full md:translate-y-0 md:translate-x-full'} py-6 payment-draw fixed w-full z-50 rounded-t-2xl bottom-0 h-3/5  bg-white transition-all overflow-y-scroll md:overflow-y-auto md:top-0 md:right-0 md:h-screen md:w-2/5 max-w-md`}>
      <div className={'flex items-center justify-between px-8 md:flex-col-reverse md:items-start '}>
        <h3 className={'pt-10 text-2xl leading-6 mb-6 '}>Le tue transazioni</h3>
        <button className={'cursor-pointer -translate-y-full translate-x-1/2 md:translate-0 bg-gray-100 rounded-full p-1'} onClick={() => setPaymentData({openDraw: false})}><Close /></button>
      </div>
      {loading && <span>Loading</span>}
      <section className={''}>
        {!loading && orders && orders.length > 0 ? (
          <ul className={'flex flex-col gap-6 mt-8 px-8'}>
            {orders.slice(0,3).map((order) => {
              const orderDesc = order?.meta_data.filter((data) => data.key == "original_order_desc").map((data) => data.value);
              /*const subtotal= !order?.fee_lines.length ? (Number(order?.total) / 1.06) : (Number(order?.total) / 1.124658)*/
              const subtotal = Number(order.total)
              return (
                <li key={order.id} className={"border border-[#E2E6FC] p-4 rounded-lg space-y-2 max-w-sm"}>
                  <div className={"flex items-center gap-2.5"}>
                    <p className={"text-secondary"}>{orderDesc}</p>
                  </div>
                  <div className={"flex flex-col gap-1"}>
                    <span className={"text-secondary"}>Tipo</span>
                    <span className={"text-tertiary"}>Casa d'asta</span>
                  </div>
                  <div className={"flex flex-col gap-1"}>
                    <span className={"text-secondary"}>Prezzo</span>
                    <span className={"text-tertiary"}>€&nbsp;{subtotal.toFixed(2)}</span>
                  </div>
                  {order.status != "completed" ? (
                    <div className={"mt-6"}>
                      <button
                        onClick={() => {
                          setPaymentData({
                            openDraw: !openDraw,
                          })
                          navigate(`/acquisto-esterno?order=${order.id}`);
                        }}
                        className={"artpay-button-style bg-white border border-primary  text-primary py-3! hover:text-primary-hover hover:border-primary-hover transition-all"}>
                        Gestisci transazione
                      </button>
                    </div>
                  ) : (
                    <p className={'bg-[#FAFAFB] p-3 rounded-lg'}>Transazione conclusa</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <span>No orders found.</span>
        )}
      </section>
    </aside>
  );
};

export default PaymentDraw;