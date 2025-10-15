import { BillingData, ShippingData } from "./user.ts";
import { ReactNode } from "react";

export type OrderCreateRequest = {
  id?: number;
  customer_id: number;
  status?: string;
  customer_note?: string;
  payment_method?: string;
  payment_method_title?: string;
  set_paid: boolean;
  shipping: ShippingData;
  billing?: BillingData;
  shipping_lines?: ShippingLineUpdateRequest[];
  line_items: LineItemRequest[];
};

export type TemporaryOrderCreateRequest = {
  sku: string;
  email_EXT: string;
  email_ART: string;
};

export type OrderUpdateRequest = {
  customer_id?: number;
  customer_note?: string;
  payment_method?: string;
  payment_method_title?: string;
  needs_payment?: boolean;
  needs_processing?: boolean;
  status?: string;
  billing?: BillingData;
  shipping?: ShippingData;
  shipping_lines?: ShippingLineUpdateRequest[];
  line_items?: LineItemRequest[];
  coupon_lines?: { code: string }[];
};

export type LineItemRequest = {
  id?: number;
  product_id: number | null;
  quantity?: number;
};

export type ShippingLineUpdateRequest = {
  method_id: string | null;
  id?: number;
  instance_id?: string;
  method_title?: string;
  total?: string
};

export type Order = {
  id: number;
  parent_id: number;
  status: OrderStatus;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
  };
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed?: null | string;
  date_paid?: null | string;
  cart_hash: string;
  number: string;
  meta_data: {
    id: number;
    key: string;
    value: string;
  }[];
  line_items: LineItem[];
  tax_lines: any[];
  shipping_lines: ShippingLine[];
  fee_lines: any[];
  coupon_lines: any[];
  refunds: any[];
  payment_url: string;
  is_editable: boolean;
  needs_payment: boolean;
  needs_processing: boolean;
  date_created_gmt: string;
  date_modified_gmt: string;
  date_completed_gmt?: null | string;
  date_paid_gmt?: null | string;
  currency_symbol: string;
  _links?: {
    self: {
      href: string;
    }[];
    collection: {
      href: string;
    }[];
    customer: {
      href: string;
    }[];
  };
};

export type ShippingLine = {
  id?: number;
  method_title: string;
  method_id: string;
  instance_id?: string;
  total?: string;
  total_tax?: string;
  taxes?: {
    id: number;
    total: string;
    subtotal: string;
  }[];
  meta_data?: any[];
};

export type ShippingMethodOption = {
  id: number;
  instance_id: number;
  title: string;
  method_id: string;
  method_title: string;
  method_description: (shippingCost?: number) => string | ReactNode;
};

export type LineItem = {
  id: number;
  name: string;
  product_id: number;
  variation_id?: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes?: any[];
  meta_data: {
    id: number;
    key: string;
    value: string;
    display_key: string;
    display_value: string;
  }[];
  sku: string;
  price: number;
  image: {
    id: string;
    src: string;
  };
  parent_name?: null | string;
};

export type PaymentIntentRequest = {
  wc_order_key: string;
  payment_method: string;
};

export type UpdatePaymentIntentRequest = {
  wc_order_key: string;
  payment_method: string;
};

export type PaymentIntentResponse = {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_details: {
    tip: any[]; // or specific type if known
  };
  amount_received: number;
  application: null | string;
  application_fee_amount: null | number;
  automatic_payment_methods: {
    allow_redirects: string;
    enabled: boolean;
  };
  canceled_at: null | number;
  cancellation_reason: null | string;
  capture_method: string;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: null | string;
  description: string;
  invoice: null | string;
  last_payment_error: null | string;
  latest_charge: null | string;
  livemode: boolean;
  metadata: any[]; // or specific type if known
  next_action: null | any; // or specific type if known
  on_behalf_of: null | string;
  payment_method: null | string;
  payment_method_configuration_details: null | any; // or specific type if known
  payment_method_options: {
    card: {
      installments: null | string;
      mandate_options: null | string;
      network: null | string;
      request_three_d_secure: string;
    };
  };
  payment_method_types: string[];
  processing: null | string;
  receipt_email: string;
  review: null | string;
  setup_future_usage: null | string;
  shipping: null | string;
  source: null | string;
  statement_descriptor: null | string;
  statement_descriptor_suffix: null | string;
  status: string;
  transfer_data: null | string;
  transfer_group: null | string;
};
export type OrderStatus = "pending" | "processing" | "on-hold" | "completed" | "cancelled" | "refunded" | "failed";
export type OrderFilters = {
  status?: OrderStatus | OrderStatus[] | string;
  orderby?: string;
  order?: string;
  page?: number;
  per_page?: number;
  parent?: number;
  customer?: number;
};

export type BankTransferAction = {
  display_bank_transfer_instructions: {
    amount_remaining: number;
    currency: string;
    financial_addresses: {
      iban: {
        account_holder_name: string;
        bic: string;
        country: string;
        iban: string;
      };
      supported_networks: string[];
      type: string;
    }[];
    hosted_instructions_url: string;
    reference: string;
    type: string;
  };
  type: "display_bank_transfer_instructions";
};

export type PaymentMethod = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export type PaymentMethodsResponse = {
  available_methods: PaymentMethod[];
};
