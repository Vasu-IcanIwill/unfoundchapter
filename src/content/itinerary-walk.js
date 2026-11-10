// The Dev Deepawali itinerary as a walk along the river. One entry per stop, in order.
// scene: which line drawing stands behind the stop (see components/walkArt.js)
// sky:   the time of day while this stop is centred: [top colour, horizon colour, night 0..1]
// Copy follows the brochure. No temple names; no em dashes.

export const DAYS = [
  { id: 'd1', label: 'Day I', date: 'Monday · 23 November', title: 'Arrival' },
  { id: 'd2', label: 'Day II', date: 'Tuesday · 24 November', title: 'Dev Deepawali' },
  { id: 'd3', label: 'Day III', date: 'Wednesday · 25 November', title: 'Farewell' },
];

export const STOPS = [
  {
    day: 'd1', scene: 'arrival', time: 'On arrival', title: 'A private pick-up',
    text: 'Your car meets you at the railway station or airport and brings you to Om Vilas Resort, your home for the journey.',
    sky: ['#EFE5D2', '#F7F0E2', 0],
  },
  {
    day: 'd1', scene: 'resort', time: 'Late morning', title: 'Welcome to Om Vilas',
    text: 'Tented suites set in gardens, with their own verandahs and lantern-lit paths. You are welcomed with a tilak and an aarti thali, and a rudraksha mala as our gift. Settle in over brunch.',
    sky: ['#EADFC9', '#F8F1E3', 0],
  },
  {
    day: 'd1', scene: 'henna', time: '11 AM to 1 PM', title: 'Henna at the reception',
    text: 'The resort hosts a henna session for our guests: slow, fragrant and unhurried.',
    sky: ['#E8DCC4', '#F7EEDC', 0],
  },
  {
    day: 'd1', scene: 'temple', time: '3:00 PM', title: 'A temple visit',
    text: 'Our private car collects you for a temple visit in the old city, where devotion has been offered for centuries.',
    sky: ['#E9D6B4', '#F6E8CC', 0],
  },
  {
    day: 'd1', scene: 'lanes', time: 'After', title: 'A guided heritage walk',
    text: 'Through the narrow lanes of Kashi, past old shrines, ghats and courtyards, where every corner holds a story.',
    sky: ['#E6CDA3', '#F4E2C0', 0.05],
  },
  {
    day: 'd1', scene: 'observatory', time: '5:00 PM', title: 'The city, told in light',
    text: 'The story of Varanasi unfolds in light at the laser show at Man Singh Observatory, bringing its heritage and celestial wonders to life.',
    sky: ['#D9B48A', '#F1D3A6', 0.2],
  },
  {
    day: 'd1', scene: 'aarti', time: 'Dusk', title: 'Ganga Aarti, by boat',
    text: 'As dusk settles over Kashi, we take to the river to watch the Ganga Aarti at Dashashwamedh Ghat: sacred chants, flickering flames and the river’s timeless rhythm.',
    sky: ['#56607E', '#E3A983', 0.55],
  },
  {
    day: 'd1', scene: 'palace', time: '7:30 PM', title: 'A table by the river',
    text: 'Ten courses at Aangan, BrijRama Palace, served with storytelling: three great families, told one course at a time.',
    sky: ['#253556', '#5B5F7A', 0.85],
  },
  {
    day: 'd1', scene: 'night', time: '10:30 PM', title: 'The night aarti',
    text: 'An 800 metre walk from the palace to the temple for the Shayan Aarti, the last ritual of the day, with VIP entry. Then, back to the resort.',
    sky: ['#141F38', '#2E3A5A', 1],
  },
  {
    day: 'd2', scene: 'morning', time: '8:30 AM', title: 'A slower morning',
    text: 'The morning is yours. Wake slowly, savour the calm of the resort, and gather for brunch at Om Vilas.',
    sky: ['#E9D9C6', '#F8EBDB', 0],
  },
  {
    day: 'd2', scene: 'board', time: '4:00 PM', title: 'Board at Gaay Ghat',
    text: 'Roads near the ghats close early on Dev Deepawali, so our car brings you to Gaay Ghat in good time to board.',
    sky: ['#E6CBA0', '#F5E0BC', 0.05],
  },
  {
    day: 'd2', scene: 'deck', time: 'Sunset', title: 'High tea on the waters',
    text: 'Ghat to ghat by boat, with chai, coffee and a Banarasi chaat experience, as the city turns to gold.',
    sky: ['#C98D72', '#F2C08E', 0.35],
  },
  {
    day: 'd2', scene: 'lamps', time: 'Night', title: 'The night of the lamps',
    text: 'The lamps are lit and the river fills with light: Dev Deepawali, with fireworks and laser shows across the ghats.',
    sky: ['#101A33', '#2A2F52', 1],
  },
  {
    day: 'd2', scene: 'resortNight', time: 'Later', title: 'Dinner at the resort',
    text: 'Back to Om Vilas for dinner under the lanterns.',
    sky: ['#1C2846', '#3C4566', 0.9],
  },
  {
    day: 'd3', scene: 'market', time: 'Morning', title: 'A Banarasi silk of your own',
    text: 'If your departure allows, our car takes you to the local market. A Banarasi silk is a must.',
    sky: ['#ECE0CC', '#F9F1E4', 0],
  },
  {
    day: 'd3', scene: 'farewell', time: 'Departure', title: 'The close of this chapter',
    text: 'A private transfer to the railway station or airport. The journey is the destination.',
    sky: ['#EADCC6', '#F7EEDF', 0],
  },
];
