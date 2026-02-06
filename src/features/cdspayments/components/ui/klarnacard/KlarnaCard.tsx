import { NavLink } from "react-router-dom";
import { PaymentProviderCardProps } from "../../../types.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../../stores/paymentStore.ts";
import PaymentProviderCard from "../paymentprovidercard/PaymentProviderCard.tsx";
import KlarnaIcon from "../paymentprovidercard/KlarnaIcon.tsx";
import { useEffect, useState } from "react";
import PaymentForm from "../paymentform/PaymentForm.tsx";
import { Elements } from "@stripe/react-stripe-js";
import { usePayments } from "../../../../../hoc/PaymentProvider.tsx";
import { calculateArtpayFee, calculatePaymentGatewayFee } from "../../../utils/orderCalculations.ts";
import GuestBillingForm from "../../guestbillingform/GuestBillingForm.tsx";

const KlarnaCard = ({ subtotal, disabled, paymentSelected = true }: Partial<PaymentProviderCardProps>) => {
  const payments = usePayments();
  const { order, setPaymentData, paymentIntent, user, guestFormCompleted } = usePaymentStore();
  const [fee, setFee] = useState<number>(0);
  const [totalWithFees, setTotalWithFees] = useState<number>(0);
  const data = useData();
  const quote = totalWithFees / 3;

  // Check if guest needs to fill form
  const isGuest = !user;
  const hasBillingData = !!(
    (order?.billing?.first_name && order?.billing?.last_name) ||
    (order?.billing_address?.first_name && order?.billing_address?.last_name)
  );
  const needsGuestForm = isGuest && !hasBillingData && !guestFormCompleted;

  console.log("KlarnaCard - isGuest:", isGuest);
  console.log("KlarnaCard - hasBillingData:", hasBillingData);
  console.log("KlarnaCard - order?.billing:", order?.billing);
  console.log("KlarnaCard - order?.billing_address:", order?.billing_address);
  console.log("KlarnaCard - order?.email:", order?.email);
  console.log("KlarnaCard - order?.billing_email:", order?.billing_email);
  console.log("KlarnaCard - guestFormCompleted:", guestFormCompleted);
  console.log("KlarnaCard - needsGuestForm:", needsGuestForm);
  console.log("KlarnaCard - order?.payment_method:", order?.payment_method);
  console.log("KlarnaCard - paymentIntent:", paymentIntent);

  const handlingKlarnaSelection = async (): Promise<void> => {
    if(!order) {
      console.log("order not found");
      return;
    }

    setPaymentData({
        loading: true,
      });
      try {

        // Add Klarna fee to the payment intent
        const updatePayment = await data.updatePaymentIntentCds({
          wc_order_key: order?.order_key,
          add_klarna_fee: true,
        });

        console.log("updatePayment with Klarna fee", updatePayment);
        if (!updatePayment) throw new Error("Error during updating payment intent");
        console.log('update payment intent', updatePayment);


        // Use numeric order ID for WooCommerce API
        const updateOrder = await data.updateCdsOrder(order.id, { payment_method: "klarna" });
        if (!updateOrder) throw new Error("Error during updating payment intent");
        console.log('update order', updateOrder);

        // Preserve email and billing_address from current order
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
          paymentMethod: "klarna",
          paymentIntent: updatePayment
        });


      } catch (e) {
        console.error(e);
      } finally {
        setPaymentData({
          loading: false,
        });
      }
  };

  useEffect(() => {
    const createPaymentIntent = async () => {
      if(!order || paymentIntent) {
        return;
      }

      try {
        console.log("Creating payment intent for Klarna with order_key:", order.order_key);
        const createPayment = await data.createPaymentIntentKlarna(order.order_key);
        if (!createPayment) throw new Error("Errore nella creazione del payment intent");
        console.log("Payment intent created for Klarna:", createPayment);

        setPaymentData({
          paymentIntent: createPayment,
        });
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };

    createPaymentIntent();
  }, [order?.order_key, paymentIntent]);

  useEffect(() => {
    if (order && subtotal) {
      const artpayFee = calculateArtpayFee(order, subtotal);

      // Se payment_method non è ancora "klarna", stima la fee di Klarna (circa 5% già con IVA)
      if (order.payment_method !== "klarna") {
        // Stima: Klarna fee è circa 5% sul (subtotale + artpay)
        const baseForKlarna = subtotal + artpayFee;
        const klarnaFeeEstimated = baseForKlarna * 0.05; // 5% (già include IVA)
        const totalFees = artpayFee + klarnaFeeEstimated;

        setFee(totalFees);
        setTotalWithFees(subtotal + totalFees);
      } else {
        // Se già selezionato Klarna, usa i valori reali dall'ordine
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
      backgroundColor={"bg-[#FFE9EE]"}
      cardTitle={"Klarna"}
      icon={<KlarnaIcon />}
      subtitle={"Paga in 3 rate fino a €2.500,00"}>
      {paymentSelected ? (
        <>
          {order?.payment_method == "klarna" ? (
            // Klarna selected - check if guest form needed
            needsGuestForm ? (
              <GuestBillingForm />
            ) : paymentIntent ? (
              <>
                {console.log("Rendering Elements with clientSecret:", paymentIntent?.client_secret)}
                <Elements
                  stripe={payments.stripe}
                  options={{
                    clientSecret: paymentIntent?.client_secret || undefined,
                    loader: "always",
                    appearance: {
                      theme: "flat",
                      variables: {
                        colorBackground: '#fff',
                        colorTextSecondary: '#808791',
                        colorPrimary: '#FFB3C7', // Klarna pink
                      },
                      rules: {
                        ".Block": {
                          backgroundColor: "#FFE9EE",
                        },
                      },
                    },
                    defaultValues: {
                      billingDetails: {
                        email: (order as any)?.email || order?.billing_email || '',
                        name: order?.billing?.first_name && order?.billing?.last_name
                          ? `${order.billing.first_name} ${order.billing.last_name}`
                          : '',
                        address: {
                          country: order?.billing?.country || 'IT',
                        },
                      },
                    },
                  }}>
                  <PaymentForm variant="klarna" />
                </Elements>
              </>
            ) : (
              <div className="flex justify-center py-4">
                <div className="inline-block size-8 border-2 border-primary border-b-transparent rounded-full animate-spin"></div>
              </div>
            )
          ) : (
            order &&
            Number(order?.total) <= 2500 && (
              <>
                <p className={"border-b border-zinc-300 pb-6"}>{`Tre rate senza interessi da € ${quote.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}</p>
                <ul className={"space-y-4 py-4"}>
                  <li className={"w-full flex justify-between"}>
                    Subtotale: <span>€&nbsp;{subtotal?.toLocaleString('it-IT', { maximumFractionDigits: 2 , minimumFractionDigits: 2})}</span>
                  </li>
                  <li >
                    <div className={"w-full flex justify-between"}>
                      {order?.payment_method === "klarna" ? "Commissioni artpay:" : "Commissioni totali:"} <span>€&nbsp;{fee.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className={'text-secondary text-xs'}>Inclusi costi del finanziamento</p>
                  </li>
                  <li className={"w-full flex justify-between"}>
                    <strong>Totale:</strong> <strong>€&nbsp;{totalWithFees.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</strong>
                  </li>
                </ul>
                <div className={"flex justify-center"}>
                  <button
                    onClick={handlingKlarnaSelection}
                    className={"artpay-button-style py-3! bg-klarna hover:bg-klarna-hover"}>
                    Paga la prima rata da € {quote.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  </button>
                </div>
              </>
            )
          )}
          <NavLink
            to={"/guide/artpay-e-klarna"}
            className={`text-tertiary underline underline-offset-2 mt-8 block ${disabled ? 'cursor-not-allowed': 'cursor-pointer'} `}
            aria-disabled={disabled}>
            Scopri di più
          </NavLink>
        </>
      ) : (
        disabled ? (
          <></>
        ) : (
          <span>
          Ci hai ripensato?{" "}
            <button onClick={handlingKlarnaSelection} disabled={disabled || Number(order?.total) > 2500}>
            <strong className={"underline cursor-pointer disabled:cursor-not-allowed"}>Paga con Klarna</strong>
          </button>
        </span>
        )
      )}
    </PaymentProviderCard>
  );
};

export default KlarnaCard;
