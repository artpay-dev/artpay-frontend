/**
 * Klarna payment method constants
 */
export const KLARNA_MAX_LIMIT = 2500; // €2,500
export const KLARNA_FEE_RATE = 0.05; // 5%
export const KLARNA_FEE_MULTIPLIER = 1.05; // 1 + 5%

/**
 * Artpay fee constants
 */
export const ARTPAY_FEE_RATE = 0.04; // 4%

/**
 * Payment method values
 */
export const PAYMENT_METHODS = {
  CARD: "card",
  KLARNA: "klarna",
} as const;

/**
 * Order status values
 */
export const ORDER_STATUS = {
  COMPLETED: "completed",
  FAILED: "failed",
  ON_HOLD: "on-hold",
  PROCESSING: "processing",
} as const;

/**
 * Italian default country code
 */
export const DEFAULT_COUNTRY = "IT";

/**
 * Form field names
 */
export const FORM_FIELDS = {
  EMAIL: "email",
  FIRST_NAME: "first_name",
  LAST_NAME: "last_name",
  ADDRESS_1: "address_1",
  CITY: "city",
  POSTCODE: "postcode",
  COUNTRY: "country",
  PHONE: "phone",
  CODICE_FISCALE: "codice_fiscale",
} as const;