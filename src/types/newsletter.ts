export type NewsletterFormState = "new" | "saving" | "success" | "error"

export interface NewsletterFormData {
  email: string;
  optIn: boolean;
}

export const BREVO_FORM_URL = "https://51f5628d.sibforms.com/serve/MUIFAN4KP2y3Y9vz_T41Gc0CugsmkqAXuhJK3fC-GYZ-WZXkEUZ4rpVu9hAoVm4oy64NloGZplSZNeWnFK-DWXmG3bw6ktECUW3rH0bEoIws0c6F7b_jQEZFEt5OIjUpMrPkmBlb4bWDCam7fCEU-5PQEIEIp5DEdhfVXGUNiuqbe_q0COT3_41l652wAjYIVhDbT3DdkNCFHxoD";