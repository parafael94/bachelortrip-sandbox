import { useState } from 'react'
import { useSuggestions } from '../hooks/useSuggestions'
import { DAYS, CATS } from '../constants'
import SuggestModal from './SuggestModal'

export default function SuggestionBoard() {
  const { suggestions, loading, submitSuggestion, promoteSuggestion, rejectSuggestion } = useSuggestions()
  const [modalOpen, setModalOpen] = useState(false)

  if (loading) return null

  return (
    <div className="suggestions-section" data-component="SuggestionBoard">
      <div className="suggestions-header">
        <h3 className="suggestions-title">💡 Crew Suggestions</h3>
        <button className="btn-suggest" onClick={() => setModalOpen(true)} data-action="open-suggest">
          + Suggest Event
        </button>
      </div>

      {suggestions.length === 0 ? (
        <p className="suggestions-empty">No suggestions yet — be the first to pitch an idea!</p>
      ) : (
        <div className="suggestions-list">
          {suggestions.map(s => {
            const day = DAYS.find(d => d.key === s.day_key)
            const cat = CATS[s.category] || CATS.activity
            return (
              <div key={s.id} className="suggestion-card" data-element="suggestion">
                <div className="sg-left">
                  <span className="sg-icon">{cat.icon}</span>
                  <div>
                    <div className="sg-title">{s.title}</div>
                    <div className="sg-meta">
                      {day?.short} · {s.time}
                      {s.location ? ` · 📍 ${s.location}` : ''}
                      {s.cost > 0 ? ` · 💰 $${s.cost}` : ''}
                    </div>
                    {s.notes && <div className="sg-notes">{s.notes}</div>}
                    <div className="sg-by">suggested by crew member</div>
                  </div>
                </div>
                <div className="sg-actions">
                  <button className="sg-btn approve" onClick={() => promoteSuggestion(s)} data-action="approve-suggestion" title="Add to itinerary">
                    ✓ Add
                  </button>
                  <button className="sg-btn reject" onClick={() => rejectSuggestion(s.id)} data-action="reject-suggestion" title="Dismiss">
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && <SuggestModal onClose={() => setModalOpen(false)} onSubmit={submitSuggestion} />}
    </div>
  )
}
