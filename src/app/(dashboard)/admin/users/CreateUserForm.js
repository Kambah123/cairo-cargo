"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Loader2 } from "lucide-react"
import { createStaffUser } from "@/app/actions/admin"

export default function CreateUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createStaffUser(formData)
    
    if (!result.success) {
      setError(result.error)
      setLoading(false)
    } else {
      e.target.reset()
      setLoading(false)
      router.refresh() // Refresh to show new user in list
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs text-error bg-error/10 rounded-[var(--radius-sm)] border border-error/20">
          {error}
        </div>
      )}
      
      <div className="space-y-1">
        <label className="text-xs font-semibold text-fg-faint uppercase tracking-wider">Full Name</label>
        <input 
          name="full_name"
          required
          className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-surface-3 bg-surface-1 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
          placeholder="e.g., Ali Kambah"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-fg-faint uppercase tracking-wider">Email Address</label>
        <input 
          name="email"
          type="email"
          required
          className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-surface-3 bg-surface-1 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
          placeholder="staff@cairocargo.com"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-fg-faint uppercase tracking-wider">Temporary Password</label>
        <input 
          name="password"
          required
          minLength={6}
          className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-surface-3 bg-surface-1 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
          placeholder="Min 6 characters"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-fg-faint uppercase tracking-wider">Role</label>
          <select 
            name="role"
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-surface-3 bg-surface-1 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
          >
            <option value="cairo_staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-fg-faint uppercase tracking-wider">Branch</label>
          <select 
            name="branch"
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-surface-3 bg-surface-1 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
          >
            <option value="cairo">Cairo</option>
            <option value="kano">Kano</option>
            <option value="abuja">Abuja</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 mt-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
      </Button>
    </form>
  )
}
