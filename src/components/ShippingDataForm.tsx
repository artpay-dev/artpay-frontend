import React, { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  Autocomplete
} from "@mui/material";
import countries from "../countries";
import { ShippingData } from "../types/user.ts";
import comuni_italiani from "../comuni.json";

const province_italiane = [...new Set(comuni_italiani.map(comune => comune.provincia.nome))]

export interface UserDataFormProps {
  defaultValues?: ShippingData;
  onSubmit?: (formData: ShippingData) => Promise<void>;
  showEmail?: boolean;
  disabled?: boolean;
  className?: string;
}

const ShippingDataForm: React.FC<UserDataFormProps> = ({ defaultValues, onSubmit, showEmail, disabled = false, className = "" }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingData>({
    defaultValues: {
      ...defaultValues,
      country: defaultValues?.country || "IT",
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit: SubmitHandler<ShippingData> = (data) => {
    if (onSubmit) {
      setIsSaving(true);
      onSubmit(data).then(() => {
        setIsSaving(false);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={className}>
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

        {/*<Grid item xs={12} sm={6}>
          <Controller
            name="birth_date"
            control={control}
            rules={{ required: "Data di nascita richiesta" }}
            render={({ field }) => (
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.birth_date,
                    helperText: errors.birth_date?.message,
                  },
                }}
                label="Data di Nascita"
                {...field}
                onChange={(date: Date | null) => field.onChange(date)}
              />
            )}
          />
        </Grid>*/}

        <Grid item xs={12}>
          <Controller
            name="address_1"
            control={control}
            rules={{ required: "Indirizzo richiesto" }}
            render={({ field }) => (
              <TextField
                disabled={isSaving || disabled}
                label="Indirizzo* (linea 1: via/piazza,...)"
                variant="outlined"
                fullWidth
                {...field}
                error={!!errors.address_1}
                helperText={errors.address_1?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="address_2"
            control={control}
            render={({ field }) => (
              <TextField
                disabled={isSaving || disabled}
                label="Indirizzo (linea 2: scala, piano)"
                variant="outlined"
                fullWidth
                {...field}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="city"
            control={control}
            rules={{ required: "Città richiesta" }}
            render={({ field }) => (
              <Autocomplete
                options={comuni_italiani}
                getOptionLabel={(option) => option.nome}
                isOptionEqualToValue={(option, value) => option.nome === value.nome}
                onChange={(_, selectedOption) =>
                  field.onChange(selectedOption ? selectedOption.nome : "")
                }
                value={
                  comuni_italiani.find((comune) => comune.nome === field.value) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Città*"
                    variant="outlined"
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="postcode"
            control={control}
            rules={{ required: "CAP richiesto" }}
            render={({ field }) => (
              <TextField
                disabled={isSaving || disabled}
                label="CAP*"
                variant="outlined"
                fullWidth
                {...field}
                error={!!errors.postcode}
                helperText={errors.postcode?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.country}>
            <InputLabel id="country-label">Paese*</InputLabel>
            <Controller
              name="country"
              control={control}
              rules={{ required: "Paese richiesto" }}
              render={({ field }) => (
                <Select
                  disabled={isSaving || disabled}
                  labelId="country-label"
                  defaultValue="IT"
                  label="Paese"
                  {...field}>
                  {countries.map((country) => (
                    <MenuItem value={country.code} key={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.country && <FormHelperText>{errors.country.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="state"
            control={control}
            rules={{ required: "Provincia richiesta" }}
            render={({ field }) => (
              <Autocomplete
                options={province_italiane}
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value}
                onChange={(_, value) => field.onChange(value || "")}
                value={field.value || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Provincia*"
                    variant="outlined"
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            rules={{ required: "Telefono richiesto" }}
            render={({ field }) => (
              <TextField
                disabled={isSaving || disabled}
                label="Telefono*"
                variant="outlined"
                fullWidth
                {...field}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Grid>

        {showEmail && (
          <Grid item xs={12} sm={6}>
            <Controller
              name="email"
              control={control}
              rules={{ required: "Email richiesta" }}
              render={({ field }) => (
                <TextField
                  disabled={isSaving || disabled}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  {...field}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>
        )}

        {/*        <Grid item xs={12}>
          <Controller
            name="company"
            control={control}
            render={({ field }) => <TextField label="Azienda" variant="outlined" fullWidth {...field} />}
          />
        </Grid>*/}

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

export default ShippingDataForm;
