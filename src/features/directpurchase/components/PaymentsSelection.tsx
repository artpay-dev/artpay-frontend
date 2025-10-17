import { PiCreditCardThin } from "react-icons/pi";
import ContentCard from "../../../components/ContentCard.tsx";
import PaymentRadioSelector from "../../../components/PaymentRadioSelector.tsx";
import { useDirectPurchase } from "../contexts/DirectPurchaseContext.tsx";
import { KLARNA_FEE, KLARNA_MAX_LIMIT } from "../../../constants.ts";

interface PaymentsSelectionProps {
  paymentMethod: string | null;
  onChange: (paymentMethod: string) => void;
}

const PaymentsSelection = ({ paymentMethod, onChange }: PaymentsSelectionProps) => {

  const { orderMode, pendingOrder, loading } = useDirectPurchase();

  // Calcola il totale dell'ordine (incluse commissioni)
  const orderTotal = Number(pendingOrder?.total || 0);

  // Determina se un metodo di pagamento è disponibile in base all'importo
  const isPaymentMethodAvailable = (method: string): boolean => {
    switch (method) {
      case "klarna":
        // Calcola il totale con la fee di Klarna (6.1%) e verifica che non superi il limite
        const totalWithKlarnaFee = orderTotal * KLARNA_FEE;
        return totalWithKlarnaFee <= KLARNA_MAX_LIMIT;
      default:
        return true;
    }
  };

  const paymentMethods = {
    Santander: {
      value: "Santander",
      label: "Santander",
      description: "Finanzia fino a 30.000 €, in max 84 rate, soggetto ad approvazione dell'istituto di credito.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#EA1D25" />
          <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
          <path
            d="M19.6526 10.2795C19.9083 10.6554 20.0362 11.0892 20.0682 11.5229C22.4334 12.0723 24.0315 13.2578 23.9995 14.559C23.9995 16.4675 20.8672 18 16.9998 18C13.1323 18 10 16.4675 10 14.559C10 13.2 11.6301 12.0145 13.9633 11.4651C13.9633 11.9855 14.0912 12.506 14.3788 12.9687L16.5843 16.4096C16.7441 16.6699 16.8719 16.959 16.9358 17.2482L17.0317 17.1036C17.5751 16.2651 17.5751 15.1952 17.0317 14.3566L15.2738 11.6096C14.7304 10.7422 14.7304 9.7012 15.2738 8.86265L15.3697 8.71807C15.4336 9.00723 15.5615 9.29639 15.7213 9.55663L16.7441 11.1759L18.3422 13.6916C18.502 13.9518 18.6298 14.241 18.6938 14.5301L18.7897 14.3855C19.333 13.547 19.333 12.4771 18.7897 11.6386L17.0317 8.89157C16.4884 8.05301 16.4884 6.98313 17.0317 6.14458L17.1276 6C17.1915 6.28916 17.3194 6.57831 17.4792 6.83855L19.6526 10.2795Z"
            fill="white"
          />
        </svg>
      ),
    },
    klarna: {
      value: "klarna",
      label: "Klarna",
      description: "Paga in 3 rate fino a €2.500",
      icon: (
        <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#FEB4C7" />
          <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
          <path
            d="M13.6396 10.8447C14.0986 10.8447 14.5244 10.9945 14.877 11.249V10.9668H16.125V15.3779H14.877V15.0957C14.5244 15.3502 14.0986 15.5 13.6396 15.5C12.4252 15.5 11.4406 14.4581 11.4404 13.1729C11.4404 11.8874 12.425 10.8448 13.6396 10.8447ZM26.8047 10.8447C27.2637 10.8447 27.6895 10.9945 28.042 11.249V10.9668H29.29V15.3779H28.042V15.0957C27.6895 15.3502 27.2637 15.5 26.8047 15.5C25.5902 15.5 24.6057 14.4581 24.6055 13.1729C24.6055 11.8874 25.5901 10.8448 26.8047 10.8447ZM30.6143 13.8135C31.0466 13.8137 31.3975 14.185 31.3975 14.6426C31.3972 15.0999 31.0464 15.4705 30.6143 15.4707C30.1819 15.4707 29.8313 15.1 29.8311 14.6426C29.8311 14.1848 30.1818 13.8135 30.6143 13.8135ZM5.26855 9V15.3799H3.88477V9H5.26855ZM8.72266 9C8.72266 10.3811 8.21382 11.6661 7.30762 12.6211L9.21973 15.3799H7.51172L5.43359 12.3818L5.96973 11.957C6.85897 11.2521 7.36914 10.174 7.36914 9H8.72266ZM10.9287 15.3779H9.62207V9.00098H10.9287V15.3779ZM18.0547 11.542C18.3048 11.1974 18.7716 10.9678 19.2783 10.9678V12.251C19.2733 12.2509 19.2677 12.25 19.2627 12.25C18.769 12.2502 18.0577 12.6239 18.0576 13.3184V15.3779H16.7773V10.9668H18.0547V11.542ZM22.3877 10.8486C23.3929 10.8487 24.1641 11.5468 24.1641 12.5732V15.3779H22.918V13.0508C22.918 12.4074 22.6021 12.0605 22.0537 12.0605C21.5421 12.0606 21.1173 12.3891 21.1172 13.0596V15.3779H19.8594V10.9668H21.1016V11.4639C21.417 11.012 21.8892 10.8486 22.3877 10.8486ZM13.7422 12.0381C13.1177 12.0381 12.6113 12.5461 12.6113 13.1729C12.6115 13.7995 13.1179 14.3076 13.7422 14.3076C14.3666 14.3076 14.8729 13.7995 14.873 13.1729C14.873 12.5461 14.3667 12.0381 13.7422 12.0381ZM26.9072 12.0381C26.2827 12.0381 25.7764 12.5461 25.7764 13.1729C25.7766 13.7995 26.2828 14.3076 26.9072 14.3076C27.5316 14.3076 28.0379 13.7995 28.0381 13.1729C28.0381 12.5461 27.5317 12.0381 26.9072 12.0381Z"
            fill="#17120F"
          />
        </svg>
      ),
    },
    card: {
      value: "card",
      label: "Carta di credito",
      description: "Paga con Visa, Mastercard o American Express.",
      icon: (
        <svg width="160" height="24" viewBox="0 0 160 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="42.5" y="0.5" width="33" height="23" rx="3.5" fill="white" />
          <rect x="42.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
          <path
            d="M63.5771 5.02997C67.322 5.02997 70.3584 8.02986 70.3584 11.7302C70.3583 15.4304 67.322 18.4304 63.5771 18.4304C61.8982 18.4303 60.3629 17.8256 59.1787 16.8268C57.9945 17.8254 56.4591 18.4304 54.7803 18.4304C51.0357 18.4301 48.0001 15.4302 48 11.7302C48 8.02999 51.0356 5.03019 54.7803 5.02997C56.459 5.02997 57.9945 5.63405 59.1787 6.63251C60.3628 5.63388 61.8984 5.03007 63.5771 5.02997Z"
            fill="#ED0006"
          />
          <path
            d="M63.5771 5.02997C67.322 5.02997 70.3584 8.02986 70.3584 11.7302C70.3583 15.4304 67.322 18.4304 63.5771 18.4304C61.8985 18.4303 60.3638 17.8253 59.1797 16.8268C60.6369 15.598 61.5624 13.7715 61.5625 11.7302C61.5625 9.6886 60.6371 7.86141 59.1797 6.63251C60.3637 5.63417 61.8986 5.03007 63.5771 5.02997Z"
            fill="#F9A000"
          />
          <path
            d="M59.1787 6.63251C60.6362 7.86141 61.5615 9.6886 61.5615 11.7302C61.5615 13.7715 60.636 15.598 59.1787 16.8268C57.7217 15.598 56.7969 13.7713 56.7969 11.7302C56.7969 9.68882 57.7215 7.8614 59.1787 6.63251Z"
            fill="#FF5E00"
          />
          <rect x="84.5" y="0.5" width="33" height="23" rx="3.5" fill="#1F72CD" />
          <rect x="84.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M90.0952 8.5L86.9141 15.7467H90.7223L91.1944 14.5913H92.2735L92.7457 15.7467H96.9375V14.8649L97.311 15.7467H99.4793L99.8528 14.8462V15.7467H108.571L109.631 14.6213L110.623 15.7467L115.101 15.7561L111.91 12.1436L115.101 8.5H110.693L109.661 9.60463L108.699 8.5H99.2156L98.4013 10.3704L97.5678 8.5H93.7675V9.35186L93.3447 8.5H90.0952ZM90.8324 9.52905H92.6887L94.7987 14.4431V9.52905H96.8322L98.462 13.0524L99.964 9.52905H101.987V14.7291H100.756L100.746 10.6544L98.9512 14.7291H97.8499L96.0449 10.6544V14.7291H93.5121L93.032 13.5633H90.4378L89.9586 14.728H88.6016L90.8324 9.52905ZM108.12 9.52905H103.113V14.726H108.042L109.631 13.0036L111.162 14.726H112.762L110.436 12.1426L112.762 9.52905H111.231L109.651 11.2316L108.12 9.52905ZM91.7355 10.4089L90.8809 12.4857H92.5892L91.7355 10.4089ZM104.35 11.555V10.6057V10.6048H107.473L108.836 12.1229L107.413 13.6493H104.35V12.613H107.081V11.555H104.35Z"
            fill="white"
          />
          <rect x="126.5" y="0.5" width="33" height="23" rx="3.5" fill="white" />
          <rect x="126.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M136.751 15.8582H134.691L133.147 9.79235C133.073 9.51332 132.918 9.26664 132.689 9.15038C132.117 8.85821 131.488 8.62568 130.801 8.50841V8.27487H134.119C134.577 8.27487 134.92 8.62568 134.978 9.0331L135.779 13.4086L137.838 8.27487H139.84L136.751 15.8582ZM140.985 15.8581H139.04L140.642 8.27478H142.587L140.985 15.8581ZM145.103 10.3757C145.161 9.96725 145.504 9.73372 145.905 9.73372C146.535 9.67508 147.22 9.79235 147.793 10.0835L148.136 8.45079C147.564 8.21725 146.934 8.09998 146.363 8.09998C144.475 8.09998 143.101 9.15038 143.101 10.6082C143.101 11.7173 144.074 12.2996 144.761 12.6504C145.504 13.0002 145.79 13.2337 145.733 13.5835C145.733 14.1082 145.161 14.3418 144.589 14.3418C143.902 14.3418 143.215 14.1669 142.587 13.8747L142.243 15.5084C142.93 15.7996 143.673 15.9169 144.36 15.9169C146.477 15.9745 147.793 14.9251 147.793 13.35C147.793 11.3664 145.103 11.2502 145.103 10.3757ZM154.6 15.8581L153.056 8.27478H151.397C151.053 8.27478 150.71 8.50832 150.595 8.85812L147.735 15.8581H149.738L150.138 14.7501H152.598L152.827 15.8581H154.6ZM151.684 10.317L152.255 13.1751H150.653L151.684 10.317Z"
            fill="#172B85"
          />
          <defs>
            <clipPath id="clip0_935_2">
              <rect width="16" height="16" fill="white" transform="translate(9 4)" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    bank_transfer: {
      value: "bank_transfer",
      label: "Bonifico bancario",
      description: "Paga tramite bonifico bancario tradizionale.",
      icon: (
        <svg width="42" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#C2C9FF" />
          <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
          <g clip-path="url(#clip0_935_2)">
            <path
              d="M16.9376 5.75784C16.9988 5.74206 17.0646 5.74993 17.1212 5.78128L23.1212 9.11461C23.2207 9.1699 23.2707 9.28566 23.2423 9.39586C23.2137 9.50614 23.114 9.58336 23.0001 9.58336H11.0001C10.8862 9.58336 10.7865 9.50614 10.7579 9.39586C10.7295 9.28566 10.7795 9.1699 10.879 9.11461L16.879 5.78128L16.9376 5.75784ZM11.9649 9.08336H22.0353L17.0001 6.28584L11.9649 9.08336Z"
              fill="#010F22"
            />
            <path
              d="M22.3333 17.5V18H11.6667V17.5H22.3333ZM22.5 17.3333V16.6667C22.5 16.5746 22.4254 16.5 22.3333 16.5H11.6667C11.5746 16.5 11.5 16.5746 11.5 16.6667V17.3333C11.5 17.4254 11.5746 17.5 11.6667 17.5V18C11.2985 18 11 17.7015 11 17.3333V16.6667C11 16.2985 11.2985 16 11.6667 16H22.3333C22.7015 16 23 16.2985 23 16.6667V17.3333C23 17.7015 22.7015 18 22.3333 18V17.5C22.4254 17.5 22.5 17.4254 22.5 17.3333Z"
              fill="#010F22"
            />
            <path
              d="M12.75 15.3334V10.6667C12.75 10.5286 12.8619 10.4167 13 10.4167C13.1381 10.4167 13.25 10.5286 13.25 10.6667V15.3334C13.25 15.4714 13.1381 15.5834 13 15.5834C12.8619 15.5834 12.75 15.4714 12.75 15.3334Z"
              fill="#010F22"
            />
            <path
              d="M16.75 15.3334V10.6667C16.75 10.5286 16.8619 10.4167 17 10.4167C17.1381 10.4167 17.25 10.5286 17.25 10.6667V15.3334C17.25 15.4714 17.1381 15.5834 17 15.5834C16.8619 15.5834 16.75 15.4714 16.75 15.3334Z"
              fill="#010F22"
            />
            <path
              d="M20.75 15.3334V10.6667C20.75 10.5286 20.8619 10.4167 21 10.4167C21.1381 10.4167 21.25 10.5286 21.25 10.6667V15.3334C21.25 15.4714 21.1381 15.5834 21 15.5834C20.8619 15.5834 20.75 15.4714 20.75 15.3334Z"
              fill="#010F22"
            />
          </g>
        </svg>
      ),
    },
  };

  if (loading || !pendingOrder) {
    return (
      <ContentCard
        title="Metodi di pagamento"
        icon={<PiCreditCardThin size="28px" />}
        contentPadding={0}
        contentPaddingMobile={0}>
        <div className="space-y-8 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard
      title="Metodi di pagamento"
      icon={<PiCreditCardThin size="28px" />}
      contentPadding={0}
      contentPaddingMobile={0}>
      <div className="space-y-8">
        {orderMode !== "redeem" && isPaymentMethodAvailable("klarna") && (
          <div className="space-y-4">
            <h3>Pagamento dilazionato</h3>
            <PaymentRadioSelector
              method={paymentMethods.klarna}
              selectedMethod={paymentMethod}
              onMethodChange={onChange}
            />
          </div>
        )}
        <div className="space-y-4">
          {orderMode != "redeem" && <h3>Unica soluzione</h3>}
            <PaymentRadioSelector method={paymentMethods.card} selectedMethod={paymentMethod} onMethodChange={onChange} />
            <PaymentRadioSelector
              method={paymentMethods.bank_transfer}
              selectedMethod={paymentMethod}
              onMethodChange={onChange}
            />
        </div>
      </div>
    </ContentCard>
  );
};

export default PaymentsSelection;
