// Public build-time settings (see .env.example). Values are compiled into the client bundle: never secrets.
// Enquiries are emailed to the studio mailbox through FormSubmit unless VITE_ENQUIRY_ENDPOINT overrides it.
export const STUDIO_EMAIL = 'unfoundchapter@gmail.com';
export const ENQUIRY_ENDPOINT = (import.meta.env.VITE_ENQUIRY_ENDPOINT || `https://formsubmit.co/ajax/${STUDIO_EMAIL}`).trim();
export const ENQUIRY_EMAIL = (import.meta.env.VITE_ENQUIRY_EMAIL || STUDIO_EMAIL).trim();
