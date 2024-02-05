import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button, Grid } from "@mui/material";
import PasswordField from "./PasswordField.tsx";

export interface PasswordChangeFormData {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}
export interface PasswordChangeFormProps {
  onSubmit?: (formData: PasswordChangeFormData) => Promise<void>;
  disabled?: boolean;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onSubmit, disabled }) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    defaultValues: {
      newPassword: "",
      newPasswordConfirm: "",
      oldPassword: "",
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const newPassword = watch("newPassword");
  const handleFormSubmit: SubmitHandler<PasswordChangeFormData> = async (data) => {
    if (onSubmit) {
      setIsSaving(true);
      await onSubmit(data);
      setIsSaving(false);
    }
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="oldPassword"
            control={control}
            rules={{ required: "Password richiesta" }}
            render={({ field }) => (
              <PasswordField
                disabled={isSaving || disabled}
                label="Password*"
                variant="outlined"
                fullWidth
                {...field}
                error={!!errors.oldPassword}
                helperText={errors.oldPassword?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6} />
        <Grid item xs={12} md={6}>
          <Controller
            name="newPassword"
            control={control}
            rules={{
              required: "Nuova password richiesta",
              minLength: {
                value: 8,
                message: "La password deve avere almeno 8 caratteri",
              },
              maxLength: {
                value: 32,
                message: "La password deve avere massimo 32 caratteri",
              },
            }}
            render={({ field }) => (
              <PasswordField
                disabled={isSaving || disabled}
                label="Nuova password*"
                variant="outlined"
                fullWidth
                {...field}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="newPasswordConfirm"
            control={control}
            rules={{
              required: "Conferma nuova password richiesta",
              validate: (value) => value === newPassword || "Le password non coincidono",
            }}
            render={({ field }) => (
              <PasswordField
                disabled={isSaving || disabled}
                label="Conferma nuova password*"
                variant="outlined"
                fullWidth
                {...field}
                error={!!errors.newPasswordConfirm}
                helperText={errors.newPasswordConfirm?.message}
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
            Modifica password
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default PasswordChangeForm;
