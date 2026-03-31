import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useEvents } from '../hooks/useEvents'
import { useUserBudget } from '../hooks/useVotes'
import { DAYS, TRIP_START, WEATHER } from '../constants'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import Overview from '../components/Overview'
import Countdown from '../components/Countdown'
import VoteBudgetBar from '../components/VoteBudgetBar'

export default function Trip() {
  const { profile, signOut } = useAuth()
  const { events, loading, addEvent, updateEvent, deleteEvent } = useEvents()
  const { remaining } = useUserBudget()
  const [activeDay, setActiveDay] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const navigate = useNavigate()

  function openAdd()        { setEditingEvent(null); setModalOpen(true) }
  function openEdit(ev)     { setEditingEvent(ev);   setModalOpen(true) }
  function closeModal()     { setModalOpen(false);   setEditingEvent(null) }

  async function handleSave(ev) {
    if (editingEvent) await updateEvent(editingEvent.id, ev)
    else              await addEvent(DAYS[activeDay].key, ev)
    closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event?')) return
    await deleteEvent(id)
  }

  const day        = DAYS[activeDay]
  const isTravelDay = day?.travelDay === true
  const dayEvents  = (events[day?.key] || []).slice().sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="trip-title">🎉 Bachelor Trip — San Juan 2026</h1>
          <p className="trip-sub">San Juan, Puerto Rico · Labor Day Weekend · Sep 3–7, 2026</p>
        </div>
        <div className="header-right">
          <span className="badge">Labor Day 2026</span>
          <button className="btn-ghost profile-btn" onClick={() => navigate('/profile')}>
            <span className="avatar-sm">{profile?.name?.charAt(0).toUpperCase() || '?'}</span>
            {profile?.name || 'Profile'}
          </button>
          <button className="btn-ghost" onClick={signOut}>Sign Out</button>
        </div>
      </header>

      {/* ── COUNTDOWN ── */}
      <Countdown tripStart={TRIP_START} />

      {/* ── VOTE BUDGET BAR ── */}
      <VoteBudgetBar />

      {/* ── WEATHER STRIP ── */}
      <div className="weather-strip">
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
      <div className="day-tabs">
        {DAYS.map((d, i) => (
          <button
            key={d.key}
            className={`day-tab ${i === activeDay ? 'active' : ''} ${d.travelDay ? 'travel' : ''}`}
            onClick={() => setActiveDay(i)}
          >
            <div className="tl">{d.short}</div>
            <div className="td">{d.date}</div>
            <div className="tc">
              {d.travelDay ? '✈️ Travel' : `${events[d.key]?.length || 0} events`}
            </div>
          </button>
        ))}
        <button
          className={`day-tab ${activeDay === 5 ? 'active' : ''}`}
          onClick={() => setActiveDay(5)}
        >
          <div className="tl">All Days</div>
          <div className="td">📊</div>
          <div className="tc">Overview</div>
        </button>
      </div>

      {/* ── MAIN ── */}
      <main className="main">
        {activeDay === 5 ? (
          <Overview events={events} />

        ) : isTravelDay ? (
          <div className="travel-day">
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
              <button className="btn-add" onClick={openAdd}>+ Add Event</button>
            </div>

            <div className="timeline">
              {!loading && dayEvents.length === 0 && (
                <div className="empty-state">
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
                  onDelete={() => handleDelete(ev.id)}
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
          dayKey={day.key}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
