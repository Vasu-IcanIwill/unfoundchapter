// Public build-time settings (see .env.example). Values are compiled into the client bundle: never secrets.
// Enquiries are emailed to the studio mailbox through FormSubmit unless VITE_ENQUIRY_ENDPOINT overrides it.
export const STUDIO_EMAIL = 'unfoundchapter@gmail.com';
export const ENQUIRY_ENDPOINT = (import.meta.env.VITE_ENQUIRY_ENDPOINT || `https://formsubmit.co/ajax/${STUDIO_EMAIL}`).trim();
export const ENQUIRY_EMAIL = (import.meta.env.VITE_ENQUIRY_EMAIL || STUDIO_EMAIL).trim();


// Web3Forms (web3forms.com) sends enquiries when its access key is set here. The access key is designed to be
// public (it only lets the site send to the inbox it was issued for), so it can live in the client bundle.
// While it is empty, enquiries go through FormSubmit as before.
export const WEB3FORMS_KEY = (import.meta.env.VITE_WEB3FORMS_KEY || '').trim();
