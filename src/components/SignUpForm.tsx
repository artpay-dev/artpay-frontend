import React, { useState } from "react";
import TextField from "./TextField.tsx";
import PasswordField from "./PasswordField.tsx";
import { Box, Button, Link, Typography, useTheme } from "@mui/material";
import Checkbox from "./Checkbox.tsx";
import { FormField } from "../types";
import { useForm } from "react-hook-form";
import { AxiosError, isAxiosError } from "axios";

interface SignUpFormContent {
  fields: {
    username: FormField;
    first_name: FormField;
    last_name: FormField;
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
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  privacy: undefined;
}

export interface SignUpFormProps {
  disabled?: boolean;
  onSubmit?: (data: SignUpFormData) => Promise<void>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, disabled }) => {
  const theme = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const registrationFormContent: SignUpFormContent = {
    fields: {
      username: { label: "Username" },
      first_name: {label: "Nome"},
      last_name: {label: "Cognome"},
      email: { label: "Email" },
      password: { label: "Password" }
    },
    passwordRequirements:
      "La password dovrebbe essere composta da almeno 8 caratteri e una combinazione di almeno i seguenti elementi: lettere maiuscole (A-Z), lettere minuscole (a-z), numeri (0-9), caratteri speciali (come !, @, %)",
    privacyLabel:
      "La tua privacy è importante per noi. Qui trovi l’informativa sulla privacy che spiega come raccogliamo, utilizziamo e proteggiamo le tue informazioni personali.",
    privacyDescription: "",
    buttonLabel: "Registrati"
  };
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    //handleSubmit
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      privacy: undefined
    } as SignUpFormData
  });

  const handleSubmitClick = async (data: SignUpFormData) => {
    if (onSubmit) {
      setSubmitError(null);
      try {
        await onSubmit(data);
      } catch (e) {
        if (isAxiosError(e)) {
          setSubmitError((e as AxiosError).message);
        } else {
          setSubmitError(e?.toString ? e.toString() : "Si è verificato un errore");
        }
        return;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitClick)}>
      <Box display="flex" flexDirection="column" gap={1.5} my={2}>
        <TextField
          label={registrationFormContent.fields.username.label}
          {...register("username", { required: "Inserisci uno username" })}
          error={!!errors?.username}
          helperText={errors?.username?.message}
          disabled={disabled}
        />
        <TextField
          label={registrationFormContent.fields.first_name.label}
          {...register("first_name", { required: "Inserisci il nome" })}
          error={!!errors?.first_name}
          helperText={errors?.first_name?.message}
          disabled={disabled}
        />
        <TextField
          label={registrationFormContent.fields.last_name.label}
          {...register("last_name", { required: "Inserisci il Cognome" })}
          error={!!errors?.last_name}
          helperText={errors?.last_name?.message}
          disabled={disabled}
        />
        <TextField
          label={registrationFormContent.fields.email.label}
          {...register("email", { required: "Inserisci una email valida" })}
          error={!!errors?.email}
          helperText={errors?.email?.message}
          disabled={disabled}
        />
        <PasswordField
          label={registrationFormContent.fields.password.label}
          {...register("password", {
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
          })}
          error={!!errors?.password}
          helperText={errors?.password?.message}
          disabled={disabled}
        />
        <Typography
          variant="caption"
          color={
            (!!errors?.password && errors?.password?.type && errors?.password?.type !== "required") ? "error" : "textSecondary"
          }
          sx={{ pb: 1 }}>
          {registrationFormContent.passwordRequirements}
        </Typography>
        <Checkbox
          alignTop
          size="small"
          label={<>Accetto <Link
            sx={{ color: errors.privacy ? theme.palette.error.main : theme.palette.text.primary }} target="_blank"
            href="/termini-e-condizioni">termini e condizioni d'uso</Link> e
            dichiaro di
            aver letto <Link sx={{ color: errors.privacy ? theme.palette.error.main : theme.palette.text.primary }}
                             target="_blank" href="https://www.iubenda.com/privacy-policy/71113702">l'Informativa sul
              trattamento dei miei dati personali</Link></>}
          error={!!errors?.privacy}
          disabled={disabled}
          {...register("privacy", { required: true })}
        />
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
