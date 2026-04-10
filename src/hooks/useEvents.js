import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { DEFAULT_EVENTS, DAYS } from '../constants'

export function useEvents() {
  const [events, setEvents]   = useState({ d0: [], d1: [], d2: [], d3: [], d4: [] })
  const [loading, setLoading] = useState(true)
  const [dbReady, setDbReady] = useState(true)   // false = events are in-memory only
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    fetchEvents()

    const channel = supabase
      .channel('events-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('time', { ascending: true })

    if (error) console.error('fetchEvents error:', error.message)

    if (!data?.length) {
      // DB is empty — show in-memory defaults but flag as not synced
      setEvents(DEFAULT_EVENTS)
      setDbReady(false)
      setLoading(false)
      return
    }

    const grouped = { d0: [], d1: [], d2: [], d3: [], d4: [] }
    data.forEach(ev => { if (grouped[ev.day_key] !== undefined) grouped[ev.day_key].push(ev) })
    setEvents(grouped)
    setDbReady(true)
    setLoading(false)
  }

  // Called manually via the sync banner — pushes all default events to Supabase
  async function seedDefaults() {
    setSeeding(true)
    const rows = []
    DAYS.forEach(d => {
      ;(DEFAULT_EVENTS[d.key] || []).forEach(ev => {
        rows.push({
          id:         ev.id,
          day_key:    d.key,
          time:       ev.time,
          category:   ev.category,
          title:      ev.title,
          location:   ev.location  || '',
          notes:      ev.notes     || '',
          cost:       ev.cost      || 0,
          duration:   ev.duration  || 60,
          links:      ev.links     || [],
          sort_order: 0,
        })
      })
    })

    const { error } = await supabase.from('events').upsert(rows, { onConflict: 'id' })
    if (error) {
      console.error('Seed error:', error.message)
      setSeeding(false)
      return
    }

    await fetchEvents()
    setSeeding(false)
  }

  async function addEvent(dayKey, ev) {
    const { error } = await supabase.from('events').insert({ ...ev, day_key: dayKey })
    if (error) console.error('addEvent error:', error.message)
  }

  async function updateEvent(id, updates) {
    const { error } = await supabase.from('events').update(updates).eq('id', id)
    if (error) console.error('updateEvent error:', error.message)
  }

  async function deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) console.error('deleteEvent error:', error.message)
  }

  return { events, loading, dbReady, seeding, seedDefaults, addEvent, updateEvent, deleteEvent }
}
