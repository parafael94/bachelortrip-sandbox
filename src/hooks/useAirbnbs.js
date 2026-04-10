import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'

export function useAirbnbs() {
  const { user } = useAuth()
  const [airbnbs, setAirbnbs] = useState([])
  const [votes, setVotes]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()

    const channel = supabase
      .channel('airbnb-votes-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'airbnb_votes' }, fetchVotes)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchAll() {
    const [{ data: ab }, { data: av }] = await Promise.all([
      supabase.from('airbnbs').select('*').order('sort_order'),
      supabase.from('airbnb_votes').select('*'),
    ])
    setAirbnbs(ab || [])
    setVotes(av || [])
    setLoading(false)
  }

  async function fetchVotes() {
    const { data } = await supabase.from('airbnb_votes').select('*')
    setVotes(data || [])
  }

  function getVotesFor(airbnbId) {
    return votes.filter(v => v.airbnb_id === airbnbId)
  }

  function getMyVote(airbnbId) {
    return votes.find(v => v.airbnb_id === airbnbId && v.user_id === user?.id)
  }

  async function toggleVote(airbnbId) {
    if (!user) return
    const myVote = getMyVote(airbnbId)
    if (myVote) {
      await supabase.from('airbnb_votes').delete().eq('id', myVote.id)
    } else {
      await supabase.from('airbnb_votes').insert({ airbnb_id: airbnbId, user_id: user.id })
    }
  }

  return { airbnbs, votes, loading, getVotesFor, getMyVote, toggleVote }
}
