import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { fsRsvpToggled } from '../lib/fullstory'

export default function TripRsvpModal({ onClose }) {
  const { profile, updateProfile } = useAuth()
  // Local state drives the UI immediately — DB syncs in background
  const [current, setCurrent] = useState(profile?.trip_rsvp || 'unset')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  async function setRsvp(status) {
    setCurrent(status)   // optimistic — button highlights instantly
    setSaving(true)
    setError('')
    const { error: err } = await updateProfile({ trip_rsvp: status })
    setSaving(false)
    if (err) {
      setError('Could not save — check console for details.')
      return
    }
    fsRsvpToggled(status, 'trip')
    setTimeout(onClose, 600)  // brief pause so user sees the checkmark before close
  }

  async function clearRsvp() {
    setCurrent('unset')
    setSaving(true)
    await updateProfile({ trip_rsvp: 'unset' })
    setSaving(false)
    setTimeout(onClose, 400)
  }

  return (
    <div className="overlay" onClick={e => e.target.classList.contains('overlay') && onClose()} data-component="TripRsvpModal">
      <div className="rsvp-modal">
        <div className="rsvp-modal-icon">🎉</div>
        <h2 className="rsvp-modal-title">Are you coming to San Juan?</h2>
        <p className="rsvp-modal-sub">Sep 3–7, 2026 · Labor Day Weekend</p>

        <div className="rsvp-modal-options">
          <button
            className={`rsvp-choice yes ${current === 'yes' ? 'selected' : ''}`}
            onClick={() => setRsvp('yes')}
            disabled={saving}
            data-action="rsvp-yes"
          >
            <span className="rsvp-choice-icon">✈️</span>
            <span className="rsvp-choice-label">I'm In!</span>
            {current === 'yes' && <span className="rsvp-check">✓</span>}
          </button>

          <button
            className={`rsvp-choice no ${current === 'no' ? 'selected' : ''}`}
            onClick={() => setRsvp('no')}
            disabled={saving}
            data-action="rsvp-no"
          >
            <span className="rsvp-choice-icon">😢</span>
            <span className="rsvp-choice-label">Can't Make It</span>
            {current === 'no' && <span className="rsvp-check">✓</span>}
          </button>
        </div>

        {error && <p className="rsvp-error">{error}</p>}

        {current !== 'unset' && !saving && (
          <button className="rsvp-undecided" onClick={clearRsvp} data-action="rsvp-undecided">
            Mark as Undecided
          </button>
        )}

        <button className="rsvp-modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
