import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button, Grid, GridProps } from "@mui/material";
import PasswordField from "./PasswordField.tsx";

export interface PasswordChangeFormData {
  oldPassword?: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface PasswordChangeFormProps {
  onSubmit?: (formData: PasswordChangeFormData) => Promise<void>;
  askOldPassword?: boolean;
  oneColumn?: boolean;
  disabled?: boolean;
  sx?: GridProps["sx"];
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
                                                                 onSubmit,
                                                                 disabled,
                                                                 askOldPassword = false,
                                                                 oneColumn = false,
                                                                 sx
                                                               }) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<PasswordChangeFormData>({
    defaultValues: {
      newPassword: "",
      newPasswordConfirm: "",
      oldPassword: ""
    }
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

  const colWidthMd = oneColumn ? 12 : 6;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid container spacing={3} sx={sx}>
        {askOldPassword && <>
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
        </>}

        <Grid item xs={12} md={colWidthMd}>
          <Controller
            name="newPassword"
            control={control}
            rules={{
              required: "Nuova password richiesta",
              minLength: {
                value: 8,
                message: "La password deve avere almeno 8 caratteri"
              },
              maxLength: {
                value: 50,
                message: "La password deve avere massimo 50 caratteri"
              },
              validate: {
                hasLetter: (value) => /[A-Za-z]/.test(value) || "La password deve contenere almeno una lettera",
                hasNumber: (value) => /\d/.test(value) || "La password deve contenere almeno un numero",
                hasSymbol: (value) =>
                  /[!@#%^*()_+\-=[\]{};':"\\|,.<>/?]+/.test(value) || "La password deve contenere almeno un simbolo",
                noDisallowedChars: (value) =>
                  !/[$&#<>]/.test(value) || "La password non deve contenere i caratteri: $, &, #, <, >"
              }
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
        <Grid item xs={12} md={colWidthMd}>
          <Controller
            name="newPasswordConfirm"
            control={control}
            rules={{
              required: "Conferma nuova password richiesta",
              validate: (value) => value === newPassword || "Le password non coincidono"
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
