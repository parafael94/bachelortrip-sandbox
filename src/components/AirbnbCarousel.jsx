import { useAirbnbs } from '../hooks/useAirbnbs'
import { fsAirbnbVoteCast, fsAirbnbVoteRemoved } from '../lib/fullstory'

const PLACEHOLDERS = ['🏡', '🏖️', '🌴', '🏠']

export default function AirbnbCarousel() {
  const { airbnbs, loading, getVotesFor, getMyVote, toggleVote } = useAirbnbs()

  if (loading) return <div className="airbnb-loading">Loading stays…</div>

  async function handleVote(airbnb) {
    const myVote = getMyVote(airbnb.id)
    await toggleVote(airbnb.id)
    if (myVote) {
      fsAirbnbVoteRemoved(airbnb.title)
    } else {
      fsAirbnbVoteCast(airbnb.title)
    }
  }

  return (
    <div className="airbnb-section" data-component="AirbnbCarousel">
      <div className="airbnb-header">
        <div className="airbnb-coming-soon-banner">
          <span className="cs-star">⭐</span>
          <span className="cs-text">Coming Soon — Voting Opens Soon!</span>
          <span className="cs-star">⭐</span>
        </div>
        <h2 className="airbnb-title">🏠 Where Are We Staying?</h2>
        <p className="airbnb-sub">Vote for your preferred Airbnb — votes don't count against your $500 activity budget.</p>
      </div>

      <div className="airbnb-carousel">
        {airbnbs.map((ab, i) => {
          const myVote   = getMyVote(ab.id)
          const allVotes = getVotesFor(ab.id)
          const voteCount = allVotes.length
          const nights   = 4

          return (
            <div
              key={ab.id}
              className={`airbnb-card ${myVote ? 'voted' : ''}`}
              data-component="AirbnbCard"
              data-airbnb-id={ab.id}
            >
              {/* Image / Placeholder */}
              <div className="airbnb-img">
                {ab.image_url
                  ? <img src={ab.image_url} alt={ab.title} />
                  : <div className="airbnb-img-placeholder">{PLACEHOLDERS[i % PLACEHOLDERS.length]}</div>
                }
                {myVote && <div className="airbnb-voted-badge">✓ Your Pick</div>}
              </div>

              <div className="airbnb-body">
                <div className="airbnb-name" data-element="airbnb-title">{ab.title}</div>
                {ab.location && <div className="airbnb-loc">📍 {ab.location}</div>}

                <div className="airbnb-meta">
                  <span className="airbnb-sleeps">🛏 Sleeps {ab.sleeps}</span>
                  {ab.price_per_night > 0 && (
                    <span className="airbnb-price">${ab.price_per_night}/night</span>
                  )}
                </div>

                {ab.total_price > 0 && (
                  <div className="airbnb-total">
                    💰 ${ab.total_price.toLocaleString()} total · {nights} nights
                  </div>
                )}

                {ab.description && (
                  <div className="airbnb-desc">{ab.description}</div>
                )}

                <div className="airbnb-actions">
                  <button
                    className={`airbnb-vote-btn ${myVote ? 'voted' : ''}`}
                    onClick={() => handleVote(ab)}
                    data-action="vote-airbnb"
                  >
                    {myVote ? '🗳️ Voted' : '🗳️ Vote'}
                    {voteCount > 0 && (
                      <span className="airbnb-vote-count"> · {voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
                    )}
                  </button>

                  {ab.url && (
                    <a
                      href={ab.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="airbnb-link"
                      data-action="view-airbnb"
                    >
                      View ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {airbnbs.length === 0 && (
        <div className="airbnb-empty">
          <p>No stays added yet. Add Airbnb options in the Supabase dashboard → airbnbs table.</p>
        </div>
      )}
    </div>
  )
}
