import { CATS } from '../constants'
import { useRsvp } from '../hooks/useRsvp'
import { useVotes } from '../hooks/useVotes'
import { useUserBudget } from '../hooks/useVotes'
import { useAuth } from '../AuthContext'

function fmt12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function EventCard({ event: ev, index, onEdit, onDelete }) {
  const cat = CATS[ev.category] || CATS.party
  const { user } = useAuth()
  const { myRsvp, yesCount, toggleRsvp } = useRsvp(ev.id)
  const { myVote, voteCount, toggleVote } = useVotes(ev.id, ev.cost || 0)
  const { remaining } = useUserBudget()

  const canVote = !!myVote || (ev.cost || 0) <= remaining
  const links = ev.links || []

  return (
    <div className="event-item" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="evt-time">{fmt12(ev.time)}</div>
      <div className="evt-dot" style={{ background: cat.color }} />
      <div className="evt-card">

        {/* ── HEAD ── */}
        <div className="evt-head">
          <div className="evt-left">
            <span className="evt-icon">{cat.icon}</span>
            <div>
              <div className="evt-name">{ev.title}</div>
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
              <a key={i} className={`evt-link ${l.style || 'lk-book'}`} href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}

        {/* ── COST ── */}
        {ev.cost > 0 && (
          <div className="evt-cost-row">
            <span className="evt-cost-badge">💰 ${ev.cost}/person</span>
          </div>
        )}

        {user && (
          <div className="evt-interaction-row">

            {/* ── RSVP ── */}
            <div className="interaction-group">
              <div className="interaction-label">RSVP</div>
              <div className="rsvp-inline">
                <button
                  className={`rsvp-btn ${myRsvp?.status === 'yes' ? 'yes' : ''}`}
                  onClick={() => toggleRsvp('yes')}
                  title="I'm going"
                >
                  ✓ Going {yesCount > 0 ? `(${yesCount})` : ''}
                </button>
                <button
                  className={`rsvp-btn ${myRsvp?.status === 'no' ? 'no' : ''}`}
                  onClick={() => toggleRsvp('no')}
                  title="Can't make it"
                >
                  ✗ Can't
                </button>
              </div>
            </div>

            {/* ── VOTE ── */}
            {ev.cost > 0 && (
              <div className="interaction-group">
                <div className="interaction-label">Vote Budget</div>
                <button
                  className={`vote-btn ${myVote ? 'voted' : ''} ${!canVote && !myVote ? 'disabled' : ''}`}
                  onClick={() => canVote && toggleVote(remaining - (myVote ? ev.cost : 0))}
                  title={
                    myVote ? `Remove vote (refunds $${ev.cost})`
                    : !canVote ? `Not enough budget ($${ev.cost} needed, $${remaining} left)`
                    : `Vote for this ($${ev.cost} of your $500)`
                  }
                >
                  {myVote ? '🗳️ Voted' : '🗳️ Vote'}
                  {' '}
                  <span className="vote-count">{voteCount > 0 ? `· ${voteCount} vote${voteCount !== 1 ? 's' : ''}` : ''}</span>
                </button>
                {!canVote && !myVote && (
                  <div className="vote-blocked">Not enough budget</div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ── ACTIONS ── */}
        <div className="evt-actions">
          <button className="btn-sm btn-edit"   onClick={onEdit}>✏️ Edit</button>
          <button className="btn-sm btn-delete" onClick={onDelete}>🗑 Delete</button>
        </div>

      </div>
    </div>
  )
}
