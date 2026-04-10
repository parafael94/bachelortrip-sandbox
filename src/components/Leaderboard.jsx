import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { CATS } from '../constants'

export default function Leaderboard() {
  const [topActivities, setTopActivities] = useState([])
  const [topAirbnbs, setTopAirbnbs]       = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    const [{ data: voteRows }, { data: avRows }] = await Promise.all([
      supabase.from('votes').select('event_id, events(id, title, category, cost)'),
      supabase.from('airbnb_votes').select('airbnb_id, airbnbs(id, title, location)'),
    ])

    // Aggregate activity votes
    const evMap = {}
    voteRows?.forEach(v => {
      if (!v.events) return
      const id = v.event_id
      if (!evMap[id]) evMap[id] = { ...v.events, count: 0 }
      evMap[id].count++
    })
    setTopActivities(
      Object.values(evMap).sort((a, b) => b.count - a.count).slice(0, 5)
    )

    // Aggregate airbnb votes
    const abMap = {}
    avRows?.forEach(v => {
      if (!v.airbnbs) return
      const id = v.airbnb_id
      if (!abMap[id]) abMap[id] = { ...v.airbnbs, count: 0 }
      abMap[id].count++
    })
    setTopAirbnbs(
      Object.values(abMap).sort((a, b) => b.count - a.count).slice(0, 5)
    )

    setLoading(false)
  }

  if (loading) return null

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

  return (
    <div className="leaderboard" data-component="Leaderboard">
      <div className="lb-grid">

        {/* Activity Leaderboard */}
        <div className="lb-section" data-element="activity-leaderboard">
          <h4 className="lb-heading">🗳️ Top Voted Activities</h4>
          {topActivities.length === 0 ? (
            <p className="lb-empty">No votes yet — go cast some!</p>
          ) : (
            <div className="lb-list">
              {topActivities.map((ev, i) => {
                const cat = CATS[ev.category] || CATS.party
                return (
                  <div key={ev.id} className="lb-row">
                    <span className="lb-medal">{medals[i]}</span>
                    <span className="lb-dot" style={{ background: cat.color }} />
                    <span className="lb-name">{ev.title.replace(/^[^\w\s]+\s*/, '').slice(0, 36)}</span>
                    <span className="lb-count">{ev.count} vote{ev.count !== 1 ? 's' : ''}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Airbnb Leaderboard */}
        <div className="lb-section" data-element="airbnb-leaderboard">
          <h4 className="lb-heading">🏠 Top Voted Stays</h4>
          {topAirbnbs.length === 0 ? (
            <p className="lb-empty">No Airbnb votes yet!</p>
          ) : (
            <div className="lb-list">
              {topAirbnbs.map((ab, i) => (
                <div key={ab.id} className="lb-row">
                  <span className="lb-medal">{medals[i]}</span>
                  <span className="lb-dot" style={{ background: '#2980b9' }} />
                  <span className="lb-name">{ab.title.slice(0, 36)}</span>
                  <span className="lb-count">{ab.count} vote{ab.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
