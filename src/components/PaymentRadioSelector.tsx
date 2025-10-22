import React, { ReactNode } from "react";

export interface PaymentMethod {
  value: string;
  label: string;
  description: string;
  icon: ReactNode;
}

export interface PaymentRadioSelectorProps {
  method: PaymentMethod;
  selectedMethod: string | null;
  onMethodChange: (method: string) => void;
  disabled?: boolean;
  className?: string;
}

const PaymentRadioSelector: React.FC<PaymentRadioSelectorProps> = ({
  method,
  selectedMethod,
  onMethodChange,
  disabled = false,
}) => {
  const isSelected = selectedMethod === method.value;

  return (
    <>
        <div
          key={method.value}
          className={`${
            isSelected ? "bg-[#F0F1FD] border-[#007AFF]" : "bg-[#FAFAFB] border-transparent"
          } rounded-lg p-4 cursor-pointer transition-all border-2 hover:border-[#007AFF]/50 focus-within:ring-2 focus-within:ring-[#007AFF] focus-within:ring-opacity-50 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => !disabled && onMethodChange(method.value)}
        >
          <div className="flex items-start space-x-3">
            <div className="relative flex items-center justify-center mt-1 w-4 h-4">
              <input
                type="radio"
                name="payment-method"
                value={method.value}
                className="absolute w-4 h-4 opacity-0 cursor-pointer peer"
                checked={isSelected}
                disabled={disabled}
                onChange={(e) => onMethodChange(e.target.value)}
              />
              <div className={`w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all peer-focus:ring-2 peer-focus:ring-[#007AFF] peer-focus:ring-offset-1 ${
                isSelected ? 'border-[#007AFF]' : 'border-[#CDCFD3]'
              }`}>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
                )}
              </div>
            </div>
            <label className={`${
              isSelected ? "text-[#007AFF]" : "text-[#010F22]"
            } text-sm font-semibold cursor-pointer space-x-5 flex items-center w-full ${disabled ? "cursor-not-allowed" : ""}`}>
              <div className="flex-1">
                <span>{method.label}</span>
                <p className="font-normal text-xs !text-[#808791] mt-1">
                  {method.description}
                </p>
              </div>
              {method.icon}
            </label>
          </div>
        </div>
    </>
  );
};

export default PaymentRadioSelector;