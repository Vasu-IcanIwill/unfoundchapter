/**
 * Country calling codes for the enquiry form, with the number of digits a mobile number has after the code
 * (national significant number). India first, then alphabetical.
 */
export const COUNTRIES = [
  ['IN', 'India', '91', 10, 10],
  ['AU', 'Australia', '61', 9, 9],
  ['BH', 'Bahrain', '973', 8, 8],
  ['BD', 'Bangladesh', '880', 10, 10],
  ['CA', 'Canada', '1', 10, 10],
  ['CN', 'China', '86', 11, 11],
  ['FR', 'France', '33', 9, 9],
  ['DE', 'Germany', '49', 10, 11],
  ['HK', 'Hong Kong', '852', 8, 8],
  ['ID', 'Indonesia', '62', 9, 12],
  ['IE', 'Ireland', '353', 9, 9],
  ['IT', 'Italy', '39', 9, 10],
  ['JP', 'Japan', '81', 10, 10],
  ['KE', 'Kenya', '254', 9, 9],
  ['KW', 'Kuwait', '965', 8, 8],
  ['MY', 'Malaysia', '60', 9, 10],
  ['MU', 'Mauritius', '230', 8, 8],
  ['NP', 'Nepal', '977', 10, 10],
  ['NL', 'Netherlands', '31', 9, 9],
  ['NZ', 'New Zealand', '64', 8, 10],
  ['OM', 'Oman', '968', 8, 8],
  ['QA', 'Qatar', '974', 8, 8],
  ['SA', 'Saudi Arabia', '966', 9, 9],
  ['SG', 'Singapore', '65', 8, 8],
  ['ZA', 'South Africa', '27', 9, 9],
  ['ES', 'Spain', '34', 9, 9],
  ['LK', 'Sri Lanka', '94', 9, 9],
  ['CH', 'Switzerland', '41', 9, 9],
  ['TH', 'Thailand', '66', 9, 9],
  ['AE', 'United Arab Emirates', '971', 9, 9],
  ['GB', 'United Kingdom', '44', 10, 10],
  ['US', 'United States', '1', 10, 10],
].map(([iso, name, dial, min, max]) => ({ iso, name, dial, min, max }));

export const countryOf = (iso) => COUNTRIES.find((c) => c.iso === iso) || COUNTRIES[0];
export const digitsHint = (c) => (c.min === c.max ? `${c.min} digits` : `${c.min} to ${c.max} digits`);
export const phoneError = (c) => (c.min === c.max
  ? `Enter the ${c.min}-digit number for ${c.name} (+${c.dial}).`
  : `Enter ${c.min} to ${c.max} digits for ${c.name} (+${c.dial}).`);
/** Digits only; a leading trunk 0 is dropped (not for Italy, where numbers can start with 0). */
export const cleanPhone = (raw, c) => {
  let v = String(raw).replace(/\D+/g, '');
  if (c.iso !== 'IT') v = v.replace(/^0+/, '');
  return v.slice(0, c.max);
};
