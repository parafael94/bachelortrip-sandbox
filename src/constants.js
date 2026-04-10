export const DAYS = [
  { short: 'Thursday',  date: 'Sep 3', full: 'Thursday, September 3, 2026 — Arrival Day', key: 'd0' },
  { short: 'Friday',    date: 'Sep 4', full: 'Friday, September 4, 2026',                  key: 'd1' },
  { short: 'Saturday',  date: 'Sep 5', full: 'Saturday, September 5, 2026',                key: 'd2' },
  { short: 'Sunday',    date: 'Sep 6', full: 'Sunday, September 6, 2026',                  key: 'd3' },
  { short: 'Monday',    date: 'Sep 7', full: 'Monday, September 7, 2026 — Travel Day ✈️',  key: 'd4', travelDay: true },
]

export const CATS = {
  party:     { label: 'Party',     icon: '🍻',  color: '#f0a500' },
  food:      { label: 'Food',      icon: '🍽️', color: '#27ae60' },
  activity:  { label: 'Activity',  icon: '🎯',  color: '#e74c3c' },
  stay:      { label: 'Stay',      icon: '🏨',  color: '#2980b9' },
  transport: { label: 'Transport', icon: '🚗',  color: '#8e44ad' },
  rest:      { label: 'Rest',      icon: '💤',  color: '#a0a0b0' },
}

export const TRIP_START = new Date('2026-09-03T14:00:00')

export const WEATHER = [
  { icon: '⛅', high: 88, low: 78, desc: 'Partly Cloudy' },
  { icon: '🌤', high: 89, low: 79, desc: 'Mostly Sunny' },
  { icon: '🌦', high: 87, low: 78, desc: 'PM Showers' },
  { icon: '☀️', high: 90, low: 79, desc: 'Sunny & Warm' },
  { icon: '⛅', high: 88, low: 78, desc: 'Partly Cloudy' },
]

