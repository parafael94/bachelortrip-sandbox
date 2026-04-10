import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { fsPage, fsProfileSaved } from '../lib/fullstory'

const AIRPORTS = [
  'JFK','LGA','EWR','BOS','PHL','DCA','IAD','BWI','MIA','FLL',
  'MCO','TPA','ATL','CLT','ORD','MDW','DTW','MSP','DFW','FTW',
  'IAH','DEN','PHX','LAS','LAX','SFO','SEA','RDU','PNS','SJU'
]

const RSVP_LABELS = {
  yes:   { icon: '✈️', text: 'I\'m In!',       cls: 'yes' },
  no:    { icon: '😢', text: 'Can\'t Make It', cls: 'no'  },
  unset: { icon: '❓', text: 'Undecided',      cls: ''    },
}

export default function Profile() {
  const { profile, updateProfile, signOut, user } = useAuth()
  const navigate = useNavigate()

  const [name, setName]         = useState('')
  const [city, setCity]         = useState('')
  const [airport, setAirport]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  useEffect(() => {
    fsPage({ pageName: 'Profile' })
  }, [])

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setCity(profile.home_city || '')
      setAirport(profile.airport_code || '')
    }
  }, [profile])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await updateProfile({ name, home_city: city, airport_code: airport.toUpperCase() })
    fsProfileSaved(!!airport)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); navigate('/') }, 1200)
  }

  async function handleRsvp(status) {
    await updateProfile({ trip_rsvp: status })
  }

  async function handleResetVotes() {
    if (!confirm('Reset all your activity votes? This cannot be undone.')) return
    setResetting(true)
    await supabase.from('votes').delete().eq('user_id', user.id)
    setResetting(false)
    setResetDone(true)
    setTimeout(() => setResetDone(false), 2000)
  }

  const currentRsvp = profile?.trip_rsvp || 'unset'

  return (
    <div className="page-wrap" data-component="ProfilePage">
      <div className="profile-card">
        <button className="btn-back" onClick={() => navigate('/')} data-action="back-home">
          ← Back to Trip
        </button>
        <div className="profile-avatar">{name ? name.charAt(0).toUpperCase() : '?'}</div>
        <h2>Your Profile</h2>
        <p className="profile-email fs-mask">{user?.email}</p>

        {/* ── TRIP RSVP ── */}
        <div className="profile-rsvp-section">
          <div className="profile-section-label">Trip RSVP · Sep 3–7, 2026</div>
          <div className="profile-rsvp-row">
            {(['yes', 'no', 'unset']).map(status => {
              const { icon, text, cls } = RSVP_LABELS[status]
              return (
                <button
                  key={status}
                  className={`profile-rsvp-btn ${cls} ${currentRsvp === status ? 'selected' : ''}`}
                  onClick={() => handleRsvp(status)}
                  data-action={`rsvp-${status}`}
                >
                  {icon} {text}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── PROFILE FORM ── */}
        <form onSubmit={handleSave} className="profile-form" data-component="ProfileForm">
          <div className="form-group">
            <label>Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mike"
              required
              className="fs-mask"
              data-element="name-input"
            />
          </div>
          <div className="form-group">
            <label>Home City</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. New York"
              className="fs-mask"
              data-element="city-input"
            />
          </div>
          <div className="form-group">
            <label>Home Airport</label>
            <input
              value={airport}
              onChange={e => setAirport(e.target.value.toUpperCase())}
              placeholder="e.g. JFK"
              maxLength={4}
              list="airport-list"
              data-element="airport-input"
            />
            <datalist id="airport-list">
              {AIRPORTS.map(a => <option key={a} value={a} />)}
            </datalist>
          </div>

          <button type="submit" className="btn-save" disabled={saving} data-action="save-profile">
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </form>

        {/* ── DANGER ZONE ── */}
        <div className="profile-danger-zone">
          <div className="profile-section-label">Danger Zone</div>
          <button
            className="btn-reset-votes"
            onClick={handleResetVotes}
            disabled={resetting}
            data-action="reset-votes"
          >
            {resetting ? 'Resetting…' : resetDone ? '✓ Votes Reset!' : '🗑 Reset All My Votes'}
          </button>
        </div>

        <button className="btn-signout" onClick={signOut} data-action="sign-out">Sign Out</button>
      </div>
    </div>
  )
}
