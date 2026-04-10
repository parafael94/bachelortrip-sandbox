// FullStory wrapper — BachTrip V5
// Follows fs-skills: safe guards, [Object] [Action] naming, no PII in event names

const ok = () => typeof window !== 'undefined' && !!window.FS

// Core helpers
export const fsTrack     = (name, props = {}) => { try { if (ok()) FS('trackEvent',   { name, properties: props }) } catch {} }
export const fsPage      = (props = {})        => { try { if (ok()) FS('setProperties', { type: 'page',  properties: props }) } catch {} }
export const fsIdentify  = (uid, props = {})   => { try { if (ok()) FS('setIdentity',  { uid: String(uid), properties: props }) } catch {} }
export const fsAnonymize = ()                  => { try { if (ok()) FS('setIdentity',  { anonymous: true }) } catch {} }
export const fsUserProps = (props = {})        => { try { if (ok()) FS('setProperties', { type: 'user',  properties: props }) } catch {} }
export const fsLog       = (msg)               => { try { if (ok()) FS('log',           { level: 'log',  msg: String(msg) }) } catch {} }

// ── Event names follow [Object] [Action] convention ──

// Auth
export const fsAuthMagicLinkSent  = ()         => fsTrack('Magic Link Sent',   {})
export const fsAuthSignedIn       = ()         => fsTrack('User Signed In',    {})
export const fsAuthSignedOut      = ()         => fsTrack('User Signed Out',   {})

// Profile
export const fsProfileSaved = (hasAirport)     => fsTrack('Profile Saved',    { has_airport_code: hasAirport })

// Itinerary navigation
export const fsDaySwitched  = (dayName, idx)   => fsTrack('Day Switched',     { day_name: dayName, day_index: idx })
export const fsOverviewViewed = ()             => fsTrack('Overview Viewed',  {})

// Events
export const fsEventAdded   = (category, cost) => fsTrack('Event Added',      { category, has_cost: cost > 0, cost_usd: cost })
export const fsEventEdited  = (category)       => fsTrack('Event Edited',     { category })
export const fsEventDeleted = (category)       => fsTrack('Event Deleted',    { category })

// RSVP
export const fsRsvpToggled  = (status, eventCategory) =>
  fsTrack('RSVP Toggled', { rsvp_status: status, event_category: eventCategory })

// Budget votes
export const fsVoteCast     = (eventCost, remainingBudget) =>
  fsTrack('Vote Cast',    { event_cost_usd: eventCost, budget_remaining_usd: remainingBudget })
export const fsVoteRemoved  = (eventCost, remainingBudget) =>
  fsTrack('Vote Removed', { event_cost_usd: eventCost, budget_remaining_usd: remainingBudget })

// Booking links
export const fsBookingLinkClicked = (label, category) =>
  fsTrack('Booking Link Clicked', { link_label: label, event_category: category })

// Airbnb
export const fsAirbnbsViewed    = ()      => fsTrack('Airbnbs Viewed',   {})
export const fsAirbnbVoteCast   = (title) => fsTrack('Airbnb Vote Cast',   { airbnb_title: title })
export const fsAirbnbVoteRemoved= (title) => fsTrack('Airbnb Vote Removed', { airbnb_title: title })
