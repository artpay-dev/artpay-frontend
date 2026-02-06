import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import type { GuestBillingData } from "../types.ts";
import { validateGuestForm } from "../utils/validation.ts";
import { DEFAULT_COUNTRY, FORM_FIELDS } from "../utils/constants.ts";

interface GuestBillingFormProps {
  onSubmit: (data: GuestBillingData) => Promise<void>;
  initialData?: GuestBillingData | null;
  disabled?: boolean;
}

const GuestBillingForm = ({ onSubmit, initialData, disabled }: GuestBillingFormProps) => {
  const [formData, setFormData] = useState<GuestBillingData>({
    email: initialData?.email || "",
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    address_1: initialData?.address_1 || "",
    city: initialData?.city || "",
    postcode: initialData?.postcode || "",
    country: initialData?.country || DEFAULT_COUNTRY,
    phone: initialData?.phone || "",
    codice_fiscale: initialData?.codice_fiscale || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof GuestBillingData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateGuestForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError("Errore durante il salvataggio dei dati");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 600,
        width: "100%",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Dati di fatturazione
      </Typography>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <TextField
        label="Email *"
        type="email"
        value={formData.email}
        onChange={handleChange(FORM_FIELDS.EMAIL)}
        disabled={disabled || isSubmitting}
        fullWidth
        required
      />

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <TextField
          label="Nome *"
          value={formData.first_name}
          onChange={handleChange(FORM_FIELDS.FIRST_NAME)}
          disabled={disabled || isSubmitting}
          fullWidth
          required
        />

        <TextField
          label="Cognome *"
          value={formData.last_name}
          onChange={handleChange(FORM_FIELDS.LAST_NAME)}
          disabled={disabled || isSubmitting}
          fullWidth
          required
        />
      </Box>

      <TextField
        label="Indirizzo *"
        value={formData.address_1}
        onChange={handleChange(FORM_FIELDS.ADDRESS_1)}
        disabled={disabled || isSubmitting}
        fullWidth
        required
      />

      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
        <TextField
          label="Città *"
          value={formData.city}
          onChange={handleChange(FORM_FIELDS.CITY)}
          disabled={disabled || isSubmitting}
          fullWidth
          required
        />

        <TextField
          label="CAP *"
          value={formData.postcode}
          onChange={handleChange(FORM_FIELDS.POSTCODE)}
          disabled={disabled || isSubmitting}
          fullWidth
          required
          inputProps={{ maxLength: 5 }}
        />
      </Box>

      <TextField
        label="Paese *"
        value={formData.country}
        onChange={handleChange(FORM_FIELDS.COUNTRY)}
        disabled={disabled || isSubmitting}
        fullWidth
        required
        helperText="Codice ISO a 2 lettere (es. IT)"
      />

      <TextField
        label="Telefono *"
        type="tel"
        value={formData.phone}
        onChange={handleChange(FORM_FIELDS.PHONE)}
        disabled={disabled || isSubmitting}
        fullWidth
        required
      />

      <TextField
        label="Codice Fiscale *"
        value={formData.codice_fiscale}
        onChange={handleChange(FORM_FIELDS.CODICE_FISCALE)}
        disabled={disabled || isSubmitting}
        fullWidth
        required
        inputProps={{ maxLength: 16, style: { textTransform: "uppercase" } }}
        helperText="16 caratteri alfanumerici"
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={disabled || isSubmitting}
        sx={{ mt: 2 }}
      >
        {isSubmitting ? "Salvataggio..." : "Continua"}
      </Button>
    </Box>
  );
};

export default GuestBillingForm;