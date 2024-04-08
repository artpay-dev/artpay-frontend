import React, { useState } from "react";
import TextField from "./TextField.tsx";
import { Box, Button, Typography } from "@mui/material";
import { FormField } from "../types";
import { useForm } from "react-hook-form";
import LinkButton from "./LinkButton.tsx";
import PasswordField from "./PasswordField.tsx";

interface SignInFormContent {
  fields: {
    password: FormField;
    email: FormField;
  };
  buttonLabel: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignInFormProps {
  onSubmit?: (data: SignInFormData) => Promise<{ error?: unknown }>;
  disabled?: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({
                                                 onSubmit,
                                                 disabled = false
                                               }) => {
  const registrationFormContent: SignInFormContent = {
    fields: {
      email: { label: "Email" },
      password: { label: "Password" }
    },
    buttonLabel: "Accedi"
  };
  const [error, setError] = useState<string | undefined>();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    //handleSubmit
    defaultValues: {
      name: "",
      email: "",
      password: "",
      privacy: undefined
    } as SignInFormData
  });

  const handleSubmitClick = async (data: SignInFormData) => {
    setError(undefined);
    if (onSubmit) {
      const { error } = await onSubmit(data);
      if (error) {
        setError("Nome utente o password errati");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitClick)}>
      <Box display="flex" flexDirection="column" gap={1.5} my={2}>
        <TextField
          label={registrationFormContent.fields.email.label}
          type="email"
          {...register("email", { required: true })}
          error={!!errors?.email}
          helperText={errors?.email?.message}
          disabled={disabled}
        />
        <PasswordField
          label={registrationFormContent.fields.password.label}
          {...register("password", { required: true })}
          error={!!errors?.password}
          helperText={errors?.email?.message}
          disabled={disabled}
        />
        {error && <Typography variant="body1" color="error" sx={{ mt: 0 }}>{error}</Typography>}
        <LinkButton sx={{ alignSelf: "flex-start" }} href="/recupero-password" size="small">
          Hai perso la password?
        </LinkButton>
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

export default SignInForm;
