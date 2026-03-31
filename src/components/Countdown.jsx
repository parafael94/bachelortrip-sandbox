import { useState, useEffect } from 'react'

export default function Countdown({ tripStart }) {
  const [time, setTime] = useState(getTimeLeft())
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('cd_dismissed') === '1')

  function getTimeLeft() {
    const diff = tripStart - new Date()
    if (diff <= 0) return null
    return {
      days:  Math.floor(diff / 864e5),
      hours: Math.floor((diff % 864e5) / 36e5),
      mins:  Math.floor((diff % 36e5)  / 6e4),
      secs:  Math.floor((diff % 6e4)   / 1000),
    }
  }

  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(t)
  }, [])

  if (dismissed) return null

  if (!time) {
    return (
      <div className="countdown-bar tripday">
        🎉 IT'S TRIP DAY! Welcome to San Juan! Vamos! 🎉
        <button className="cd-dismiss" onClick={() => { setDismissed(true); localStorage.setItem('cd_dismissed','1') }}>✕</button>
      </div>
    )
  }

  return (
    <div className="countdown-bar">
      <span className="cd-label">⏳ Trip starts in</span>
      <span className="cd-unit">{String(time.days).padStart(2,'0')}</span><span className="cd-label">d</span>
      <span className="cd-unit">{String(time.hours).padStart(2,'0')}</span><span className="cd-label">h</span>
      <span className="cd-unit">{String(time.mins).padStart(2,'0')}</span><span className="cd-label">m</span>
      <span className="cd-unit">{String(time.secs).padStart(2,'0')}</span><span className="cd-label">s</span>
      <button className="cd-dismiss" onClick={() => { setDismissed(true); localStorage.setItem('cd_dismissed','1') }}>✕</button>
    </div>
  )
}
