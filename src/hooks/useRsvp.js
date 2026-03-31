import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'

export function useRsvp(eventId) {
  const { user } = useAuth()
  const [rsvps, setRsvps] = useState([])

  useEffect(() => {
    if (!eventId) return
    fetchRsvps()

    const channel = supabase
      .channel(`rsvp-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, fetchRsvps)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [eventId])

  async function fetchRsvps() {
    const { data } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', eventId)
    setRsvps(data || [])
  }

  async function toggleRsvp(status) {
    if (!user) return
    const existing = rsvps.find(r => r.user_id === user.id)
    if (existing) {
      const next = existing.status === status ? 'unset' : status
      await supabase.from('rsvps').update({ status: next }).eq('id', existing.id)
    } else {
      await supabase.from('rsvps').insert({ event_id: eventId, user_id: user.id, status })
    }
  }

  const myRsvp   = rsvps.find(r => r.user_id === user?.id)
  const yesCount = rsvps.filter(r => r.status === 'yes').length

  return { rsvps, myRsvp, yesCount, toggleRsvp }
}
