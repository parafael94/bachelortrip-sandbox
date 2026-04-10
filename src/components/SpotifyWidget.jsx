import { useState } from 'react'

// Replace PLAYLIST_ID with your actual Spotify playlist ID.
// To find it: open the playlist on Spotify → Share → Copy link
// The ID is the string after /playlist/ and before any ?
// e.g. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M → ID is 37i9dQZF1DXcBWIGoYBM5M
const PLAYLIST_ID = '23CNxzbAq31je2JSFSoE8d'

const HAS_PLAYLIST = PLAYLIST_ID !== 'YOUR_PLAYLIST_ID_HERE'

export default function SpotifyWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className={`spotify-widget ${open ? 'expanded' : ''}`} data-component="SpotifyWidget">
      <button
        className="spotify-toggle"
        onClick={() => setOpen(o => !o)}
        data-action="toggle-spotify"
        title={open ? 'Hide music player' : 'Play trip playlist'}
      >
        <span className="spotify-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </span>
        <span className="spotify-label">{open ? 'Hide Player' : '🎵 Trip Playlist'}</span>
        <span className="spotify-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="spotify-player">
          {HAS_PLAYLIST ? (
            <iframe
              src={`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              style={{ border: 'none' }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Trip Playlist"
            />
          ) : (
            <div className="spotify-placeholder">
              <p>🎵 Add your playlist ID in <code>SpotifyWidget.jsx</code></p>
              <p className="spotify-placeholder-sub">Spotify → playlist → Share → Copy link → grab the ID after /playlist/</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
