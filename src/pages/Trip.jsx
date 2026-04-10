import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useEvents } from '../hooks/useEvents'
import { useUserBudget } from '../hooks/useVotes'
import { DAYS, TRIP_START, WEATHER } from '../constants'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import Overview from '../components/Overview'
import AirbnbCarousel from '../components/AirbnbCarousel'
import Countdown from '../components/Countdown'
import VoteBudgetBar from '../components/VoteBudgetBar'
import TripRsvpModal from '../components/TripRsvpModal'
import SpotifyWidget from '../components/SpotifyWidget'
import { fsPage, fsDaySwitched, fsOverviewViewed, fsEventAdded, fsEventEdited, fsEventDeleted, fsAirbnbsViewed } from '../lib/fullstory'

// Day indices 0–4 = DAYS[0..4], 5 = Airbnbs, 6 = Overview
const OVERVIEW_IDX = 6
const AIRBNBS_IDX  = 5

export default function Trip() {
  const { profile, signOut } = useAuth()
  const { events, loading, dbReady, seeding, seedDefaults, addEvent, updateEvent, deleteEvent } = useEvents()
  const { remaining } = useUserBudget()
  const [activeDay, setActiveDay] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [rsvpOpen, setRsvpOpen]   = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fsPage({ pageName: 'Trip Planner' })
  }, [])

  function handleDaySwitch(i) {
    setActiveDay(i)
    if (i === OVERVIEW_IDX) {
      fsOverviewViewed()
    } else if (i === AIRBNBS_IDX) {
      fsAirbnbsViewed()
    } else {
      fsDaySwitched(DAYS[i]?.short, i)
    }
  }

  function openAdd()        { setEditingEvent(null); setModalOpen(true) }
  function openEdit(ev)     { setEditingEvent(ev);   setModalOpen(true) }
  function closeModal()     { setModalOpen(false);   setEditingEvent(null) }

  async function handleSave(ev) {
    const { day_key, ...fields } = ev
    if (editingEvent) {
      await updateEvent(editingEvent.id, { ...fields, day_key })
      fsEventEdited(ev.category)
    } else {
      await addEvent(day_key, fields)
      fsEventAdded(ev.category, ev.cost || 0)
    }
    closeModal()
  }

  async function handleDelete(id, category) {
    if (!confirm('Delete this event?')) return
    await deleteEvent(id)
    fsEventDeleted(category)
  }

  const day        = DAYS[activeDay]
  const isTravelDay = day?.travelDay === true
  const dayEvents  = (events[day?.key] || []).slice().sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="app" data-component="TripPage">

      {/* ── HEADER ── */}
      <header className="app-header" data-component="AppHeader">
        <div className="header-left">
          <h1 className="trip-title">🎉 Bachelor Trip — San Juan 2026</h1>
          <p className="trip-sub">San Juan, Puerto Rico · Labor Day Weekend · Sep 3–7, 2026</p>
        </div>
        <div className="header-right">
          <span className="badge">Labor Day 2026</span>
          <button
            className={`btn-rsvp-trigger ${profile?.trip_rsvp === 'yes' ? 'going' : profile?.trip_rsvp === 'no' ? 'out' : ''}`}
            onClick={() => setRsvpOpen(true)}
            data-action="open-rsvp"
          >
            {profile?.trip_rsvp === 'yes' ? '✈️ I\'m In!' : profile?.trip_rsvp === 'no' ? '😢 Can\'t Make It' : '🎟 RSVP'}
          </button>
          <button className="btn-ghost profile-btn" onClick={() => navigate('/profile')} data-action="go-to-profile">
            <span className="avatar-sm">{profile?.name?.charAt(0).toUpperCase() || '?'}</span>
            {profile?.name || 'Profile'}
          </button>
          <button className="btn-ghost" onClick={signOut} data-action="sign-out">Sign Out</button>
        </div>
      </header>

      {/* ── DB SYNC BANNER — only shows if events aren't in Supabase yet ── */}
      {!dbReady && (
        <div className="sync-banner">
          <span>⚠️ Events not yet synced to database — voting won't work until you sync.</span>
          <button className="sync-btn" onClick={seedDefaults} disabled={seeding}>
            {seeding ? 'Syncing…' : 'Sync Events to DB'}
          </button>
        </div>
      )}

      {/* ── COUNTDOWN ── */}
      <Countdown tripStart={TRIP_START} />

      {/* ── VOTE BUDGET BAR ── */}
      <VoteBudgetBar />

      {/* ── SPOTIFY ── */}
      <SpotifyWidget />

      {/* ── WEATHER STRIP ── */}
      <div className="weather-strip" data-component="WeatherStrip">
        {DAYS.map((d, i) => (
          <div key={d.key} className="weather-day">
            <span className="wd-icon">{WEATHER[i].icon}</span>
            <div>
              <div className="wd-label">{d.short}</div>
              <span className="wd-temp">{WEATHER[i].high}°</span>
              <span className="wd-desc"> / {WEATHER[i].low}° · {WEATHER[i].desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── DAY TABS ── */}
      <div className="day-tabs" data-component="DayTabs">
        {DAYS.map((d, i) => (
          <button
            key={d.key}
            className={`day-tab ${i === activeDay ? 'active' : ''} ${d.travelDay ? 'travel' : ''}`}
            onClick={() => handleDaySwitch(i)}
            data-element="day-tab"
            data-day={d.key}
          >
            <div className="tl">{d.short}</div>
            <div className="td">{d.date}</div>
            <div className="tc">
              {d.travelDay ? '✈️ Travel' : `${events[d.key]?.length || 0} events`}
            </div>
          </button>
        ))}
        <button
          className={`day-tab ${activeDay === AIRBNBS_IDX ? 'active' : ''}`}
          onClick={() => handleDaySwitch(AIRBNBS_IDX)}
          data-element="airbnbs-tab"
        >
          <div className="tl">Stay</div>
          <div className="td">🏠</div>
          <div className="tc">Vote Airbnb</div>
        </button>
        <button
          className={`day-tab ${activeDay === OVERVIEW_IDX ? 'active' : ''}`}
          onClick={() => handleDaySwitch(OVERVIEW_IDX)}
          data-element="overview-tab"
        >
          <div className="tl">All Days</div>
          <div className="td">📊</div>
          <div className="tc">Overview</div>
        </button>
      </div>

      {/* ── MAIN ── */}
      <main className="main" data-component="TripMain">
        {activeDay === OVERVIEW_IDX ? (
          <Overview events={events} />

        ) : activeDay === AIRBNBS_IDX ? (
          <AirbnbCarousel />

        ) : isTravelDay ? (
          <div className="travel-day" data-element="travel-day-screen">
            <div className="travel-icon">✈️</div>
            <h2>Travel Day</h2>
            <p>Monday, September 7, 2026 — Labor Day</p>
            <p className="travel-note">
              Safe travels, crew! No activities scheduled — just pack up, check out, and head to SJU.<br />
              <strong>Destination:</strong> SJU — Luis Muñoz Marín International Airport
            </p>
          </div>

        ) : (
          <>
            <div className="day-header">
              <div>
                <h2 className="day-title">{day.full}</h2>
                <p className="day-meta">
                  {loading ? 'Loading…' : `${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''} planned`}
                </p>
              </div>
              <button className="btn-add" onClick={openAdd} data-action="add-event">+ Add Event</button>
            </div>

            <div className="timeline" data-component="Timeline">
              {!loading && dayEvents.length === 0 && (
                <div className="empty-state" data-element="empty-state">
                  <div className="ei">🗓️</div>
                  <p>Nothing planned yet.<br />Hit <strong>+ Add Event</strong> to build the itinerary!</p>
                </div>
              )}
              {dayEvents.map((ev, idx) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  index={idx}
                  remaining={remaining}
                  onEdit={() => openEdit(ev)}
                  onDelete={() => handleDelete(ev.id, ev.category)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── EVENT MODAL ── */}
      {modalOpen && (
        <EventModal
          event={editingEvent}
          dayKey={day?.key}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* ── RSVP MODAL ── */}
      {rsvpOpen && <TripRsvpModal onClose={() => setRsvpOpen(false)} />}
    </div>
  )
}
