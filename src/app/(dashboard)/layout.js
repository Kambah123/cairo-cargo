"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PackagePlus, Box, Search, Settings, LogOut, Package, ShieldCheck } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { getCurrentUserProfile } from "@/lib/supabase/api"

const baseNavItems = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { href: "/shipments/new", icon: PackagePlus,     label: "New Shipment" },
  { href: "/sacks",         icon: Box,             label: "Sacks" },
  { href: "/search",        icon: Search,          label: "Search" },
  { href: "/settings",      icon: Settings,        label: "Settings" },
]

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* ── Sidebar (Desktop) ── */}
      <Sidebar />

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6 lg:p-10">
          {children}
        </div>
      </main>

      {/* ── Bottom Bar (Mobile) ── */}
      <MobileNav />
    </div>
  )
}

function Sidebar() {
  const pathname = usePathname()
  const [navItems, setNavItems] = useState(baseNavItems)

  useEffect(() => {
    getCurrentUserProfile().then(profile => {
      if (profile?.role === 'admin') {
        setNavItems([
          ...baseNavItems,
          { href: "/admin/users", icon: ShieldCheck, label: "Admin" }
        ])
      }
    })
  }, [])

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-surface-3/60 bg-surface-0">
      {/* Brand */}
      <div className="p-6 pb-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-accent flex items-center justify-center">
            <Package className="w-5 h-5 text-bg" />
          </div>
          <div>
            <p className="text-base font-bold text-fg tracking-tight leading-none">Cairo Cargo</p>
            <p className="text-[11px] text-fg-faint mt-0.5">Management System</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-fg-muted hover:text-fg hover:bg-surface-2"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-accent" : "text-fg-faint group-hover:text-fg-muted"}`} />
              {item.label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-surface-3/60">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-fg-muted hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

function MobileNav() {
  const pathname = usePathname()
  const [mobileItems, setMobileItems] = useState(baseNavItems.slice(0, 4))

  useEffect(() => {
    getCurrentUserProfile().then(profile => {
      if (profile?.role === 'admin') {
        // Option to include admin tab on mobile if desired, or leave at 4 core items
        // Since mobile space is limited, we stick to 4 items + maybe a 5th menu
        setMobileItems([
          ...baseNavItems.slice(0, 3),
          { href: "/admin/users", icon: ShieldCheck, label: "Admin" }
        ])
      }
    })
  }, [])

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-0 border-t border-surface-3/60 flex">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
              isActive ? "text-accent" : "text-fg-faint"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label.split(" ").pop()}
          </Link>
        )
      })}
    </nav>
  )
}
