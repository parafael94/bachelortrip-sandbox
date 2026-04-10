import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'

const STATUS = {
  yes:   { label: "I'm In!",       icon: '✈️', cls: 'yes' },
  no:    { label: "Can't Make It", icon: '😢', cls: 'no'  },
  unset: { label: 'Undecided',     icon: '❓', cls: ''    },
}

export default function CrewList() {
  const { user } = useAuth()
  const [crew, setCrew] = useState([])

  useEffect(() => {
    fetchCrew()

    const channel = supabase
      .channel('crew-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchCrew)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchCrew() {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, airport_code, trip_rsvp')
      .order('created_at', { ascending: true })
    setCrew(data || [])
  }

  const going    = crew.filter(p => p.trip_rsvp === 'yes')
  const cant     = crew.filter(p => p.trip_rsvp === 'no')
  const undecided= crew.filter(p => !p.trip_rsvp || p.trip_rsvp === 'unset')

  return (
    <div className="crew-section" data-component="CrewList">
      <h3 className="crew-title">👥 The Crew</h3>

      <div className="crew-summary">
        <div className="crew-stat going">
          <span className="cs-num">{going.length}</span>
          <span className="cs-lbl">✈️ Going</span>
        </div>
        <div className="crew-stat undecided">
          <span className="cs-num">{undecided.length}</span>
          <span className="cs-lbl">❓ Undecided</span>
        </div>
        <div className="crew-stat cant">
          <span className="cs-num">{cant.length}</span>
          <span className="cs-lbl">😢 Can't Make It</span>
        </div>
      </div>

      <div className="crew-grid">
        {crew.map(p => {
          const rsvp = STATUS[p.trip_rsvp || 'unset']
          const isMe = p.id === user?.id
          const initials = p.name
            ? p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            : '?'

          return (
            <div key={p.id} className={`crew-card rsvp-${rsvp.cls} ${isMe ? 'me' : ''}`} data-element="crew-member">
              <div className="crew-avatar">{initials}</div>
              <div className="crew-info">
                <div className="crew-name">
                  {p.name || 'Anonymous'}
                  {isMe && <span className="crew-you">you</span>}
                </div>
                {p.airport_code && (
                  <div className="crew-airport">✈ {p.airport_code}</div>
                )}
              </div>
              <div className={`crew-rsvp-badge ${rsvp.cls}`}>
                {rsvp.icon} {rsvp.label}
              </div>
            </div>
          )
        })}

        {crew.length === 0 && (
          <p className="crew-empty">No crew members yet — share the link!</p>
        )}
      </div>
    </div>
  )
}
