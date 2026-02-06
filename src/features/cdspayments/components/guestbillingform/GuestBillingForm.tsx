import { useState, useEffect } from "react";
import { useData } from "../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";

interface GuestBillingData {
  email: string;
  first_name: string;
  last_name: string;
  address_1?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  codice_fiscale?: string;
}

const GuestBillingForm = () => {
  const { order, setPaymentData, paymentMethod } = usePaymentStore();
  const data = useData();

  console.log("GuestBillingForm - order:", order);
  console.log("GuestBillingForm - order.email:", order?.email);
  console.log("GuestBillingForm - order.billing_email:", order?.billing_email);
  console.log("GuestBillingForm - order.billing_address:", order?.billing_address);

  // Extract email with correct priority
  const orderEmail = order?.email || order?.billing_email || order?.billing_address?.email || "";

  console.log("GuestBillingForm - orderEmail:", orderEmail);

  const [formData, setFormData] = useState<GuestBillingData>({
    email: orderEmail,
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    postcode: "",
    country: "IT",
    phone: "",
    codice_fiscale: "",
  });

  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update email when order loads or email changes
  useEffect(() => {
    console.log("GuestBillingForm useEffect - orderEmail:", orderEmail, "formData.email:", formData.email);
    if (orderEmail && orderEmail !== formData.email) {
      console.log("GuestBillingForm - Updating email to:", orderEmail);
      setFormData(prev => ({ ...prev, email: orderEmail }));
    }
  }, [orderEmail]);

  const handleChange = (field: keyof GuestBillingData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    // Basic validation (always required)
    if (!formData.email?.trim()) return "Email richiesta";
    if (!formData.first_name?.trim()) return "Nome richiesto";
    if (!formData.last_name?.trim()) return "Cognome richiesto";

    // Invoice validation (only if wants invoice)
    if (wantsInvoice) {
      if (!formData.address_1?.trim()) return "Indirizzo richiesto per fattura";
      if (!formData.city?.trim()) return "Città richiesta per fattura";
      if (!formData.postcode?.trim()) return "CAP richiesto per fattura";
      if (!/^\d{5}$/.test(formData.postcode)) return "CAP deve essere 5 cifre";
      if (!formData.phone?.trim()) return "Telefono richiesto per fattura";
      if (!formData.codice_fiscale?.trim()) return "Codice fiscale richiesto per fattura";
      if (formData.codice_fiscale.length !== 16) return "Codice fiscale deve essere 16 caratteri";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!order) {
      setError("Ordine non trovato");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Build billing data based on invoice requirement
      const billingData: any = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      // Add full billing info only if wants invoice
      if (wantsInvoice) {
        billingData.address_1 = formData.address_1;
        billingData.city = formData.city;
        billingData.postcode = formData.postcode;
        billingData.country = formData.country;
        billingData.phone = formData.phone;
        billingData.codice_fiscale = formData.codice_fiscale;
      }

      const updatedOrder = await data.updateCdsOrder(order.id, {
        billing: billingData,
        billing_email: formData.email,
      });

      // Preserve email and billing_address from current order
      const preservedEmail = (order as any).email || order.billing_email;
      const preservedBillingAddress = (order as any).billing_address || order.billing;

      if (preservedEmail) {
        (updatedOrder as any).email = preservedEmail;
        if (!updatedOrder.billing_email) {
          updatedOrder.billing_email = preservedEmail;
        }
      }

      if (preservedBillingAddress) {
        (updatedOrder as any).billing_address = preservedBillingAddress;
      }

      setPaymentData({
        order: updatedOrder,
        guestFormCompleted: true,
      });
    } catch (err) {
      setError("Errore durante il salvataggio dei dati");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-secondary pb-4">I tuoi dati</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              disabled={true}
              className="w-full px-3 py-2.5 border border-[#CDCFD3] bg-gray-50 text-[#808791] disabled:opacity-50 outline-none"
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                borderRadius: "12px",
              }}
              required
            />
          </div>

          {/* Nome e Cognome */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={handleChange("first_name")}
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 border border-[#CDCFD3] hover:border-primary focus:border-primary focus:border-2 bg-white text-[#808791] placeholder:text-[#808791] disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors"
                style={{
                  fontSize: "14px",
                  lineHeight: "1.5",
                  borderRadius: "12px",
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cognome *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={handleChange("last_name")}
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 border border-[#CDCFD3] hover:border-primary focus:border-primary focus:border-2 bg-white text-[#808791] placeholder:text-[#808791] disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors"
                style={{
                  fontSize: "14px",
                  lineHeight: "1.5",
                  borderRadius: "12px",
                }}
                required
              />
            </div>
          </div>

          {/* Checkbox Fattura */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                className={`${
                  wantsInvoice ? "bg-primary" : "bg-gray-300"
                } rounded-full border border-gray-300 px-3 cursor-pointer relative`}
                onClick={() => setWantsInvoice(!wantsInvoice)}
                disabled={isSubmitting}>
                <span
                  className={`block absolute rounded-full size-3 bg-white top-1/2 -translate-y-1/2 transition-all ${
                    wantsInvoice ? "right-0 -translate-x-full" : "left-0 translate-x-full"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Voglio la fattura
              </span>
            </label>
          </div>

          {/* Campi fattura (mostrati solo se checkbox attivo) */}
          {wantsInvoice && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indirizzo *
                </label>
                <input
                  type="text"
                  value={formData.address_1}
                  onChange={handleChange("address_1")}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 border border-[#CDCFD3] hover:border-primary focus:border-primary focus:border-2 bg-white text-[#808791] placeholder:text-[#808791] disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors"
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    borderRadius: "12px",
                  }}
                  required={wantsInvoice}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Città *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={handleChange("city")}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2.5 border border-[#CDCFD3] hover:border-primary focus:border-primary focus:border-2 bg-white text-[#808791] placeholder:text-[#808791] disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors"
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.5",
                      borderRadius: "12px",
                    }}
                    required={wantsInvoice}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CAP *
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={handleChange("postcode")}
                    disabled={isSubmitting}
                    maxLength={5}
                    className="w-full px-3 py-2.5 border border-[#CDCFD3] hover:border-primary focus:border-primary focus:border-2 bg-white text-[#808791] placeholder:text-[#808791] disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors"
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.5",
                      borderRadius: "12px",
                    }}
                    required={wantsInvoice}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 border border-[#CDCFD3] hover:border-primary focus:border-primary focus:border-2 bg-white text-[#808791] placeholder:text-[#808791] disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors"
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    borderRadius: "12px",
                  }}
                  required={wantsInvoice}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codice Fiscale *
                </label>
                <input
                  type="text"
                  value={formData.codice_fiscale}
                  onChange={handleChange("codice_fiscale")}
                  disabled={isSubmitting}
                  maxLength={16}
                  className="w-full px-3 py-2.5 border border-[#CDCFD3] hover:border-primary focus:border-primary focus:border-2 bg-white text-[#808791] placeholder:text-[#808791] disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-colors uppercase"
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    borderRadius: "12px",
                  }}
                  required={wantsInvoice}
                />
                <p className="text-xs text-gray-500 mt-1">16 caratteri alfanumerici</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`artpay-button-style w-full mt-6 py-3! ${
              paymentMethod === "klarna"
                ? "bg-klarna hover:bg-klarna-hover"
                : "bg-primary hover:bg-primary-hover"
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}>
            {isSubmitting ? "Salvataggio..." : "Continua"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default GuestBillingForm;