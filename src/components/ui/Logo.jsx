// Brand mark: a browser window fused with a map-pin tip — "find the site
// that doesn't exist yet". One flat silhouette in currentColor; the tab-bar
// notch is cut as negative space using `accent`, which must match whatever
// sits directly behind the mark (the teal-700 sidebar tile, or white for the
// standalone favicon/light-background use) so it reads as a true cutout
// rather than a mismatched patch.
export function Logo({ size = 22, className = '', accent = '#ffffff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="5" y="5" width="22" height="16" rx="3" fill="currentColor" />
      <path d="M13 21 H19 L16 27.5 Z" fill="currentColor" />
      <rect x="5" y="9" width="22" height="1.6" fill={accent} />
      <circle cx="8.6" cy="7.2" r="1" fill={accent} />
      <circle cx="11.8" cy="7.2" r="1" fill={accent} />
    </svg>
  )
}
