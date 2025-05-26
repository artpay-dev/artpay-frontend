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


export type HeyLightPaymentRequest = {
  amount: {
    currency: string;
    amount: string;
  };
  amount_format: 'DECIMAL';
  redirect_urls: {
    success_url: string;
    failure_url: string;
  };
  customer_details: {
    email_address: string;
    contact_number: string;
    first_name: string;
    last_name: string;
  };
  billing_address: {
    country_code: string;
    is_client_validated: boolean;
    address_line_1: string;
    zip_code: string;
    city: string;
  };
  shipping_address: {
    country_code: string;
    is_client_validated: boolean;
    address_line_1: string;
    zip_code: string;
    city: string;
  };
  store_id: string;
  store_name: string;
  store_number: string;
  products: {
    sku: string;
    quantity: number;
    price: string;
    name: string;
  }[];
  pricing_structure_code: string;
  language: string;
  order_reference: string;
}
