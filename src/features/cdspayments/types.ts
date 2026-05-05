import type { JSX, ReactNode } from 'react';

export type OrderStatus = 'pending' | 'on-hold' | 'processing' | 'completed' | 'cancelled' | 'failed';

export type PaymentMethod = 'klarna' | 'bank_transfer';

export type CdsOrderDetails = {
  order_key: string;
  order_id: number;
  status: OrderStatus;
  currency: string;
  created_date: string;
  description: string;
  third_party_id: string;
  base_total: string;
  platform_fee: string;
  grand_total: string;
  vendor_name: string;
  vendor_logo_url: string | null;
  lot_image_url: string | null;
  return_url: string | null;
  customer_email: string;
};

export type BankTransferIban = {
  iban: string;
  account_holder_name: string;
  bank_name: string;
  bic: string;
  country: string;
};

export type BankTransferFinancialAddress = {
  type: string;
  iban?: BankTransferIban;
};

export type BankTransferInstructions = {
  hosted_instructions_url?: string;
  reference?: string;
  amount_remaining?: number;
  currency?: string;
  financial_addresses: BankTransferFinancialAddress[];
};

export type CdsPaymentIntent = {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  next_action?: {
    type: string;
    display_bank_transfer_instructions?: BankTransferInstructions;
  };
};

export type PaymentProviderCardProps = {
  cardTitle: string;
  icon?: ReactNode;
  subtitle?: string;
  instructions?: string | ReactNode;
  button: JSX.Element;
  infoUrl?: string;
  disabled?: boolean;
  backgroundColor?: string;
  subtotal?: number;
  paymentSelected?: boolean;
  children?: ReactNode;
  className?: string;
};
