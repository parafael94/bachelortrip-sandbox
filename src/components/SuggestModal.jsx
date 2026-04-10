import { useState } from 'react'
import { DAYS } from '../constants'
import { useSuggestions } from '../hooks/useSuggestions'

const CATS = ['party','food','activity','stay','transport','rest']
const CAT_LABELS = { party:'🍻 Party / Nightlife', food:'🍽️ Food & Drinks', activity:'🎯 Activity / Adventure', stay:'🏨 Accommodation', transport:'🚗 Transport', rest:'💤 Rest / Free Time' }

export default function SuggestModal({ onClose }) {
  const { submitSuggestion } = useSuggestions()
  const [form, setForm] = useState({ title: '', day_key: 'd0', time: '12:00', category: 'activity', location: '', notes: '', cost: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState('')

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit() {
    if (!form.title.trim()) { setError('Name is required.'); return }
    setSaving(true)
    const ok = await submitSuggestion({ ...form, cost: parseFloat(form.cost) || 0, title: form.title.trim() })
    setSaving(false)
    if (!ok) { setError('Could not submit — try again.'); return }
    setDone(true)
    setTimeout(onClose, 1400)
  }

  const activeDays = DAYS.filter(d => !d.travelDay)

  return (
    <div className="overlay" onClick={e => e.target.classList.contains('overlay') && onClose()}>
      <div className="evt-modal" data-component="SuggestModal">
        <div className="modal-heading">💡 Suggest an Event</div>
        <p className="suggest-sub">Your idea goes to the crew for review. Anyone can add it to the itinerary.</p>

        {done ? (
          <div className="suggest-done">✅ Suggestion submitted! The crew will see it in Overview.</div>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Day</label>
                <select value={form.day_key} onChange={set('day_key')}>
                  {activeDays.map(d => <option key={d.key} value={d.key}>{d.short} · {d.date}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" value={form.time} onChange={set('time')} />
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={set('category')}>
                {CATS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Event Name *</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Beach volleyball at Condado" maxLength={100} autoFocus className={error ? 'field-error' : ''} />
              {error && <p className="form-error">{error}</p>}
            </div>

            <div className="form-group">
              <label>Location</label>
              <input type="text" value={form.location} onChange={set('location')} placeholder="e.g. Condado Beach" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Est. Cost (USD)</label>
                <input type="number" value={form.cost} onChange={set('cost')} placeholder="0" min="0" />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea value={form.notes} onChange={set('notes')} placeholder="Why should we do this? Any links or details…" />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-save" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Submitting…' : '💡 Submit Suggestion'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
