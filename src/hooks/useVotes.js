import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'

export const VOTE_BUDGET = 500

// Returns all votes for a single event, plus helpers for the current user
export function useVotes(eventId, eventCost = 0) {
  const { user } = useAuth()
  const [votes, setVotes] = useState([])

  useEffect(() => {
    if (!eventId) return
    fetchVotes()

    const channel = supabase
      .channel(`votes-${eventId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'votes',
        filter: `event_id=eq.${eventId}`
      }, fetchVotes)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [eventId])

  async function fetchVotes() {
    const { data } = await supabase
      .from('votes')
      .select('*, profiles(name)')
      .eq('event_id', eventId)
    setVotes(data || [])
  }

  const myVote = votes.find(v => v.user_id === user?.id)
  const voteCount = votes.length

  async function toggleVote(userSpent) {
    if (!user) return
    if (myVote) {
      // Un-vote — always allowed
      await supabase.from('votes').delete().eq('id', myVote.id)
    } else {
      // Vote — check budget
      if (userSpent + eventCost > VOTE_BUDGET) return false
      await supabase.from('votes').insert({ event_id: eventId, user_id: user.id })
    }
    return true
  }

  return { votes, myVote, voteCount, toggleVote }
}

// Returns total $ the current user has spent across ALL events
export function useUserBudget() {
  const { user } = useAuth()
  const [spent, setSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchSpent()

    const channel = supabase
      .channel('budget-watch')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'votes',
        filter: `user_id=eq.${user.id}`
      }, fetchSpent)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  async function fetchSpent() {
    if (!user) return
    // Join votes → events to sum up costs of voted events
    const { data } = await supabase
      .from('votes')
      .select('events(cost)')
      .eq('user_id', user.id)

    const total = (data || []).reduce((s, v) => s + (v.events?.cost || 0), 0)
    setSpent(total)
    setLoading(false)
  }

  return { spent, remaining: VOTE_BUDGET - spent, loading }
}
