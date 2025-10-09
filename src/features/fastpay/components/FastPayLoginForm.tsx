import { useState, FC } from "react";
import { Box, Button, Typography, TextField as MuiTextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";

export interface FastPayLoginFormData {
  username: string;
  password: string;
}

export interface FastPayLoginFormProps {
  onSubmit?: (data: FastPayLoginFormData) => Promise<{ error?: unknown }>;
  disabled?: boolean;
}

const FastPayLoginForm: FC<FastPayLoginFormProps> = ({
  onSubmit,
  disabled = false
}) => {
  const [error, setError] = useState<string | undefined>();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FastPayLoginFormData>({
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const handleSubmitClick = async (data: FastPayLoginFormData) => {
    setError(undefined);
    if (onSubmit) {
      const result = await onSubmit(data);
      if (result?.error) {
        const errorMessage = result.error instanceof Error
          ? result.error.message
          : "Nome utente o password errati";
        setError(errorMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitClick)}>
      <Box display="flex" flexDirection="column" gap={1.5} my={2}>
        <Controller
          name="username"
          control={control}
          rules={{ required: "Nome utente è richiesto" }}
          render={({ field }) => (
            <MuiTextField
              {...field}
              label="Nome utente"
              type="text"
              fullWidth
              error={!!errors?.username}
              helperText={errors?.username?.message}
              disabled={disabled}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          rules={{ required: "Password è richiesta" }}
          render={({ field }) => (
            <MuiTextField
              {...field}
              label="Password"
              type="password"
              fullWidth
              error={!!errors?.password}
              helperText={errors?.password?.message}
              disabled={disabled}
            />
          )}
        />
        {error && <Typography variant="body1" color="error" sx={{ mt: 0 }}>{error}</Typography>}
        <Button
          sx={{ mt: 2 }}
          type="submit"
          variant="contained"
          disabled={disabled}>
          Accedi
        </Button>
      </Box>
    </form>
  );
};

export default FastPayLoginForm;