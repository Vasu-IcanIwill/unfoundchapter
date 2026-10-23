// Public build-time settings (see .env.example). Values are compiled into the client bundle: never secrets.
export const ENQUIRY_ENDPOINT = (import.meta.env.VITE_ENQUIRY_ENDPOINT || '').trim();
export const ENQUIRY_EMAIL = (import.meta.env.VITE_ENQUIRY_EMAIL || '').trim();
