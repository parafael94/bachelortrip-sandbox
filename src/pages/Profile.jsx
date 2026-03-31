import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

const AIRPORTS = [
  'JFK','LGA','EWR','BOS','PHL','DCA','IAD','BWI','MIA','FLL',
  'MCO','TPA','ATL','CLT','ORD','MDW','DTW','MSP','DFW','FTW',
  'IAH','DEN','PHX','LAS','LAX','SFO','SEA','RDU','PNS','SJU'
]

export default function Profile() {
  const { profile, updateProfile, signOut, user } = useAuth()
  const navigate = useNavigate()

  const [name, setName]       = useState('')
  const [city, setCity]       = useState('')
  const [airport, setAirport] = useState('')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setCity(profile.home_city || '')
      setAirport(profile.airport_code || '')
    }
  }, [profile])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await updateProfile({ name, home_city: city, airport_code: airport.toUpperCase() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); navigate('/') }, 1200)
  }

  return (
    <div className="page-wrap">
      <div className="profile-card">
        <div className="profile-avatar">{name ? name.charAt(0).toUpperCase() : '?'}</div>
        <h2>Your Profile</h2>
        <p className="profile-email">{user?.email}</p>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            <label>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mike" required />
          </div>
          <div className="form-group">
            <label>Home City</label>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. New York" />
          </div>
          <div className="form-group">
            <label>Home Airport</label>
            <input
              value={airport}
              onChange={e => setAirport(e.target.value.toUpperCase())}
              placeholder="e.g. JFK"
              maxLength={4}
              list="airport-list"
            />
            <datalist id="airport-list">
              {AIRPORTS.map(a => <option key={a} value={a} />)}
            </datalist>
          </div>

          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </form>

        <button className="btn-signout" onClick={signOut}>Sign Out</button>
      </div>
    </div>
  )
}
