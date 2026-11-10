// The Dev Deepawali itinerary as a walk through real places. One entry per scene, in order.
// photo: file name in /public/walk (sizes listed in `w`); focus: where the camera walks towards (x% y%)
// alt: what the photo shows. Copy follows the brochure. No temple names; no em dashes.

export const DAYS = [
  { id: 'd1', label: 'Day I', date: 'Monday · 23 November', title: 'Arrival' },
  { id: 'd2', label: 'Day II', date: 'Tuesday · 24 November', title: 'Dev Deepawali' },
  { id: 'd3', label: 'Day III', date: 'Wednesday · 25 November', title: 'Farewell' },
];

export const STOPS = [
  {
    day: 'd1', photo: 'tents', w: [960, 1920], focus: '62% 38%', time: 'On arrival', title: 'Home, for the journey',
    text: 'A private car brings you from the station or airport to Om Vilas Resort: tented suites in gardens, lantern-lit paths, and a traditional welcome with a tilak and an aarti thali.',
    alt: 'The white tented suites of Om Vilas Resort along a garden path',
  },
  {
    day: 'd1', photo: 'verandah', w: [960], focus: '40% 60%', time: 'Late morning', title: 'Settle in',
    text: 'Brunch at the resort, then henna at the reception from 11 AM to 1 PM: slow, fragrant and unhurried.',
    alt: 'A shaded verandah with cane chairs looking out over the resort lawns',
  },
  {
    day: 'd1', photo: 'gate', w: [960, 1920], focus: '50% 70%', time: '3:00 PM', title: 'Into the old city',
    text: 'A temple visit, then a guided heritage walk through the lanes of Kashi. At five, the story of Varanasi unfolds in light at the laser show at Man Singh Observatory.',
    alt: 'A carved stone gateway framing a spire in the old city of Varanasi',
  },
  {
    day: 'd1', photo: 'aarti', w: [960], focus: '45% 40%', time: 'Dusk', title: 'Ganga Aarti, by boat',
    text: 'As dusk settles over Kashi, we take to the river to watch the Ganga Aarti at Dashashwamedh Ghat: sacred chants, flickering flames and the river’s timeless rhythm.',
    alt: 'A priest raising a tiered flame during the Ganga Aarti before a crowd on the ghat',
  },
  {
    day: 'd1', photo: 'aangan', w: [960, 1920], focus: '50% 62%', time: '7:30 PM', title: 'A table by the river',
    text: 'Ten courses at Aangan, BrijRama Palace, served with storytelling: three royal houses, told one course at a time.',
    alt: 'A candlelit table set for dinner beneath carved arches at Aangan, BrijRama Palace',
    extras: [
      { photo: 'course1', alt: 'The menu card at Aangan' },
      { photo: 'course2', alt: 'A delicate course served in a stone bowl' },
      { photo: 'course3', alt: 'A dessert served with a gold spoon' },
    ],
  },
  {
    day: 'd1', photo: 'night-aarti', w: [960, 1920], focus: '45% 72%', time: '10:30 PM', title: 'The night aarti',
    text: 'An 800 metre walk from the palace to the temple for the Shayan Aarti, the last ritual of the day, with VIP entry. Then, back to the resort.',
    alt: 'Oil lamps glowing during the night aarti inside the temple',
  },
  {
    day: 'd2', photo: 'grounds', w: [960], focus: '50% 55%', time: '8:30 AM', title: 'A slower morning',
    text: 'The morning is yours. Wake slowly, savour the calm of the resort and gather for brunch, before the city calls.',
    alt: 'Guests riding a yellow buggy past the tents at Om Vilas Resort',
  },
  {
    day: 'd2', photo: 'boat', w: [960, 1920], focus: '42% 62%', time: '4:00 PM to sunset', title: 'High tea on the waters',
    text: 'Our car brings you to Gaay Ghat to board in good time. Then ghat to ghat by boat, with chai, coffee and Banarasi chaat, as the city turns to gold.',
    alt: 'A garlanded, lantern-lit boat on the Ganges with the ghats glowing behind',
  },
  {
    day: 'd2', photo: 'ghats-night', w: [960], focus: '60% 45%', time: 'Night', title: 'The night of the lamps',
    text: 'The lamps are lit and the river fills with light: Dev Deepawali, with fireworks and laser shows across the ghats. Dinner awaits back at the resort.',
    alt: 'The ghats of Varanasi ablaze with lamps and lights on Dev Deepawali night',
  },
  {
    day: 'd3', photo: 'tents', w: [960, 1920], focus: '30% 70%', time: 'Morning', title: 'A Banarasi silk, and farewell',
    text: 'If your departure allows, our car takes you to the market for a Banarasi silk of your own. Then a private transfer to the station or airport, and the close of this chapter.',
    alt: 'The garden path between the tents at Om Vilas Resort',
  },
];
