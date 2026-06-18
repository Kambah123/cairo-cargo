import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

const Button = React.forwardRef(({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  const variants = {
    default: "bg-accent text-bg font-semibold hover:brightness-110 shadow-[0_0_20px_var(--color-accent-glow)]",
    secondary: "bg-surface-2 text-fg hover:bg-surface-3",
    outline: "border border-surface-3 bg-transparent text-fg hover:bg-surface-2",
    ghost: "text-fg-muted hover:text-fg hover:bg-surface-2",
    destructive: "bg-error/15 text-error hover:bg-error/25 border border-error/20",
    success: "bg-success/15 text-success hover:bg-success/25 border border-success/20",
  }

  const sizes = {
    default: "h-10 px-5 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10",
  }

  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.97]"

  return (
    <Comp
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
