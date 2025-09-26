import {PaymentProviderCardProps} from "../../../types.ts";


const PaymentProviderCard = ({
  disabled = false,
  cardTitle,
  subtitle,
  backgroundColor,
  icon,
  children,
  className = '',
  button
}: Partial<PaymentProviderCardProps>) => {


  return (
    <div
      className={`${disabled ? "opacity-65 cursor-not-allowed" : ""} ${
        backgroundColor ? backgroundColor : "bg-[#E2E6FC]"
      } p-4 rounded-lg w-full max-w-lg lg:max-w-sm ${className}`}>
      <div className={`space-y-4 `}>
        {icon && <div>{icon}</div>}
        {cardTitle && (
          <div className={"space-y-1"}>
            <h3 className={"font-bold leading-[125%] text-tertiary"}>{cardTitle}</h3>
            <p className={"text-sm"}>{subtitle}</p>
          </div>
        )}
        {children}
      </div>
      {button ? <div className={"flex items-center justify-start mt-6"}>{button}</div> : ""}
    </div>
  );
};

export default PaymentProviderCard;
