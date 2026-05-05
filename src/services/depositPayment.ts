/**
 * ArtPay Deposit Payment API Service
 * Handles API calls for deposit + balance payment flow
 */

const BASE_URL = 'https://staging-api.artpay.art/wp-json/adp/v1';

export interface Product {
  product_id: number;
  quantity: number;
  variation_id?: number;
}

export interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
  address_2?: string;
  state?: string;
}

export interface PrepareDepositRequest {
  products: Product[];
  billing_address?: Address;
  shipping_address?: Address;
  deposit_type: 'percentage' | 'fixed';
  deposit_value: number;
}

export interface PrepareDepositResponse {
  success: boolean;
  data: {
    order_id: number;
    order_key: string;
    total: number;
    deposit_amount: number;
    balance_amount: number;
    currency: string;
    client_secret: string;
    stripe_publishable_key: string;
    test_mode: boolean;
  };
  message?: string;
}

export interface PayBalanceRequest {
  order_id: number;
}

export interface PayBalanceResponse {
  success: boolean;
  data: {
    order_id: number;
    balance_amount: number;
    currency: string;
    client_secret: string;
    stripe_publishable_key: string;
    test_mode: boolean;
  };
  message?: string;
}

export interface PaymentStatus {
  order_id: number;
  order_status: string;
  order_total: number;
  currency: string;
  deposit: {
    type: string;
    value: number;
    amount: number;
    status: string;
    paid_at: string | null;
    payment_intent_id: string | null;
    transaction_id: string | null;
  };
  balance: {
    amount: number;
    status: string;
    paid_at: string | null;
    due_date: string | null;
    payment_intent_id: string | null;
    transaction_id: string | null;
  };
  created_at: string;
  modified_at: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: PaymentStatus;
  message?: string;
}


const getWcCredentials = ({ consumer_key, consumer_secret }: { consumer_key: string; consumer_secret: string }) => {
  const wcCredentials = btoa(`${consumer_key}:${consumer_secret}`);
  return "Basic " + wcCredentials;
};

/**
 * Gets WooCommerce authorization header from localStorage
 */
const getAuthHeader = () => {
  try {
    const userData = localStorage.getItem('artpay-user');

    if (!userData) {
      console.warn('User not authenticated - artpay-user not found in localStorage');
      return '';
    }

    const user = JSON.parse(userData);
    const consumerKey = user.wc_api_user_keys.consumer_key;
    const consumerSecret = user.wc_api_user_keys.consumer_secret;

    if (!consumerKey || !consumerSecret) {
      console.warn('WooCommerce credentials not found in user data');
      return '';
    }

    return getWcCredentials({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    });
  } catch (error) {
    console.error('Error reading WooCommerce credentials from localStorage:', error);
    return '';
  }
};

/**
 * Prepares a deposit payment
 * Creates a WooCommerce order and returns Stripe Payment Intent for the deposit
 */
export async function prepareDeposit(data: PrepareDepositRequest): Promise<PrepareDepositResponse> {
  const authHeader = getAuthHeader();

  const response = await fetch(`${BASE_URL}/deposit/prepare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader && { 'Authorization': authHeader }),
    },
    // Important for WordPress cookies
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to prepare deposit');
  }

  return response.json();
}

/**
 * Creates a Payment Intent for paying the balance
 */
export async function payBalance(data: PayBalanceRequest): Promise<PayBalanceResponse> {
  const authHeader = getAuthHeader();

  const response = await fetch(`${BASE_URL}/balance/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader && { 'Authorization': authHeader }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create balance payment');
  }

  return response.json();
}

/**
 * Gets the payment status for an order
 */
export async function getPaymentStatus(orderId: number): Promise<PaymentStatusResponse> {
  const authHeader = getAuthHeader();

  const response = await fetch(`${BASE_URL}/payment/status/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader && { 'Authorization': authHeader }),
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get payment status');
  }

  return response.json();
}