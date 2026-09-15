export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="animate-spin rounded-full border-2 border-slate-200 border-t-teal-600"
    />
  )
}
