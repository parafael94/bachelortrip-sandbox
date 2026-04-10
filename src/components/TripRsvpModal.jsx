import { useAuth } from '../AuthContext'
import { fsRsvpToggled } from '../lib/fullstory'

export default function TripRsvpModal({ onClose }) {
  const { profile, updateProfile } = useAuth()
  const current = profile?.trip_rsvp || 'unset'

  async function setRsvp(status) {
    await updateProfile({ trip_rsvp: status })
    fsRsvpToggled(status, 'trip')
    onClose()
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
            data-action="rsvp-yes"
          >
            <span className="rsvp-choice-icon">✈️</span>
            <span className="rsvp-choice-label">I'm In!</span>
            {current === 'yes' && <span className="rsvp-check">✓</span>}
          </button>

          <button
            className={`rsvp-choice no ${current === 'no' ? 'selected' : ''}`}
            onClick={() => setRsvp('no')}
            data-action="rsvp-no"
          >
            <span className="rsvp-choice-icon">😢</span>
            <span className="rsvp-choice-label">Can't Make It</span>
            {current === 'no' && <span className="rsvp-check">✓</span>}
          </button>
        </div>

        {current !== 'unset' && (
          <button
            className="rsvp-undecided"
            onClick={() => setRsvp('unset')}
            data-action="rsvp-undecided"
          >
            Mark as Undecided
          </button>
        )}

        <button className="rsvp-modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
