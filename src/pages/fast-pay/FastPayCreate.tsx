import {
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  InputAdornment,
  Card,
  CardContent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { useState } from "react";
import OfferCard from "../../features/fastpay/components/offer-card/offer-card.tsx";
//import useProposalStore from "../../stores/proposalStore.tsx";

const FastPayCreate = () => {
  const [isComplete, setComplete] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    titolo: "",
    artista: "",
    descrizione: "",
    prezzo: "",
    sconto: "",
    immagine: null as File | null,
    hasScadenza: false,
    dataScadenza: null as Dayjs | null,
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      hasScadenza: event.target.checked,
      dataScadenza: event.target.checked ? prev.dataScadenza : null,
    }));
  };

  const handleDateChange = (date: Dayjs | null) => {
    setFormData((prev) => ({
      ...prev,
      dataScadenza: date,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      immagine: file,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setComplete(true);
    console.log(isComplete);
  };

  return (
    <>
      <h1 className={"text-4xl text-white mx-auto w-full max-w-lg px-8 font-light mb-12"}>Crea offerta</h1>
      <main className={` py-6 w-full  rounded-t-3xl bottom-0 bg-white max-w-lg mx-auto flex-1`}>
        {!isComplete && (
          <div className={"px-8"}>
            <div className={"flex items-center justify-between"}>
              <div className={"space-y-2"}>
                <h3 className={"text-2xl leading-6"}>Dettaglio offerta</h3>
                <h3 className={"text-secondary leading-6"}>Crea un'offerta</h3>
              </div>
            </div>
          </div>
        )}
        {isComplete ? (
          <>
            <section className={"flex flex-col px-8 py-12"}>
              <div className={"flex flex-col items-center gap-6"}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.2739 41.9177H15.7841C16.311 41.9177 16.75 42.1004 17.1013 42.4656L21.0308 46.345C22.0846 47.4117 23.0761 47.945 24.0054 47.945C24.9347 47.945 25.9263 47.4117 26.9801 46.345L30.8876 42.4656C31.2535 42.1004 31.6999 41.9177 32.2267 41.9177H37.7369C39.2444 41.9177 40.3274 41.5889 40.9859 40.9313C41.6445 40.2739 41.9739 39.1926 41.9739 37.6875V32.1864C41.9739 31.6895 42.1494 31.251 42.5006 30.8712L46.4082 26.948C47.4766 25.8958 48.0071 24.9095 47.9998 23.989C47.9926 23.0685 47.4621 22.0749 46.4082 21.0082L42.5006 17.0849C42.1494 16.705 41.9739 16.274 41.9739 15.7918V10.2904C41.9739 8.78542 41.6445 7.70049 40.9859 7.03567C40.3274 6.37082 39.2444 6.0384 37.7369 6.0384H32.2267C31.6999 6.0384 31.2535 5.86306 30.8876 5.51239L26.9801 1.63294C25.9118 0.537057 24.9165 -0.00723334 23.9944 7.25754e-05C23.0724 0.00737848 22.0772 0.551668 21.0089 1.63294L17.1013 5.51239C16.75 5.86306 16.311 6.0384 15.7841 6.0384H10.2739C8.76649 6.0384 7.68349 6.36717 7.02491 7.02471C6.36633 7.68224 6.03704 8.77081 6.03704 10.2904V15.7918C6.03704 16.274 5.8541 16.705 5.48822 17.0849L1.60256 21.0082C0.534186 22.0749 0 23.0685 0 23.989C0 24.9095 0.534186 25.8958 1.60256 26.948L5.48822 30.8712C5.8541 31.251 6.03704 31.6895 6.03704 32.1864V37.6875C6.03704 39.1926 6.36633 40.2739 7.02491 40.9313C7.68349 41.5889 8.76649 41.9177 10.2739 41.9177ZM21.6674 34.4217C21.4772 34.4217 21.3199 34.3889 21.1955 34.3232C21.0711 34.2575 20.943 34.1443 20.8113 33.9834L14.2254 26.3341C14.1523 26.232 14.0901 26.1224 14.0388 26.0053C13.9876 25.8885 13.962 25.7643 13.962 25.6328C13.962 25.3991 14.0425 25.2055 14.2035 25.0519C14.3645 24.8986 14.5547 24.8219 14.7743 24.8219C14.9353 24.8219 15.0743 24.8511 15.1914 24.9096C15.3084 24.968 15.4255 25.0703 15.5426 25.2164L21.6235 32.3176L32.6657 15.1343C32.8853 14.8274 33.1341 14.674 33.4123 14.674C33.6171 14.674 33.8074 14.7507 33.983 14.9041C34.1587 15.0576 34.2465 15.2439 34.2465 15.463C34.2465 15.5653 34.2245 15.6712 34.1806 15.7808C34.1367 15.8904 34.0928 15.989 34.0489 16.0767L22.5017 33.9834C22.3846 34.1296 22.2565 34.2392 22.1175 34.3122C21.9784 34.3852 21.8284 34.4217 21.6674 34.4217Z" fill="#42B396"/>
                </svg>
                <p className={'text-2xl text-center'}>La tua offerta è stata creata con successo.</p>
              </div>
              <ul className={'flex flex-col gap-6 mt-4 px-8'}>
                <OfferCard sharingButton/>
              </ul>

            </section>
          </>
        ) : (
          <section className={"px-8 py-12"}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Titolo Opera"
                  value={formData.titolo}
                  onChange={handleInputChange("titolo")}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, height: 48 } }}
                />

                <TextField
                  fullWidth
                  label="Artista"
                  value={formData.artista}
                  onChange={handleInputChange("artista")}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, height: 48 } }}
                />

                <TextField
                  fullWidth
                  label="Descrizione"
                  value={formData.descrizione}
                  onChange={handleInputChange("descrizione")}
                  variant="outlined"
                  multiline
                  rows={4}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRadius: 2,
                    height: 137,
                  }}>
                  <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                    <span className={"block leading-6 text-secondary"}>
                      {formData.immagine ? formData.immagine.name : "Foto(JPG, PNG, PDF)"}
                    </span>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="image-upload"
                      type="file"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="image-upload">
                      <Typography component="span" sx={{ ml: 1 }} className={"text-primary"}>
                        {formData.immagine ? "Aggiorna" : "Carica immagine"}
                      </Typography>
                    </label>
                  </CardContent>
                </Card>

                <TextField
                  fullWidth
                  label="Prezzo Opera"
                  value={formData.prezzo}
                  onChange={handleInputChange("prezzo")}
                  variant="outlined"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, height: 48 } }}
                />

                <TextField
                  fullWidth
                  label="Sconto"
                  value={formData.sconto}
                  onChange={handleInputChange("sconto")}
                  variant="outlined"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, height: 48, paddingRight: 2 } }}
                />

                <FormControlLabel
                  control={<Switch checked={formData.hasScadenza} onChange={handleSwitchChange} color="primary" />}
                  label="Aggiungi scadenza offerta"
                />

                {formData.hasScadenza && (
                  <DatePicker
                    label="Data di scadenza"
                    value={formData.dataScadenza}
                    onChange={handleDateChange}
                    slots={{
                      textField: TextField,
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { "& .MuiOutlinedInput-root": { borderRadius: 2, height: 48 } },
                      },
                    }}
                  />
                )}

                <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} type="submit">
                  Salva offerta
                </Button>
              </Box>
            </LocalizationProvider>
          </section>
        )}
      </main>
    </>
  );
};

export default FastPayCreate;
