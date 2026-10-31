// Terms and privacy text, as supplied by the business on 26 October 2026.
export const UPDATED_NOTE = 'Last updated: 26 October 2026';
export const PRIVACY_NOTE = 'Last updated: 30 October 2026';

const ADDRESS = 'Room-1, 7-H-23, Indira Gandhi Nagar, Sector 7, Jagatpura, Jaipur, Rajasthan 302017';

export const TERMS = [
  { id: 'about', h: '1. About these terms', ps: [`Journeys are arranged by Unfound Chapter, a brand of Bitmartian Softech Private Limited (GSTIN 08AALCB9623J1Z8, principal place of business: ${ADDRESS}). By paying a deposit you agree to these terms.`] },
  { id: 'prices', h: '2. Prices and GST', ps: ['Prices are per guest in Indian rupees unless your written quote says otherwise. GST is charged as applicable and shown on your invoice. Inclusions and exclusions are listed in your written itinerary and confirmation.'] },
  { id: 'booking', h: '3. Booking and payment', ps: [[
    'Your place is confirmed when we receive 30% of the journey cost and send you written confirmation.',
    'The balance of 70% is due 14 days before departure. For Dev Deepawali in Varanasi 2026, the balance is due by 9 November 2026.',
    'If you book within 14 days of departure, the full amount is due at booking.',
    'If the balance does not arrive on time, we may treat the booking as cancelled by you and the charges below apply.',
    'Payment is by bank transfer or UPI. Details are sent with your confirmation.',
  ]] },
  { id: 'cancelling', h: '4. Cancelling', ps: [
    'Tell us in writing at hello@unfoundchapter.com or by WhatsApp. Charges are a percentage of the total journey cost, counted from the day we receive your notice:',
    ['30 days or more before departure: 20%', '15 to 29 days: 50%', '8 to 14 days: 75%', '7 days or fewer, or no-show: 100%'],
    'Anything you have paid above the charge is refunded within 10 working days by the same method. If a journey includes costs that cannot be refunded, your written confirmation says so and takes precedence.',
  ] },
  { id: 'transfer', h: '5. Transferring your place', ps: ['You may transfer your place to another guest up to 7 days before departure at no charge from us, if hotels and other providers accept the change. Any extra cost they charge is passed on.'] },
  { id: 'changes', h: '6. Changes and cancellations by us', ps: ['If we need to change part of a journey, we will offer a comparable alternative or refund the affected part. If we cancel a departure, for example because the minimum group size is not reached, we will tell you at least 7 days before departure and refund everything you have paid.'] },
  { id: 'control', h: '7. Things outside our control', ps: ['Weather, strikes, government orders and crowd or security restrictions around festival nights can change plans. We will adjust where we can and refund unused services where our providers refund us.'] },
  { id: 'documents', h: '8. Travel documents, health and insurance', ps: ['You are responsible for valid identification and any documents your journey needs. We strongly recommend travel insurance covering cancellation, medical care and belongings.'] },
  { id: 'conduct', h: '9. Conduct', ps: ["Please respect religious sites, local rules and your guide's instructions. If someone's behaviour puts the group's safety at risk, we may ask them to step out of an activity without refund."] },
  { id: 'liability', h: '10. Our responsibility', ps: ['We choose hotels, transport and guides with care, but they are independent providers. Our liability for any claim is limited to the amount you paid us for the affected service, except where the law does not allow such a limit.'] },
  { id: 'law', h: '11. Governing law', ps: ['These terms are governed by the laws of India. Courts at Jaipur, Rajasthan have jurisdiction.'] },
  { id: 'contact', h: '12. Contact', ps: [<>Write to <a href="mailto:hello@unfoundchapter.com">hello@unfoundchapter.com</a> or call <a href="tel:+919147746406">+91 91477 46406</a>.</>] },
];

