import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🎉</div>
        <h1>Bachelor Trip</h1>
        <p className="login-sub">San Juan, Puerto Rico · Sep 3–7, 2026</p>

        {sent ? (
          <div className="sent-msg">
            <div className="sent-icon">📧</div>
            <p>Magic link sent to <strong>{email}</strong></p>
            <p className="sent-note">Check your inbox and click the link to join the crew.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Your Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" disabled={loading} className="btn-magic">
              {loading ? 'Sending…' : '✉️ Send Magic Link'}
            </button>
            <p className="login-note">No password needed — we'll email you a one-click sign-in link.</p>
          </form>
        )}
      </div>
    </div>
  )
}
