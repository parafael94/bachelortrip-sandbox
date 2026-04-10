import { DAYS, CATS, TRIP_START } from '../constants'
import Leaderboard from './Leaderboard'
import CrewList from './CrewList'

export default function Overview({ events }) {
  const totalEvents = DAYS.reduce((s, d) => s + (events[d.key]?.length || 0), 0)
  const totalCost   = DAYS.reduce((s, d) => s + (events[d.key] || []).reduce((ss, e) => ss + (e.cost || 0), 0), 0)
  const daysLeft    = Math.ceil((TRIP_START - new Date()) / 864e5)

  const catCounts = {}
  Object.values(CATS).forEach(c => { catCounts[c.label] = 0 })
  DAYS.forEach(d => (events[d.key] || []).forEach(e => {
    const c = CATS[e.category]
    if (c) catCounts[c.label]++
  }))
  const maxCat = Math.max(1, ...Object.values(catCounts))

  return (
    <div data-component="Overview">

      {/* ── CREW ── */}
      <CrewList />

      {/* ── LEADERBOARD ── */}
      <Leaderboard />

      {/* ── STATS ── */}
      <div className="overview-stats" data-component="OverviewStats">
        <div className="stat-card" data-element="stat-total-events"><div className="sv">{totalEvents}</div><div className="sl">Total Events</div></div>
        <div className="stat-card" data-element="stat-total-cost"><div className="sv">${totalCost.toLocaleString()}</div><div className="sl">Est. Total Cost</div></div>
        <div className="stat-card" data-element="stat-days-left"><div className="sv">{daysLeft > 0 ? daysLeft : '🎉'}</div><div className="sl">Days Until Trip</div></div>
        <div className="stat-card" data-element="stat-days-fun"><div className="sv">5</div><div className="sl">Days of Fun</div></div>
      </div>

      {/* ── DAY GRID ── */}
      <div className="overview-grid" data-component="OverviewGrid">
        {DAYS.map((d, i) => {
          const sorted = (events[d.key] || []).slice().sort((a, b) => a.time.localeCompare(b.time))
          const dayCost = sorted.reduce((s, e) => s + (e.cost || 0), 0)
          return (
            <div key={d.key} className="ov-day" data-element="overview-day" data-day={d.key}>
              <div className="ov-day-header">{d.short}<br />{d.date}</div>
              <div className="ov-day-body">
                {sorted.map(ev => {
                  const cat = CATS[ev.category] || CATS.party
                  return (
                    <div key={ev.id} className="ov-event" style={{ borderLeftColor: cat.color, background: cat.color + '18' }}>
                      <div className="oe-time">{ev.time}</div>
                      <div className="oe-title">{ev.title.replace(/^[^\w\s]+\s*/, '').slice(0, 34)}</div>
                    </div>
                  )
                })}
                {sorted.length === 0 && <div className="ov-empty">Nothing planned</div>}
              </div>
              {dayCost > 0 && <div className="ov-day-cost">💰 ${dayCost.toLocaleString()}/person est.</div>}
            </div>
          )
        })}
      </div>

      {/* ── CATEGORY BREAKDOWN ── */}
      <div className="cat-breakdown" data-component="CategoryBreakdown">
        <h4>Activity Breakdown</h4>
        {Object.entries(catCounts).map(([label, count]) => {
          const cat = Object.values(CATS).find(c => c.label === label)
          return (
            <div key={label} className="cat-bar-row" data-element="cat-bar">
              <div className="cat-bar-label">{cat?.icon} {label}</div>
              <div className="cat-bar-track">
                <div className="cat-bar-fill" style={{ width: `${Math.round(count / maxCat * 100)}%`, background: cat?.color || '#888' }} />
              </div>
              <div className="cat-bar-count">{count}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
