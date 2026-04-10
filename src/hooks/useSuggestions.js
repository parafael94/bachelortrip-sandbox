import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'

export function useSuggestions() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuggestions()

    const channel = supabase
      .channel('suggestions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, fetchSuggestions)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchSuggestions() {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*, profiles(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) console.error('useSuggestions fetch error:', error.message)
    setSuggestions(data || [])
    setLoading(false)
  }

  async function submitSuggestion(fields) {
    if (!user) return
    const { error } = await supabase.from('suggestions').insert({ ...fields, user_id: user.id })
    if (error) console.error('submitSuggestion error:', error.message)
    return !error
  }

  async function promoteSuggestion(suggestion) {
    // Insert as real event
    const { error } = await supabase.from('events').insert({
      day_key:   suggestion.day_key,
      time:      suggestion.time,
      category:  suggestion.category,
      title:     suggestion.title,
      location:  suggestion.location  || '',
      notes:     suggestion.notes     || '',
      cost:      suggestion.cost      || 0,
      duration:  60,
      links:     [],
    })
    if (error) { console.error('promoteSuggestion error:', error.message); return }
    // Mark approved
    await supabase.from('suggestions').update({ status: 'approved' }).eq('id', suggestion.id)
  }

  async function rejectSuggestion(id) {
    await supabase.from('suggestions').update({ status: 'rejected' }).eq('id', id)
  }

  return { suggestions, loading, submitSuggestion, promoteSuggestion, rejectSuggestion }
}
