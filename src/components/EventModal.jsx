import { useState, useEffect } from 'react'

const CATS = ['party','food','activity','stay','transport','rest']
const CAT_LABELS = { party:'🍻 Party / Nightlife', food:'🍽️ Food & Drinks', activity:'🎯 Activity / Adventure', stay:'🏨 Accommodation', transport:'🚗 Transport', rest:'💤 Rest / Free Time' }

export default function EventModal({ event, onSave, onClose }) {
  const [form, setForm] = useState({
    time: '12:00', category: 'party', title: '',
    location: '', notes: '', cost: '', duration: '60', bookingUrl: '', imageUrl: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      setForm({
        time:       event.time       || '12:00',
        category:   event.category   || 'party',
        title:      event.title      || '',
        location:   event.location   || '',
        notes:      event.notes      || '',
        cost:       event.cost != null ? String(event.cost) : '',
        duration:   event.duration   ? String(event.duration) : '60',
        bookingUrl: event.bookingUrl || '',
        imageUrl:   event.imageUrl   || '',
      })
    }
  }, [event])

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function handleSave() {
    if (!form.title.trim()) { setError('Event name is required.'); return }
    onSave({
      time:       form.time,
      category:   form.category,
      title:      form.title.trim(),
      location:   form.location.trim(),
      notes:      form.notes.trim(),
      cost:       parseFloat(form.cost) || 0,
      duration:   parseInt(form.duration) || 60,
      bookingUrl: form.bookingUrl.trim(),
      imageUrl:   form.imageUrl.trim(),
      links:      event?.links || [],
    })
  }

  return (
    <div className="overlay" onClick={e => e.target.classList.contains('overlay') && onClose()} data-component="EventModalOverlay">
      <div className="evt-modal" data-component="EventModal">
        <div className="modal-heading" data-element="modal-title">{event ? '✏️ Edit Event' : '+ Add Event'}</div>

        <div className="form-row">
          <div className="form-group">
            <label>Time</label>
            <input type="time" value={form.time} onChange={set('time')} data-element="time-input" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={set('category')} data-element="category-select">
              {CATS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Event Name *</label>
          <input
            type="text" value={form.title} onChange={set('title')}
            placeholder="e.g. Catamaran Snorkeling to Icacos Island"
            maxLength={100} autoFocus className={error ? 'field-error' : ''}
            data-element="title-input"
          />
          {error && <p className="form-error" data-element="form-error">{error}</p>}
        </div>

        <div className="form-group">
          <label>Location / Venue</label>
          <input type="text" value={form.location} onChange={set('location')} placeholder="e.g. Fajardo Marina" data-element="location-input" />
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>Cost (USD)</label>
            <input type="number" value={form.cost} onChange={set('cost')} placeholder="0" min="0" data-element="cost-input" />
          </div>
          <div className="form-group">
            <label>Duration (min)</label>
            <input type="number" value={form.duration} onChange={set('duration')} placeholder="60" min="15" data-element="duration-input" />
          </div>
          <div className="form-group">
            <label>Photo URL</label>
            <input type="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" data-element="image-url-input" />
          </div>
        </div>

        <div className="form-group">
          <label>Notes / Details</label>
          <textarea value={form.notes} onChange={set('notes')} placeholder="Reservations, dress code, tips…" data-element="notes-input" />
        </div>

        <div className="form-group">
          <label>Booking / Info Link</label>
          <input type="url" value={form.bookingUrl} onChange={set('bookingUrl')} placeholder="https://…" data-element="booking-url-input" />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} data-action="cancel-modal">Cancel</button>
          <button className="btn-save" onClick={handleSave} data-action="save-event">Save Event</button>
        </div>
      </div>
    </div>
  )
}
