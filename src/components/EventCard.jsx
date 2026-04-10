import { CATS } from '../constants'
import { useVotes } from '../hooks/useVotes'
import { useAuth } from '../AuthContext'
import { fsVoteCast, fsVoteRemoved, fsBookingLinkClicked } from '../lib/fullstory'

function fmt12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function EventCard({ event: ev, index, onEdit, onDelete, remaining = 500 }) {
  const cat = CATS[ev.category] || CATS.party
  const { user } = useAuth()
  const { myVote, voteCount, toggleVote } = useVotes(ev.id, ev.cost || 0)

  const canVote = !!myVote || (ev.cost || 0) <= remaining
  const links = ev.links || []

  function handleVote() {
    if (!canVote) return
    if (myVote) {
      fsVoteRemoved(ev.cost, remaining + (ev.cost || 0))
    } else {
      fsVoteCast(ev.cost, remaining - (ev.cost || 0))
    }
    toggleVote()
  }

  function handleLinkClick(label) {
    fsBookingLinkClicked(label, ev.category)
  }

  return (
    <div className="event-item" style={{ animationDelay: `${index * 55}ms` }} data-component="EventCard" data-event-id={ev.id} data-category={ev.category}>
      <div className="evt-time">{fmt12(ev.time)}</div>
      <div className="evt-dot" style={{ background: cat.color }} />
      <div className="evt-card">

        {/* ── HEAD ── */}
        <div className="evt-head">
          <div className="evt-left">
            <span className="evt-icon">{cat.icon}</span>
            <div>
              <div className="evt-name" data-element="event-title">{ev.title}</div>
              {ev.location && <div className="evt-loc">📍 {ev.location}</div>}
            </div>
          </div>
          <span className={`evt-badge c-${ev.category}`}>{cat.label}</span>
        </div>

        {/* ── NOTES ── */}
        {ev.notes && <div className="evt-notes">{ev.notes}</div>}

        {/* ── LINKS ── */}
        {links.length > 0 && (
          <div className="evt-links">
            {links.map((l, i) => (
              <a
                key={i}
                className={`evt-link ${l.style || 'lk-book'}`}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                data-element="booking-link"
                onClick={() => handleLinkClick(l.label)}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}

        {/* ── COST + VOTE ── */}
        {ev.cost > 0 && (
          <div className="evt-cost-row">
            <span className="evt-cost-badge" data-element="cost-badge">💰 ${ev.cost}/person</span>

            {user && (
              <div className="evt-vote-inline">
                <button
                  className={`vote-btn ${myVote ? 'voted' : ''} ${!canVote && !myVote ? 'disabled' : ''}`}
                  onClick={handleVote}
                  title={
                    myVote ? `Remove vote (refunds $${ev.cost})`
                    : !canVote ? `Not enough budget ($${ev.cost} needed, $${remaining} left)`
                    : `Vote for this ($${ev.cost} of your $500)`
                  }
                  data-action="vote-toggle"
                >
                  {myVote ? '🗳️ Voted' : '🗳️ Vote'}
                  {voteCount > 0 && <span className="vote-count"> · {voteCount}</span>}
                </button>
                {!canVote && !myVote && (
                  <span className="vote-blocked" data-element="vote-blocked">Budget full</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div className="evt-actions">
          <button className="btn-sm btn-edit"   onClick={onEdit}   data-action="edit-event">✏️ Edit</button>
          <button className="btn-sm btn-delete" onClick={onDelete} data-action="delete-event">🗑 Delete</button>
        </div>

      </div>
    </div>
  )
}
