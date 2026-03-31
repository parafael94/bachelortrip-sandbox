import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { DEFAULT_EVENTS, DAYS } from '../constants'

export function useEvents() {
  const [events, setEvents] = useState({ d0: [], d1: [], d2: [], d3: [], d4: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()

    // Real-time subscription — any change to events table updates all clients instantly
    const channel = supabase
      .channel('events-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('time', { ascending: true })

    if (error || !data?.length) {
      // Seed with defaults if table is empty
      setEvents(DEFAULT_EVENTS)
      setLoading(false)
      return
    }

    // Group by day key
    const grouped = { d0: [], d1: [], d2: [], d3: [], d4: [] }
    data.forEach(ev => {
      if (grouped[ev.day_key] !== undefined) grouped[ev.day_key].push(ev)
    })
    setEvents(grouped)
    setLoading(false)
  }

  async function addEvent(dayKey, ev) {
    const { error } = await supabase.from('events').insert({ ...ev, day_key: dayKey })
    if (error) console.error(error)
  }

  async function updateEvent(id, updates) {
    const { error } = await supabase.from('events').update(updates).eq('id', id)
    if (error) console.error(error)
  }

  async function deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) console.error(error)
  }

  async function seedDefaults() {
    const rows = []
    DAYS.forEach(d => {
      DEFAULT_EVENTS[d.key].forEach(ev => {
        rows.push({ ...ev, day_key: d.key })
      })
    })
    await supabase.from('events').upsert(rows, { onConflict: 'id' })
  }

  return { events, loading, addEvent, updateEvent, deleteEvent, seedDefaults }
}