export const DEFAULT_EVENTS = {
  d0: [
    { id: 'p0a', time: '14:00', category: 'transport', title: '✈️ Arrive at SJU — Welcome to Puerto Rico!', location: 'Luis Muñoz Marín International Airport, Carolina, Puerto Rico', cost: 25, duration: 60, noVote: true, notes: 'Collect bags, meet the crew at arrivals. Uber/taxi to hotel ~20 min & ~$25. Group photo mandatory 📸', links: [{ label: '🌐 Airport Info', style: 'lk-info', url: 'https://www.aeropuertosju.com/en/' }, { label: '🚗 Uber PR', style: 'lk-extra', url: 'https://www.uber.com/global/en/cities/san-juan/' }] },
    { id: 'p0b', time: '16:00', category: 'stay',      title: '🏨 Hotel Check-In & Get Settled', location: '', cost: 0, duration: 60, notes: 'Drop bags, freshen up, explore the property.', links: [] },
    { id: 'p0c', time: '19:00', category: 'activity',  title: '🏰 Old San Juan Walking Tour', location: 'Old San Juan Historic District, San Juan, Puerto Rico', cost: 25, duration: 180, notes: '500-year-old cobblestone streets, Castillo El Morro & San Cristóbal.', links: [{ label: '🌐 Discover PR', style: 'lk-info', url: 'https://www.discoverpuertorico.com/places-to-visit/old-san-juan' }] },
    { id: 'p0d', time: '22:00', category: 'party',     title: '🪩 La Placita de Santurce — Opening Night', location: 'La Placita de Santurce, Santurce, San Juan, Puerto Rico', cost: 30, duration: 180, notes: 'Open-air street party with salsa music. FREE entry. Peak nights Thu–Sat 10pm–3am.', links: [] },
  ],
  d1: [
    { id: 'p1a', time: '09:00', category: 'activity', title: '⛵ Catamaran Snorkeling to Icacos Island', location: 'Fajardo Marina, Fajardo, Puerto Rico', cost: 100, duration: 420, notes: 'Full-day all-inclusive: snorkeling, lunch + unlimited rum punch.', links: [{ label: '🎟 East Island Excursions', style: 'lk-book', url: 'https://www.eastislandexcursions.com/' }] },
    { id: 'p1b', time: '15:00', category: 'activity', title: '🍹 Casa Bacardi Rum Distillery & Mixology Class', location: 'Casa Bacardi, Cataño, Puerto Rico', cost: 80, duration: 90, notes: 'Take the $0.50 ferry from Old San Juan pier to Cataño (5 min ride!).', links: [{ label: '🎟 Book at Bacardi.com', style: 'lk-book', url: 'https://www.bacardi.com/casa-bacardi/' }] },
    { id: 'p1c', time: '19:00', category: 'activity', title: '💃 Group Salsa Dance Lesson', location: 'Santurce, San Juan, Puerto Rico', cost: 35, duration: 90, notes: '90-min beginner salsa lesson from local instructors.', links: [] },
    { id: 'p1d', time: '22:00', category: 'party',    title: '🍸 La Factoria Speakeasy Bar', location: '148 Calle San Sebastian, Old San Juan, Puerto Rico', cost: 40, duration: 180, notes: "World-class craft cocktails. Multiple hidden rooms.", links: [{ label: '🌐 Website', style: 'lk-info', url: 'https://www.lafactoriapr.com/' }] },
  ],
  d2: [
    { id: 'p2a', time: '07:30', category: 'activity', title: '🌿 El Yunque Rainforest Tour', location: 'El Yunque National Forest, Rio Grande, Puerto Rico', cost: 50, duration: 300, notes: "Only tropical rainforest in the US National Forest.", links: [{ label: '🎟 Reserve Passes', style: 'lk-book', url: 'https://www.recreation.gov/ticket/facility/300009' }] },
    { id: 'p2b', time: '13:00', category: 'activity', title: '🛥️ Jet Ski Coastal Tour', location: 'Condado Lagoon, San Juan, Puerto Rico', cost: 80, duration: 120, notes: 'Guided group jet ski tour along the San Juan coastline.', links: [] },
    { id: 'p2e', time: '09:00', category: 'activity', title: '🏔️ Toro Verde Zip Lines & ATV Adventure', location: 'Toro Verde Nature Adventure Park, Orocovis, Puerto Rico', cost: 90, duration: 360, notes: '"The Monster" — longest zip line in Americas at 2.5km reaching 95mph! Open Saturdays.', links: [{ label: '🎟 Book', style: 'lk-book', url: 'https://toroverdepuertorico.com/' }] },
    { id: 'p2f', time: '21:00', category: 'activity', title: '✨ Bioluminescent Bay Kayaking — Laguna Grande', location: 'Laguna Grande, Fajardo, Puerto Rico', cost: 45, duration: 120, notes: 'Water glows ELECTRIC BLUE when you paddle! Runs nightly — Saturday prime time.', links: [{ label: '🎟 Book', style: 'lk-book', url: 'https://kayakingpuertorico.com/home/tours/bio-bay-kayak-tour/' }] },
    { id: 'p2c', time: '19:00', category: 'food',     title: '🍽️ Group Dinner at Santaella', location: 'Santaella, Mercado de Santurce, San Juan, Puerto Rico', cost: 80, duration: 120, notes: 'Contemporary Puerto Rican cuisine, tapas-style. RESERVATIONS ESSENTIAL.', links: [{ label: '🎟 Reserve', style: 'lk-book', url: 'https://www.josesantaella.com/' }] },
    { id: 'p2d', time: '23:00', category: 'party',    title: '🎶 Club Brava at El San Juan Hotel', location: 'Fairmont El San Juan Hotel, Isla Verde, San Juan, Puerto Rico', cost: 50, duration: 240, notes: "Puerto Rico's most famous nightclub.", links: [{ label: '🌐 Info', style: 'lk-info', url: 'https://elsanjuanhotel.com/nightlife/brava-nightclub/' }] },
  ],
  d3: [
    { id: 'p3a', time: '07:00', category: 'activity', title: '🏝️ Culebra Island Day Trip — Flamenco Beach', location: 'Flamenco Beach, Culebra Island, Puerto Rico', cost: 60, duration: 600, notes: "Consistently ranked one of the world's top beaches.", links: [{ label: '🎟 Book', style: 'lk-book', url: 'https://culebraislandtours.com/' }] },
    { id: 'p3e', time: '14:00', category: 'rest',     title: '🏖️ Isla Verde Beach — Afternoon Wind Down', location: 'Isla Verde Beach, San Juan, Puerto Rico', cost: 0, duration: 180, notes: 'Final beach afternoon. Piña coladas on the sand before the big send-off. 🌴', links: [] },
    { id: 'p3b', time: '17:00', category: 'party',    title: '🌅 Arya Rooftop Bar — Sunset Drinks', location: 'Arya Rooftop Bar, San Juan, Puerto Rico', cost: 35, duration: 120, notes: 'Panoramic rooftop views over San Juan.', links: [] },
    { id: 'p3f', time: '19:00', category: 'party',    title: '⛵ Sunset Sailing Cruise with Open Bar', location: 'San Juan Bay, Old San Juan, Puerto Rico', cost: 70, duration: 180, notes: '2–3hr evening sail with live music, open bar & snacks. EPIC last night send-off. 🥂', links: [{ label: '🎟 Book', style: 'lk-book', url: 'https://sailgetawaypuertorico.com/' }] },
    { id: 'p3c', time: '20:00', category: 'food',     title: '🥘 Puerto Rican Food & Rum Walking Tour', location: 'Old San Juan, Puerto Rico', cost: 55, duration: 150, notes: 'Guided culinary tour: mofongo, lechón, tostones & alcapurrias.', links: [{ label: '🎟 Food Spoon Tours', style: 'lk-book', url: 'https://foodspoontours.com/' }] },
    { id: 'p3d', time: '23:30', category: 'party',    title: '🍺 El Batey — Legendary Dive Bar', location: 'Calle Cristo, Old San Juan, Puerto Rico', cost: 20, duration: 150, notes: 'Institution since 1963. No cover.', links: [] },
  ],
  d4: [],
}
