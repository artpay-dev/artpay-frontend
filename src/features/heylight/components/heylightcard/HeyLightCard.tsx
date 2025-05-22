import PaymentProviderCard from "../../../cdspayments/components/ui/paymentprovidercard/PaymentProviderCard.tsx";
import { HeyLightPaymentRequest, PaymentProviderCardProps } from "../../../cdspayments/types.ts";
import AgreementCheckBox from "../../../cdspayments/components/ui/agreementcheckbox/AgreementCheckBox.tsx";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useData } from "../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../../cdspayments/stores/paymentStore.ts";
import { calculateArtPayFee } from "../../../cdspayments/utils.ts";
import axios from "axios";
import IFrameHeyLight from "../iFrameHeyLight.tsx";
import HeyLightIcon from "../../../../components/icons/HeyLightIcon.tsx";
//import { UserProfile } from "../../../../types/user.ts";



const HeyLightCard = ({subtotal, disabled, paymentSelected = true} : Partial<PaymentProviderCardProps>) => {
  const [fee, setFee] = useState<number>(0);
  const data = useData();
  const { setPaymentData, order, paymentIntent, user } = usePaymentStore();
  const [isChecked, setIsChecked] = useState(false);
  //const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const handlingHeyLightSelection = async (): Promise<void> => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      if (paymentIntent) {
        const updatePayment = await data.updatePaymentIntent({
          wc_order_key: order.order_key,
          payment_method: "heylight",
        });
        if (!updatePayment) throw new Error("Error during updating payment intent");

        setPaymentData({
          paymentMethod: "heylight",
          paymentIntent: updatePayment,
        });
      }

      const updateOrder = await data.updateOrder(order.id, { payment_method: "heylight", needs_processing: false });
      if (!updateOrder) throw new Error("Error during updating order");


      setPaymentData({
        paymentMethod: "heylight",
        paymentIntent: null,
        order: updateOrder,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  const abortHeyLightSelection = async (): Promise<void> => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      if (paymentIntent) {
        const updatePayment = await data.updatePaymentIntent({
          wc_order_key: order?.order_key,
          payment_method: "bnpl",
        });
        if (!updatePayment) throw new Error("Error during updating payment intent");

        setPaymentData({
          paymentIntent: updatePayment,
        })
      }

      const updateOrder = await data.updateOrder(order.id, { payment_method: "bnpl" });
      if (!updateOrder) throw new Error("Error during updating payment intent");

      setPaymentData({
        paymentMethod: "bnpl",
        paymentIntent: null,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };


  const handlePayment = async () => {
    if (!order || !user) return;
    setPaymentData({
      loading: true,
    });
    try {

      const getProducts = order.line_items.map(item => {
        return {
          sku: item.sku,
          quantity: item.quantity,
          price: (Number(item.subtotal) + Number(item.subtotal_tax)).toFixed(2),
          name: item.name
        }
      })

      const paymentRequest: Partial<HeyLightPaymentRequest> = {
        amount: {
          currency: "EUR",
          amount: order.total,
        },
        customer_details: {
          email_address: user?.email ,
          contact_number: user.billing.phone,
          first_name: user.first_name,
          last_name: user.last_name
        },
        billing_address: {
          country_code: "IT",
          is_client_validated: false,
          address_line_1: user.billing.address_1,
          zip_code: user.billing.postcode,
          city: user.billing.city
        },
        shipping_address: {
          country_code: "IT",
          is_client_validated: false,
          address_line_1: user.billing.address_1,
          zip_code: user.billing.postcode,
          city: user.billing.city
        },
        products: getProducts
      };

      const createApplication = await axios.post(`${import.meta.env.VITE_ARTPAY_WEB_SERVICE}/api/heylight/new-heylight-application`, paymentRequest);
      const redirectUrl = createApplication.data.redirect_url;

      if (redirectUrl) {
        const updateOrder = await data.updateOrder(order.id, { payment_method: "heylight", status: "processing", customer_note: `Contratto N. ${createApplication.data.application_uuid}` });
        if (updateOrder.status == 'processing') window.open(redirectUrl, "_blank");
        setPaymentData({
          order: updateOrder,
          paymentStatus: "processing",
          paymentMethod: "heylight",
          orderNote: createApplication.data.application_uuid,
        })
      }


    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  console.log(order)

  useEffect(() => {
    if (order) {
      const artpayFee = calculateArtPayFee(order);
      setFee(artpayFee);
    }



  }, [order, user]);


  console.log(user)


  return (
    <PaymentProviderCard icon={<HeyLightIcon />} cardTitle={'HeyLight'} backgroundColor={'bg-[#F2E9F7]'} subtitle={'Da € 100.00 fino a € 5000.00. Commissioni artpay: 6%'} disabled={disabled} subtotal={subtotal}>
        <IFrameHeyLight />
      {!disabled && paymentSelected ? (
        <>
          <ul className={"space-y-4 py-4"}>
            <li className={"w-full flex justify-between"}>
              Subtotale: <span>€&nbsp;{subtotal?.toFixed(2)}</span>
            </li>
            <li className={"w-full flex justify-between"}>
              Commissioni artpay: <span>€&nbsp;{fee.toFixed(2)}</span>
            </li>
            <li className={"w-full flex justify-between"}>
              <strong>Totale:</strong> <strong>€&nbsp;{(Number(subtotal) + Number(fee)).toFixed(2)}</strong>
            </li>
          </ul>
          {order?.payment_method == "heylight" ? (
            <>
              <AgreementCheckBox isChecked={isChecked} handleChange={handleCheckBox} />
              <button
                onClick={handlePayment}
                className={"artpay-button-style bg-[#9145BC] text-white disabled:opacity-65"}
                disabled={!isChecked}>
                Avvia richiesta prestito
              </button>
              <button className={"w-full flex justify-center mb-4 mt-8 cursor-pointer"} onClick={abortHeyLightSelection}>Annulla</button>
            </>
          ) : (
            <>
              <div className={"flex justify-center"}>
                <button className={'artpay-button-style bg-[#9145BC] text-white '} onClick={handlingHeyLightSelection}>Continua con HeyLight</button>
              </div>
              <NavLink to={"/"} className={"text-tertiary underline underline-offset-2 mt-8 block"}>
                Scopri di più
              </NavLink>
            </>
          )}
        </>
      ) : (
        disabled ? (<></>) : (
          <span>
          Ci hai ripensato?{" "}
            <button className={"cursor-pointer"} disabled={disabled}>
            <strong className={"underline"} onClick={handlingHeyLightSelection}>Paga con HeyLight</strong>
          </button>
        </span>
        )
      )}
    </PaymentProviderCard>
  );
};

export default HeyLightCard;