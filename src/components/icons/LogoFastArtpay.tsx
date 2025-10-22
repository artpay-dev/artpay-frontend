import usePaymentStore from "../../features/cdspayments/stores/paymentStore.ts";
import { useLocation } from "react-router-dom";
import { Order } from "../../types/order.ts";

const sizes : Record<string, string> = {
  small: "size-8",
  medium: "size-10",
  large: "size-12",
}


const LogoFastArtpay = ({className = "", size = 'medium', showCheckOut = false} : {className?: string, size?: string, showCheckOut: boolean}) => {
  const sizeStyle = sizes[size];  
  const { order, setPaymentData, openDraw } = usePaymentStore();
  const pathname = useLocation().pathname;

  const storedOrder = localStorage.getItem("CdsOrder");
  const hasCdsOrder = storedOrder != 'undefined' ? JSON.parse(storedOrder as string) : null;
  const cdsOrder: Order = hasCdsOrder || order;

  const handleNavigate = () => {
    if (pathname === "/acquisto-esterno") return;

    setPaymentData({
      openDraw: !openDraw,
    });
  };

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={handleNavigate}>
      <svg
        width="43"
        height="43"
        viewBox="0 0 43 43"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeStyle} `}>
        <circle cx="21.5" cy="21.5" r="21.5" fill="#3F55E9" />
        <g>
          <path
            d="M24.7627 10L22.7245 15.8874L28.9985 33H24.2605L20.3555 20.9439L16.5772 33H12L18.9446 13.6841C19.7374 11.4807 21.7448 10.0178 23.9947 10.0048L24.7627 10Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath>
            <rect width="17" height="23" fill="white" transform="translate(12 10)" />
          </clipPath>
        </defs>
      </svg>
      {cdsOrder?.status === "on-hold" && cdsOrder.created_via == "gallery_auction" || showCheckOut && (
        <>
          <span className="bg-red-400 rounded-full size-3 block absolute top-0 right-0 z-10 animate-ping opacity-65"></span>
          <span className="bg-red-400 rounded-full size-3 block absolute top-0 right-0 z-10"></span>
        </>
      )}
    </div>
  );
};

export default LogoFastArtpay;
