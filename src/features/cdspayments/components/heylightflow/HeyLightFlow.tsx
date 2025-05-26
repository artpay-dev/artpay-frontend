import SkeletonCard from "../ui/paymentprovidercard/SkeletonCard.tsx";
import { Order } from "../../../../types/order.ts";
import PaymentProviderCard from "../ui/paymentprovidercard/PaymentProviderCard.tsx";
import HeyLightIcon from "../../../../components/icons/HeyLightIcon.tsx";
import { useEffect, useState } from "react";
import axios from "axios";

type HeyLightProps = {
  isLoading?: boolean;
  order?: Order;
};

function extractUuid(note: string) {
  const match = note.match(/Ctr-([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
}


const copyes:Record<string, {h3: string, state: string}> = {
  success: {
    h3: "Complimenti, hai completato il pagamento con successo.",
    state: "Pagamento concluso con successo."
  },
  pending: {
    h3: "Complimenti il tuo lotto è pronto per completare il pagamento",
    state: "Procedura di richiesta prestito in corso."
  },
  cancelled: {
    h3: "Hai cancellato il pagamento. Se hai bisogno di aiuto, contatta il nostro team.",
    state: "Richiesta prestito cancellata."
  },
  awaiting_confirmation: {
    h3: "Grazie per aver completato la procedura di richiesta prestito.",
    state: "Richiesta prestito avviata, in attesa di conferma."
  },
  default: {
    h3: "Nessuna informazione disponibile.",
    state: "In attesa di ricevere informazioni dal sistema."
  }
}


const HeyLightFlow = ({ isLoading, order }: HeyLightProps) => {
  const subtotal = !order?.fee_lines.length ? Number(order?.total) / 1.06 : Number(order?.total) / 1.124658;
  const external_uuid = order ? extractUuid(order.customer_note) : ""
  console.log(external_uuid)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)

  const getApplicationStatus = async () => {
    try {

      const checkApplication = await axios.post(`${import.meta.env.VITE_ARTPAY_WEB_SERVICE}/api/heylight/check-application-status`, {
        external_contract_uuids: [external_uuid]
      });

      if (checkApplication.data.statuses.length > 0) {
        setApplicationStatus(checkApplication.data.statuses[0].status)
      }


    }catch(e) {
      console.error(e)
    }
  }

  useEffect(() => {
    getApplicationStatus()

  }, []);

  console.log(applicationStatus)
  console.log(external_uuid)

  return (
    <section className={"space-y-6"}>
      <div className={"border-t border-secondary mt-12 "}>
        <h3 className={"text-secondary py-4.5 flex items-center gap-2"}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.375 7C3.375 6.10254 4.10254 5.375 5 5.375H19C19.8975 5.375 20.625 6.10254 20.625 7V8.625H3.375V7ZM3.375 17V11.375H20.625V17C20.625 17.8975 19.8975 18.625 19 18.625H5C4.10254 18.625 3.375 17.8975 3.375 17ZM5 4.625C3.68832 4.625 2.625 5.68832 2.625 7V17C2.625 18.3117 3.68832 19.375 5 19.375H19C20.3117 19.375 21.375 18.3117 21.375 17V7C21.375 5.68832 20.3117 4.625 19 4.625H5Z"
                fill="#CDCFD3"
              />
            </g>
            <defs>
              <clipPath>
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Pagamenti
        </h3>
        <ul className={"flex flex-col items-center space-y-6 lg:flex-row lg:items-start lg:justify-start "}>
          <li className={"w-full"}>
            {!order || isLoading ? (
              <SkeletonCard />
            ) : (
              <div className={"space-y-6"}>
                <PaymentProviderCard subtotal={subtotal} backgroundColor={"bg-[#42B39640]"}>
                  <div className={"space-y-4"}>
                    <div className={"flex gap-6 items-center "}>
                      <span>
                        <HeyLightIcon />
                      </span>
                      <h3 className={"text-lg leading-[125%] text-tertiary text-balance"}>
                        {applicationStatus ? copyes[applicationStatus].h3 : copyes.default.h3}
                      </h3>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>N. Ordine</span>
                      <span className={"text-lg"}>{order.id}</span>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>N. Contratto</span>
                      <span className={"text-base"}>{external_uuid}</span>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>Stato</span>
                      <p>{applicationStatus ? copyes[applicationStatus].state : copyes.default.state}</p>
                    </div>
                  </div>
                </PaymentProviderCard>
              </div>
            )}
          </li>
        </ul>
      </div>
    </section>
  );
};

export default HeyLightFlow;
