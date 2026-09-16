// Brand mark: a location pin with a signal — "find the business that
// doesn't have a signal (site) yet". Pin in currentColor, signal dot in
// `accent` (defaults to the brand amber). One glyph, reads at any size.
export function Logo({ size = 22, className = '', accent = '#E8A33D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M15 6C10.8 6 7.4 9.3 7.4 13.4C7.4 19.2 15 27 15 27C15 27 22.6 19.2 22.6 13.4C22.6 9.3 19.2 6 15 6Z"
        fill="currentColor"
      />
      <circle cx="21.5" cy="8.5" r="4.3" fill={accent} />
    </svg>
  )
}
