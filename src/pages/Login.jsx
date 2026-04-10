import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { fsPage, fsAuthMagicLinkSent } from '../lib/fullstory'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    fsPage({ pageName: 'Login' })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
      fsAuthMagicLinkSent()
    }
    setLoading(false)
  }

  return (
    <div className="login-page" data-component="LoginPage">
      <div className="login-card">
        <div className="login-icon">🎉</div>
        <h1>Bachelor Trip</h1>
        <p className="login-sub">San Juan, Puerto Rico · Sep 3–7, 2026</p>

        {sent ? (
          <div className="sent-msg" data-element="magic-link-sent">
            <div className="sent-icon">📧</div>
            <p>Magic link sent to <strong className="fs-mask">{email}</strong></p>
            <p className="sent-note">Check your inbox and click the link to join the crew.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form" data-component="LoginForm">
            <label htmlFor="email">Your Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="fs-mask"
              data-element="email-input"
            />
            {error && <p className="form-error" data-element="auth-error">{error}</p>}
            <button type="submit" disabled={loading} className="btn-magic" data-action="send-magic-link">
              {loading ? 'Sending…' : '✉️ Send Magic Link'}
            </button>
            <p className="login-note">No password needed — we'll email you a one-click sign-in link.</p>
          </form>
        )}
      </div>
    </div>
  )
}
