// The Dev Deepawali itinerary as a walk through real places. One entry per scene, in order.
// photo: file name in /public/walk (widths listed in `w`; `size` is the original in pixels); focus: where the camera walks towards (x% y%)
// alt: what the photo shows. Copy follows the brochure. No temple names; no em dashes.

export const DAYS = [
  { id: 'd1', label: 'Day I', date: 'Monday · 23 November', title: 'Arrival' },
  { id: 'd2', label: 'Day II', date: 'Tuesday · 24 November', title: 'Dev Deepawali' },
  { id: 'd3', label: 'Day III', date: 'Wednesday · 25 November', title: 'Farewell' },
];

export const STOPS = [
  {
    day: 'd1', photo: 'ov-drone', w: [1080, 1280, 2048], size: [1280, 678], focus: '52% 55%', time: 'On arrival', title: 'Om Vilas, Benares',
    text: 'Your home for the journey: white tented suites set in gardens, seen from above as you arrive.',
    alt: 'An aerial view of Om Vilas Resort at dusk, rows of white tents around green lawns',
  },
  {
    day: 'd1', photo: 'ov-arrival', w: [1080, 1280, 2048], size: [1280, 854], focus: '58% 60%', time: 'Pick-up and welcome', title: 'Through the gates',
    text: 'A private car brings you from the station or airport. You are welcomed in the traditional way, with a tilak, an aarti thali and a rudraksha mala as our gift.',
    alt: 'Vintage-style buggies parked under a tiled canopy at the Om Vilas entrance',
  },
  {
    day: 'd1', photo: 'ov-dining', w: [1024, 2048], size: [1024, 683], focus: '55% 58%', time: 'Late morning', title: 'Brunch under the arches',
    text: 'Settle in over brunch. From 11 AM to 1 PM, the resort hosts a henna session for our guests: slow, fragrant and unhurried.',
    alt: 'The resort restaurant with semi-circular windows and tables set outside under white canopies',
  },
  {
    day: 'd1', photo: 'ov-verandah', w: [1080, 1638], size: [1638, 1638], focus: '50% 62%', time: 'Your verandah', title: 'A seat in the garden',
    text: 'Cane chairs, a marble table and lantern-lit tents across the lawn.',
    alt: 'Cane chairs around a marble table on a tent verandah, tents and lawns beyond',
  },
  {
    day: 'd1', photo: 'ov-cottages', w: [1080, 1638], size: [1638, 1638], focus: '60% 55%', time: 'The tented suites', title: 'Home, for the journey',
    text: 'White canopied tents with their own verandahs, lawns and lantern-lit paths: a quiet retreat to return to after the river and the temples.',
    alt: 'A row of white tented suites with verandahs along a garden path',
  },
  {
    day: 'd1', photo: 'ov-suite', w: [1000, 2048], size: [1000, 667], focus: '40% 55%', time: 'Inside', title: 'Your suite',
    text: 'Block-printed walls, warm wood and a quiet corner to sit, with an Atovio pendant, a personal air purifier, yours for the trip.',
    alt: 'Inside a tented suite: a double bed, block-printed walls and a sofa',
  },
  {
    day: 'd1', photo: 'ov-night', w: [1000, 2048], size: [1000, 667], focus: '50% 55%', time: 'Every evening', title: 'Lanterns at night',
    text: 'The lanterns come on along the paths. Each evening ends back here, after the river and the old city.',
    alt: 'A tented suite lit by lanterns at night',
  },
  {
    day: 'd1', photo: 'gate', w: [1080, 1536], size: [1536, 1130], focus: '50% 70%', time: '3:00 PM', title: 'Into the old city',
    text: 'A temple visit, then a guided heritage walk through the lanes of Kashi. At five, the story of Varanasi unfolds in light at the laser show at Man Singh Observatory.',
    alt: 'A carved stone gateway framing a spire in the old city of Varanasi',
  },
  {
    day: 'd1', photo: 'aarti', w: [1021, 1700], size: [1021, 642], focus: '45% 40%', time: 'Dusk', title: 'Ganga Aarti, by boat',
    text: 'As dusk settles over Kashi, we take to the river to watch the Ganga Aarti at Dashashwamedh Ghat: sacred chants, flickering flames and the river’s timeless rhythm.',
    alt: 'A priest raising a tiered flame during the Ganga Aarti before a crowd on the ghat',
  },
  {
    day: 'd1', photo: 'aangan', w: [1080, 2248], size: [2248, 2499], focus: '50% 62%', time: '7:30 PM', title: 'A table by the river',
    text: 'Ten courses at Aangan, BrijRama Palace, served with storytelling: three royal houses, told one course at a time.',
    alt: 'A candlelit table set for dinner beneath carved arches at Aangan, BrijRama Palace',
    extras: [
      { photo: 'course1', alt: 'The menu card at Aangan' },
      { photo: 'course2', alt: 'A delicate course served in a stone bowl' },
      { photo: 'course3', alt: 'A dessert served with a gold spoon' },
    ],
  },
  {
    day: 'd1', photo: 'night-aarti', w: [1080, 1826], size: [1826, 2499], focus: '45% 72%', time: '10:30 PM', title: 'The night aarti',
    text: 'An 800 metre walk from the palace to the temple for the Shayan Aarti, the last ritual of the day, with VIP entry. Then, back to the resort.',
    alt: 'Oil lamps glowing during the night aarti inside the temple',
  },
  {
    day: 'd2', photo: 'grounds', w: [813, 1700], size: [813, 697], focus: '50% 55%', time: '8:30 AM', title: 'A slower morning',
    text: 'The morning is yours. Breakfast at Vaziri, the resort’s own brewery, bar and kitchen, then a buffet lunch at Taj Nadesar Palace, a heritage palace hotel in its own gardens.',
    alt: 'Guests riding a yellow buggy past the tents at Om Vilas Resort',
  },
  {
    day: 'd2', photo: 'boat', w: [1080, 1575], size: [1575, 938], focus: '42% 62%', time: '4:00 PM to sunset', title: 'High tea on the waters',
    text: 'Our car brings you to Gaay Ghat to board in good time. Then ghat to ghat by boat, with chai, coffee and Banarasi chaat, as the city turns to gold.',
    alt: 'A garlanded, lantern-lit boat on the Ganges with the ghats glowing behind',
  },
  {
    day: 'd2', photo: 'ghats-night', w: [850, 1700], size: [850, 557], focus: '60% 45%', time: 'Night', title: 'The night of the lamps',
    text: 'The lamps are lit and the river fills with light: Dev Deepawali, with fireworks and laser shows across the ghats. Dinner awaits back at the resort.',
    alt: 'The ghats of Varanasi ablaze with lamps and lights on Dev Deepawali night',
  },
  {
    day: 'd3', photo: 'tents', w: [1080, 2182], size: [2182, 2499], focus: '30% 70%', time: 'Morning', title: 'A Banarasi silk, and farewell',
    text: 'If your departure allows, our car takes you to the market for a Banarasi silk of your own. Then a private transfer to the station or airport, and the close of this chapter.',
    alt: 'The garden path between the tents at Om Vilas Resort',
  },
];
