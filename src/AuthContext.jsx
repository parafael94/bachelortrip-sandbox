import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { fsIdentify, fsAnonymize, fsUserProps, fsAuthSignedIn, fsAuthSignedOut } from './lib/fullstory'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fsIdentify(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fsIdentify(session.user.id)
        if (event === 'SIGNED_IN') fsAuthSignedIn()
      } else {
        setProfile(null)
        fsAnonymize()
        if (event === 'SIGNED_OUT') fsAuthSignedOut()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    // Set user properties once profile is loaded — mask PII, only send non-sensitive metadata
    if (data) {
      fsUserProps({
        has_name:         !!data.name,
        has_airport_code: !!data.airport_code,
        has_home_city:    !!data.home_city,
        airport_code:     data.airport_code || 'unknown',
      })
    }
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates })
      .select()
      .single()
    if (error) {
      console.error('updateProfile error:', error.message, '| updates:', updates)
    } else {
      setProfile(data)
    }
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
