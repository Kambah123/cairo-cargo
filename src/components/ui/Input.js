import * as React from "react"

const Input = React.forwardRef(({ className = "", label, type, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">{label}</label>
      )}
      <input
        type={type}
        className={`flex h-11 w-full rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 px-3.5 py-2 text-sm text-fg placeholder:text-fg-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent/50 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 ${className}`}
        ref={ref}
        {...props}
      />
    </div>
  )
})
Input.displayName = "Input"

export { Input }
