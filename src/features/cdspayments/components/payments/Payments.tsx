import { Order } from "../../../../types/order.ts";
import SkeletonCard from "../paymentprovidercard/SkeletonCard.tsx";
import KlarnaCard from "../klarnacard/KlarnaCard.tsx";
import SantanderCard from "../santandercard/SantanderCard.tsx";
import usePaymentStore from "../../store.ts";

type PaymentsProps = {
  order: Order;
  isLoading?: boolean;
};

const Payments = ({ order, isLoading }: PaymentsProps) => {
  const subtotal = !order?.fee_lines.length ? Number(order?.total) / 1.06 : Number(order?.total) / 1.124658;
  const { paymentMethod } = usePaymentStore();


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
            <li className={"w-full flex"}>
              {!order || isLoading ? (
                <SkeletonCard />
              ) : (
                <KlarnaCard
                  paymentSelected={paymentMethod == 'klarna'}
                  subtotal={subtotal}
                  disabled={Number(order.total) > 2500 || isLoading}
                />
              )}
            </li>
            <li className={"w-full"}>
              {!order || isLoading ? (
                <SkeletonCard />
              ) : (
                <SantanderCard
                  subtotal={subtotal}
                  paymentSelected={paymentMethod == 'santander'}
                  disabled={Number(order.total) <= 1500 || Number(order.total) >= 30000 || isLoading}
                />
              )}
            </li>
          </ul>
      </div>
    </section>
  );
};

export default Payments;
