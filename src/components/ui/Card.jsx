export function Card({ children, className = '', ...rest }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
