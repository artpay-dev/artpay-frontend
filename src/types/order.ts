export type OrderRequest = {
  customer_id: number;
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  line_items: LineItemRequest[];
};

export type LineItemRequest = {
  product_id: number;
  quantity: number;
};

export type Order = {
  id: number;
  parent_id: number;
  status: string;
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
  date_completed: null | string;
  date_paid: null | string;
  cart_hash: string;
  number: string;
  meta_data: {
    id: number;
    key: string;
    value: string;
  }[];
  line_items: LineItem[];
  tax_lines: any[];
  shipping_lines: any[];
  fee_lines: any[];
  coupon_lines: any[];
  refunds: any[];
  payment_url: string;
  is_editable: boolean;
  needs_payment: boolean;
  needs_processing: boolean;
  date_created_gmt: string;
  date_modified_gmt: string;
  date_completed_gmt: null | string;
  date_paid_gmt: null | string;
  currency_symbol: string;
  _links: {
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

export type LineItem = {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: any[];
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
  parent_name: null | string;
};

export type PaymentIntentRequest = {
  wc_order_key: string;
};

export type PaymentIntentResponse = {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_details: {
    tip: any[];
  };
  amount_received: number;
  application: null | any;
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
  customer: null | any;
  description: string;
  invoice: null | any;
  last_payment_error: null | any;
  latest_charge: null | any;
  livemode: boolean;
  metadata: any[];
  next_action: null | any;
  on_behalf_of: null | any;
  payment_method: null | any;
  payment_method_configuration_details: null | any;
  payment_method_options: {
    card: {
      installments: null | any;
      mandate_options: null | any;
      network: null | any;
      request_three_d_secure: string;
    };
  };
  payment_method_types: string[];
  processing: null | any;
  receipt_email: string;
  review: null | any;
  setup_future_usage: null | any;
  shipping: null | any;
  source: null | any;
  statement_descriptor: null | any;
  statement_descriptor_suffix: null | any;
  status: string;
  transfer_data: null | any;
  transfer_group: null | any;
};
