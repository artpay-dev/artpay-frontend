import React, { useState } from "react";
import TextField from "./TextField.tsx";
import PasswordField from "./PasswordField.tsx";
import { Box, Button, Typography } from "@mui/material";
import Checkbox from "./Checkbox.tsx";
import { FormField } from "../types";
import { useForm } from "react-hook-form";

interface SignUpFormContent {
  fields: {
    username: FormField;
    email: FormField;
    password: FormField;
  };
  passwordRequirements: string;
  privacyLabel: string;
  privacyDescription: string;
  buttonLabel: string;
}

export interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  privacy: undefined;
}

export interface SignUpFormProps {
  disabled?: boolean;
  onSubmit?: (data: SignUpFormData) => Promise<void>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, disabled }) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const registrationFormContent: SignUpFormContent = {
    fields: {
      username: { label: "Nome" },
      email: { label: "Email" },
      password: { label: "Password" },
    },
    passwordRequirements:
      "La password dovrebbe essere composta da almeno 12 caratteri e una combinazione di almeno i seguenti elementi: lettere maiuscole (A-Z), lettere minuscole (a-z), numeri (0-9), caratteri speciali (come !, @, #, $, %, ecc.)",
    privacyLabel:
      "La tua privacy è importante per noi. Qui trovi l’informativa sulla privacy che spiega come raccogliamo, utilizziamo e proteggiamo le tue informazioni personali.",
    privacyDescription: "",
    buttonLabel: "Registrati",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    //handleSubmit
    defaultValues: {
      username: "",
      email: "",
      password: "",
      privacy: undefined,
    } as SignUpFormData,
  });

  const handleSubmitClick = async (data: SignUpFormData) => {
    if (onSubmit) {
      setSubmitError(null);
      try {
        await onSubmit(data);
      } catch (e) {
        setSubmitError(e.toString());
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitClick)}>
      <Box display="flex" flexDirection="column" gap={1.5} my={2}>
        <TextField
          label={registrationFormContent.fields.username.label}
          {...register("username", { required: true })}
          error={!!errors?.username}
          helperText={errors?.username?.message}
          disabled={disabled}
        />
        <TextField
          label={registrationFormContent.fields.email.label}
          {...register("email", { required: true })}
          error={!!errors?.email}
          helperText={errors?.email?.message}
          disabled={disabled}
        />
        <PasswordField
          label={registrationFormContent.fields.password.label}
          {...register("password", { required: true, minLength: 12 })}
          error={!!errors?.password}
          helperText={errors?.email?.message}
          disabled={disabled}
        />
        <Typography
          variant="caption"
          color={
            errors?.password?.type === "minLength" ? "error" : "textSecondary"
          }
          sx={{ pb: 1 }}>
          {registrationFormContent.passwordRequirements}
        </Typography>
        <Checkbox
          alignTop
          label={registrationFormContent.privacyLabel}
          error={!!errors?.privacy}
          disabled={disabled}
          {...register("privacy", { required: true })}
        />
        <Typography variant="body2" color="textSecondary">
          {registrationFormContent.privacyDescription}
        </Typography>
        {submitError && (
          <Typography variant="body2" color="error">
            {submitError}
          </Typography>
        )}
        <Button
          sx={{ mt: 2 }}
          type="submit"
          variant="contained"
          disabled={disabled}>
          {registrationFormContent.buttonLabel}
        </Button>
      </Box>
    </form>
  );
};

export default SignUpForm;
