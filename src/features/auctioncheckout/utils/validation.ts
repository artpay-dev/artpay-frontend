import { GuestBillingData } from "../types.ts";

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates Italian postcode (5 digits)
 */
export const validateItalianPostcode = (postcode: string): boolean => {
  const postcodeRegex = /^\d{5}$/;
  return postcodeRegex.test(postcode);
};

/**
 * Validates Italian codice fiscale format (basic check)
 * Full validation is complex, this checks length and alphanumeric
 */
export const validateCodiceFiscale = (cf: string): boolean => {
  if (!cf || cf.length !== 16) return false;
  const cfRegex = /^[A-Z0-9]{16}$/i;
  return cfRegex.test(cf);
};

/**
 * Validates phone number (basic check)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Must have at least 8 digits
  return cleaned.length >= 8 && /^\+?\d+$/.test(cleaned);
};

/**
 * Validates all guest form fields
 * Returns error message if invalid, null if valid
 */
export const validateGuestForm = (data: Partial<GuestBillingData>): string | null => {
  if (!data.email?.trim()) {
    return "Email richiesta";
  }
  if (!validateEmail(data.email)) {
    return "Email non valida";
  }

  if (!data.first_name?.trim()) {
    return "Nome richiesto";
  }

  if (!data.last_name?.trim()) {
    return "Cognome richiesto";
  }

  if (!data.address_1?.trim()) {
    return "Indirizzo richiesto";
  }

  if (!data.city?.trim()) {
    return "Città richiesta";
  }

  if (!data.postcode?.trim()) {
    return "CAP richiesto";
  }
  if (!validateItalianPostcode(data.postcode)) {
    return "CAP non valido (deve essere 5 cifre)";
  }

  if (!data.country?.trim()) {
    return "Paese richiesto";
  }

  if (!data.phone?.trim()) {
    return "Telefono richiesto";
  }
  if (!validatePhone(data.phone)) {
    return "Telefono non valido";
  }

  if (!data.codice_fiscale?.trim()) {
    return "Codice fiscale richiesto";
  }
  if (!validateCodiceFiscale(data.codice_fiscale)) {
    return "Codice fiscale non valido (deve essere 16 caratteri alfanumerici)";
  }

  return null; // Valid
};