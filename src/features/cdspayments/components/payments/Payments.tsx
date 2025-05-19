import PaymentProviderCard from "../ui/paymentprovidercard/PaymentProviderCard.tsx";
import ArtpayIcon from "../ui/paymentprovidercard/ArtpayIcon.tsx";
import KlarnaIcon from "../ui/paymentprovidercard/KlarnaIcon.tsx";

const Payments = () => {
  return (
    <section className={"space-y-6"}>
      <div>
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
          Metodi di pagamento
        </h3>
        <ul className={"flex flex-col items-center space-y-6"}>
          <li className={"w-full"}>
            <PaymentProviderCard
              backgroundColor={"bg-[#FFE9EE]"}
              cardTitle={"Pagamento con klarna"}
              icon={<KlarnaIcon />}
              subtitle={"Pagamento in 3 rate fino a €2.500,00. Commissioni artpay: 6% + 5%"}></PaymentProviderCard>
          </li>
          <li className={"w-full flex"}>
            <PaymentProviderCard
              icon={<ArtpayIcon />}
              cardTitle={"Pagamento con prestito"}
              subtitle={"A partire da € 1.500,00 fino a € 30.000,00 Commissioni artpay: 6%"}>
              <ol className={"list-decimal ps-4 space-y-1"}>
                <li>Avvia finanziamento</li>
                <li>Calcola la rata e richiedi prestito</li>
                <li>Completa pagamento</li>
              </ol>
            </PaymentProviderCard>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Payments;
