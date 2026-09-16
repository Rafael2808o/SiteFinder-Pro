export function Input({ label, className = '', id, ...rest }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-500">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal/15 ${className}`}
        {...rest}
      />
    </div>
  )
}
