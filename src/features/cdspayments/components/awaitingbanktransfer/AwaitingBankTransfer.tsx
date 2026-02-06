import SkeletonCard from "../ui/paymentprovidercard/SkeletonCard.tsx";
import PaymentProviderCard from "../ui/paymentprovidercard/PaymentProviderCard.tsx";
import { Order } from "../../../../types/order.ts";
import SantanderIcon from "../../../../components/icons/SantanderIcon.tsx";
import { calculateOrderSubtotal } from "../../utils/orderCalculations.ts";
import { useNavigate } from "../../../../utils.ts";

const AwaitingBankTransfer = ({ order, isLoading }: { order: Order; isLoading: boolean }) => {
  const subtotal = order ? calculateOrderSubtotal(order) : 0;
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/");
  };

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
        <ul className={"flex flex-col items-center space-y-6 "}>
          <li className={"w-full"}>
            {!order || isLoading ? (
              <SkeletonCard />
            ) : (
              <div className={"space-y-6"}>
                <PaymentProviderCard subtotal={subtotal} backgroundColor={"bg-[#FFF5E6]"}>
                  <div className={"space-y-4"}>
                    <div className={"flex gap-6 items-center "}>
                      <span>
                        <SantanderIcon />
                      </span>
                      <h3 className={"text-lg leading-[125%] text-tertiary"}>
                        In attesa dell'accredito del bonifico
                      </h3>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>N. Ordine</span>
                      <span className={"text-lg"}>{order.id}</span>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>Stato</span>
                      <p>In elaborazione</p>
                    </div>
                    <div className={"flex flex-col gap-1"}>
                      <span className={"text-secondary"}>Modalità di pagamento</span>
                      <p>Bonifico bancario con prestito Santander</p>
                    </div>
                  </div>
                </PaymentProviderCard>
              </div>
            )}
          </li>
          <li className={"w-full"}>
            {!order || isLoading ? (
              <SkeletonCard />
            ) : (
              <PaymentProviderCard backgroundColor={"bg-white"} className={"shadow-lg"}>
                <div className={"flex flex-col items-center justify-center w-full space-y-6"}>
                  <div className={"flex flex-col items-center space-y-2"}>
                    <svg
                      width="96"
                      height="96"
                      viewBox="0 0 96 96"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <circle cx="48" cy="48" r="40" fill="#FFF5E6" />
                      <path
                        d="M48 28V52M48 60V64"
                        stroke="#FF9800"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p className={"text-2xl text-center leading-[125%]"}>Pagamento in elaborazione</p>
                    <p className="text-center text-gray-600">
                      Hai ricevuto un'email con i dati bancari per completare il bonifico.
                      <br />
                      Una volta ricevuto l'accredito, il tuo ordine verrà confermato.
                    </p>
                  </div>
                  <div className={"mb-6"}>
                    <button
                      onClick={handleNavigate}
                      className={"artpay-button-style bg-primary hover:bg-primary-hover text-white max-w-fit"}>
                      Torna alla home
                    </button>
                  </div>
                </div>
              </PaymentProviderCard>
            )}
          </li>
        </ul>
      </div>
    </section>
  );
};

export default AwaitingBankTransfer;