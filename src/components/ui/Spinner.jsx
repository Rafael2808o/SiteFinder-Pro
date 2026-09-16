export function Spinner({ size = 32 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="animate-spin rounded-full border-2 border-slate-200 border-t-signal"
    />
  )
}