export const PRIVACY = [
  { id: 'who', h: 'Who we are', ps: [`Bitmartian Softech Private Limited, trading as Unfound Chapter, decides how your details are used. Our principal place of business is ${ADDRESS}.`] },
  { id: 'photos', h: 'Your photos and reviews', ps: ['Your privacy is our top priority. We will never post your reviews, your photos or anything else from your journey, anywhere. What you share with us stays with us.'] },
  { id: 'collect', h: 'What we collect', ps: ['Your name, email, phone, travel dates, number of travellers and your message. For bookings, names as on your ID and any dietary or accessibility needs you choose to share.'] },
  { id: 'use', h: 'How we use it', ps: ['Only to reply, plan and arrange your journey, and keep you informed. We do not sell your details.'] },
  { id: 'share', h: 'Who we share it with', ps: ['Hotels, transport providers and guides involved in your journey; the banking or payment provider when you pay; Resend (resend.com), the email service that delivers your enquiry to us and sends you a one-time confirmation email, with FormSubmit (formsubmit.co) as a backup; WhatsApp if you message us, under its own policy; and, only for the purposes you allow in the cookie notice, Google (Analytics and Ads) and Meta, to count visits and measure our advertising.'] },
  { id: 'retention', h: 'How long we keep it', ps: ['Enquiries that do not become bookings are deleted after 12 months. Booking and invoice records are kept as long as Indian tax and company law require.'] },
  { id: 'rights', h: 'Your choices', ps: [<>You can ask to see, correct or delete your details, or withdraw consent, under the Digital Personal Data Protection Act, 2023. Write to <a href="mailto:hello@unfoundchapter.com">hello@unfoundchapter.com</a> and we will reply within 30 days.</>] },
  { id: 'complaints', h: 'Complaints', ps: [<>Write to <a href="mailto:hello@unfoundchapter.com?subject=Privacy">hello@unfoundchapter.com</a> with “Privacy” in the subject line. If you are not satisfied with our reply, you can complain to the Data Protection Board of India under the Digital Personal Data Protection Act, 2023.</>] },
  { id: 'children', h: 'Children', ps: ['Our journeys are booked by adults. This website is not meant for anyone under 18, and we do not knowingly collect their details or track them. A child travelling with a family is booked by a parent or guardian, who gives us any details we need.'] },
  { id: 'website', h: 'This website and cookies', ps: [
    <>This website works without any optional cookies. We ask your permission, separately, for two purposes. Nothing for either purpose runs until you say yes, and you can change or withdraw your choice at any time with <a href="#cookie-settings">Cookie settings</a> at the foot of every page, as easily as you gave it. The cookie notice is available in English and Hindi.</>,
    [<strong style={{ fontWeight: 600, color: '#1B2B4A' }}>Analytics (Google Analytics)</strong>, 'Purpose: to see which pages are read and which journeys interest people, so we can improve the website.', 'What is recorded: the pages you view and for how long, how you arrived (for example from an ad or a search), your approximate city, your device, browser and operating system, and whether you sent an enquiry or tapped a WhatsApp, call or email link, linked to a cookie ID.', 'Kept by Google for 2 months, then deleted. Google signals and ad personalisation are switched off.'],
    [<strong style={{ fontWeight: 600, color: '#1B2B4A' }}>Advertising (Google Ads, Meta: Facebook and Instagram)</strong>, 'Purpose: to see which of our ads bring people to the website and lead to an enquiry.', 'What is recorded: the ad you clicked, the pages you view, and whether you sent an enquiry or tapped WhatsApp, linked to a cookie ID.', 'Kept by Google and Meta under their own policies.'],
    <><span style={{ color: '#B3261E' }}>Google and Meta receive your device and browsing details, and <strong style={{ fontWeight: 700 }}>NOT</strong> your name, email or phone number.</span></>,
    <>If you do not allow Advertising, the advertising tools are not loaded at all: no advertising cookies are set, and nothing is sent to Google Ads or Meta.</>,
    <>The only cookie-like item set without asking is one that remembers your choice (stored in your browser, with the date and the version of this notice). We also count visits with Vercel Web Analytics, from our hosting provider. It sets no cookies and works the same whatever you choose. It records the page viewed, the site you came from, your country, and your device, browser and operating system, and reports them only as totals. To tell visits apart it uses a code made from your connection details that changes every day and is not stored, so it cannot be used to recognise you over time.</>,
    'Our fonts are served from this website rather than a third party.',
  ] },
];
