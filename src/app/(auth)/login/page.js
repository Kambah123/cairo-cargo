'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { Package, Lock, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { signIn } from "@/app/actions/auth"

export default function LoginPage() {
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(formData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/3 blur-[150px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-accent flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-bg" />
          </div>
          <h1 className="text-xl font-bold text-fg tracking-tight">Cairo Cargo</h1>
          <p className="text-sm text-fg-muted mt-1">Staff Portal — Authorized Access Only</p>
        </div>

        {/* Form */}
        <div className="rounded-[var(--radius-xl)] bg-surface-1 border border-surface-3/60 p-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint w-4 h-4" />
                <input
                  name="email"
                  type="email"
                  placeholder="staff@cairocargo.com"
                  className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint w-4 h-4" />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-[var(--radius-md)] bg-error/10 border border-error/20">
                <p className="text-xs text-error text-center">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-11 mt-2">
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
