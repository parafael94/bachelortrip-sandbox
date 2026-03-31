import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'

export const VOTE_BUDGET = 500

export function useVotes(eventId, eventCost = 0) {
  const { user } = useAuth()
  const [votes, setVotes] = useState([])

  useEffect(() => {
    if (!eventId) return
    fetchVotes()

    const channel = supabase
      .channel(`votes-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchVotes)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [eventId])

  async function fetchVotes() {
    const { data } = await supabase
      .from('votes')
      .select('*')
      .eq('event_id', eventId)
    setVotes(data || [])
  }

  const myVote   = votes.find(v => v.user_id === user?.id)
  const voteCount = votes.length

  async function toggleVote(userSpent) {
    if (!user) return
    if (myVote) {
      await supabase.from('votes').delete().eq('id', myVote.id)
    } else {
      if (userSpent + eventCost > VOTE_BUDGET) return false
      await supabase.from('votes').insert({ event_id: eventId, user_id: user.id })
    }
    return true
  }

  return { votes, myVote, voteCount, toggleVote }
}

export function useUserBudget() {
  const { user } = useAuth()
  const [spent, setSpent]     = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true

    async function load() {
      await fetchSpent()
    }
    load()

    const channelName = `budget-${user.id}-${Date.now()}`
    const channel = supabase.channel(channelName)
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        if (active) fetchSpent()
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  async function fetchSpent() {
    if (!user) return
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
