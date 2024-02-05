import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button, Grid, TextField } from "@mui/material";

export interface PersonalDataFormData {
  first_name: string;
  last_name: string;
}
export interface PersonalDataFormProps {
  defaultValues?: PersonalDataFormData;
  onSubmit?: (formData: PersonalDataFormData) => Promise<void>;
  disabled?: boolean;
}

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ onSubmit, defaultValues, disabled = false }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDataFormData>({
    defaultValues: {
      ...defaultValues,
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit: SubmitHandler<PersonalDataFormData> = (data) => {
    if (onSubmit) {
      setIsSaving(true);
      onSubmit(data).then(() => {
        setIsSaving(false);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "Nome richiesto" }}
            render={({ field }) => (
              <TextField
                disabled={isSaving || disabled}
                label="Nome*"
                variant="outlined"
                fullWidth
                {...field}
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="last_name"
            control={control}
            rules={{ required: "Cognome richiesto" }}
            render={({ field }) => (
              <TextField
                disabled={isSaving || disabled}
                label="Cognome*"
                variant="outlined"
                fullWidth
                {...field}
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            sx={{ minWidth: "160px" }}
            disabled={isSaving || disabled}
            type="submit"
            variant="contained"
            color="primary">
            Salva
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default PersonalDataForm;
