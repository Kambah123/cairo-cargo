import * as React from "react"

const statusConfig = {
  received:   { bg: "bg-accent/10",  text: "text-accent",  dot: "bg-accent",  label: "Received" },
  packed:     { bg: "bg-accent/10",  text: "text-accent",  dot: "bg-accent",  label: "Packed" },
  awaiting:   { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", label: "Awaiting" },
  awaiting_shipment: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", label: "Awaiting" },
  shipped:    { bg: "bg-[#a78bfa]/10", text: "text-[#a78bfa]", dot: "bg-[#a78bfa]", label: "Shipped" },
  arrived:    { bg: "bg-info/10",    text: "text-info",    dot: "bg-info",    label: "Arrived" },
  delivered:  { bg: "bg-success/10", text: "text-success", dot: "bg-success", label: "Delivered" },
  hold:       { bg: "bg-error/10",   text: "text-error",   dot: "bg-error",   label: "On Hold" },
  open:       { bg: "bg-accent/10",  text: "text-accent",  dot: "bg-accent",  label: "Open" },
  sealed:     { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", label: "Sealed" },
  unpacked:   { bg: "bg-fg-muted/10", text: "text-fg-muted", dot: "bg-fg-muted", label: "Unpacked" },
}

const fallback = { bg: "bg-surface-2", text: "text-fg-muted", dot: "bg-fg-faint", label: "Unknown" }

export function StatusChip({ status, label, className = "" }) {
  const config = statusConfig[status?.toLowerCase()] || fallback

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.label || status}
    </span>
  )
}
