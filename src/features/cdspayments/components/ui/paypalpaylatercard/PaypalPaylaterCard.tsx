import { PaymentProviderCardProps } from "../../../types.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../../stores/paymentStore.ts";
import PaymentProviderCard from "../paymentprovidercard/PaymentProviderCard.tsx";
import PayPal from "../../../../../components/icons/custom/PayPal.tsx";
import { useEffect, useState } from "react";
import PaymentForm from "../paymentform/PaymentForm.tsx";
import { Elements } from "@stripe/react-stripe-js";
import { usePayments } from "../../../../../hoc/PaymentProvider.tsx";
import { calculateArtpayFee, calculatePaymentGatewayFee } from "../../../utils/orderCalculations.ts";
import GuestBillingForm from "../../guestbillingform/GuestBillingForm.tsx";

const PAYPAL_PAYLATER_FEE_ESTIMATE = 0.05;

const PaypalPaylaterCard = ({ subtotal, disabled, paymentSelected = true }: Partial<PaymentProviderCardProps>) => {
  const payments = usePayments();
  const { order, setPaymentData, paymentIntent, user, guestFormCompleted } = usePaymentStore();
  const [fee, setFee] = useState<number>(0);
  const [totalWithFees, setTotalWithFees] = useState<number>(0);
  const data = useData();
  const quote = totalWithFees / 3;

  const isGuest = !user;
  const hasBillingData = !!(
    (order?.billing?.first_name && order?.billing?.last_name) ||
    (order?.billing_address?.first_name && order?.billing_address?.last_name)
  );
  const needsGuestForm = isGuest && !hasBillingData && !guestFormCompleted;

  const handlingPaypalPaylaterSelection = async (): Promise<void> => {
    if (!order) return;

    setPaymentData({ loading: true });
    try {
      const updatePayment = await data.updatePaymentIntentCds({
        wc_order_key: order?.order_key,
        payment_method: "paypal_paylater",
      } as any);

      if (!updatePayment) throw new Error("Error during updating payment intent");

      const updateOrder = await data.updateCdsOrder(order.id, { payment_method: "paypal_paylater" });
      if (!updateOrder) throw new Error("Error during updating order");

      const preservedEmail = (order as any).email || order.billing_email;
      const preservedBillingAddress = (order as any).billing_address || order.billing;

      if (preservedEmail) {
        (updateOrder as any).email = preservedEmail;
        if (!updateOrder.billing_email) {
          updateOrder.billing_email = preservedEmail;
        }
      }

      if (preservedBillingAddress) {
        (updateOrder as any).billing_address = preservedBillingAddress;
      }

      setPaymentData({
        order: updateOrder,
        paymentMethod: "paypal_paylater",
        paymentIntent: updatePayment,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({ loading: false });
    }
  };

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!order || paymentIntent) return;

      try {
        const createPayment = await data.createPaymentIntentPaypalPaylater(order.order_key);
        if (!createPayment) throw new Error("Errore nella creazione del payment intent");

        setPaymentData({ paymentIntent: createPayment });
      } catch (error) {
        console.error("Error creating payment intent for PayPal Pay Later:", error);
      }
    };

    createPaymentIntent();
  }, [order?.order_key, paymentIntent]);

  useEffect(() => {
    if (order && subtotal) {
      const artpayFee = calculateArtpayFee(order, subtotal);

      if (order.payment_method !== "paypal_paylater") {
        const baseForPaypal = subtotal + artpayFee;
        const paypalFeeEstimated = baseForPaypal * PAYPAL_PAYLATER_FEE_ESTIMATE;
        const totalFees = artpayFee + paypalFeeEstimated;

        setFee(totalFees);
        setTotalWithFees(subtotal + totalFees);
      } else {
        const gatewayFee = calculatePaymentGatewayFee(order);
        const totalFees = artpayFee + gatewayFee;

        setFee(totalFees);
        setTotalWithFees(order.total ? Number(order.total) : subtotal + totalFees);
      }
    }
  }, [order, subtotal]);

  return (
    <PaymentProviderCard
      disabled={disabled}
      backgroundColor={"bg-[#EBF4FF]"}
      cardTitle={"PayPal - Paga in 3 rate"}
      icon={<PayPal />}
      subtitle={"Tre rate senza interessi. Da €30 a €2.000."}>
      {paymentSelected ? (
        <>
          {order?.payment_method === "paypal_paylater" ? (
            needsGuestForm ? (
              <GuestBillingForm />
            ) : paymentIntent ? (
              <Elements
                stripe={payments.stripe}
                options={{
                  clientSecret: paymentIntent?.client_secret || undefined,
                  loader: "always",
                  appearance: {
                    theme: "flat",
                    variables: {
                      colorBackground: "#EBF4FF",
                      colorTextSecondary: "#808791",
                      colorPrimary: "#009CDE",
                    },
                  },
                  defaultValues: {
                    billingDetails: {
                      email: (order as any)?.email || order?.billing_email || "",
                      name:
                        order?.billing?.first_name && order?.billing?.last_name
                          ? `${order.billing.first_name} ${order.billing.last_name}`
                          : "",
                      address: {
                        country: order?.billing?.country || "IT",
                      },
                    },
                  },
                }}>
                <PaymentForm variant="paypal_paylater" />
              </Elements>
            ) : (
              <div className="flex justify-center py-4">
                <div className="inline-block size-8 border-2 border-primary border-b-transparent rounded-full animate-spin"></div>
              </div>
            )
          ) : (
            order &&
            Number(order?.total) >= 30 &&
            Number(order?.total) <= 2000 && (
              <>
                <p className={"border-b border-zinc-300 pb-6"}>{`Tre rate senza interessi da € ${quote.toLocaleString("it-IT", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}</p>
                <ul className={"space-y-4 py-4"}>
                  <li className={"w-full flex justify-between"}>
                    Subtotale: <span>€&nbsp;{subtotal?.toLocaleString("it-IT", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                  </li>
                  <li>
                    <div className={"w-full flex justify-between"}>
                      {order?.payment_method === "paypal_paylater" ? "Commissioni artpay:" : "Commissioni totali:"}
                      <span>€&nbsp;{fee.toLocaleString("it-IT", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className={"text-secondary text-xs"}>Inclusi costi del servizio</p>
                  </li>
                  <li className={"w-full flex justify-between"}>
                    <strong>Totale:</strong>{" "}
                    <strong>€&nbsp;{totalWithFees.toLocaleString("it-IT", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</strong>
                  </li>
                </ul>
                <div className={"flex justify-center"}>
                  <button
                    onClick={handlingPaypalPaylaterSelection}
                    className={"artpay-button-style py-3! bg-[#009CDE] hover:bg-[#007ab5] text-white"}>
                    Paga la prima rata da € {quote.toLocaleString("it-IT", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  </button>
                </div>
              </>
            )
          )}
        </>
      ) : disabled ? (
        <></>
      ) : (
        <span>
          Ci hai ripensato?{" "}
          <button onClick={handlingPaypalPaylaterSelection} disabled={disabled}>
            <strong className={"underline cursor-pointer disabled:cursor-not-allowed"}>Paga con PayPal in 3 rate</strong>
          </button>
        </span>
      )}
    </PaymentProviderCard>
  );
};

export default PaypalPaylaterCard;