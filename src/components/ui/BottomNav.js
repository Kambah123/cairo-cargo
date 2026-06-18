import * as React from "react"
import Link from "next/link"
import { Home, Package, Search, Settings, Box } from "lucide-react"

export function BottomNav({ currentPath = "/dashboard" }) {
  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Shipments", href: "/shipments", icon: Package },
    { name: "Sacks", href: "/sacks", icon: Box },
    { name: "Search", href: "/search", icon: Search },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface-bright border-t border-outline flex items-center justify-around z-50">
      {navItems.map((item) => {
        const isActive = currentPath.startsWith(item.href)
        const activeClass = isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
        
        return (
          <Link 
            key={item.name} 
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 touch-target ${activeClass}`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
