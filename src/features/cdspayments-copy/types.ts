import { ReactNode } from "react";

export type PaymentProviderCardProps = {
  cardTitle: string;
  icon?: ReactNode;
  subtitle?: string;
  instructions?: string | ReactNode;
  button: React.JSX.Element;
  infoUrl: string;
  disabled?: boolean;
  backgroundColor?: string;
  subtotal: number;
  paymentSelected: boolean;
  children?: ReactNode;
  className?: string;
};
