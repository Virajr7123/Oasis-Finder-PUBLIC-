"use client"

import Link from "next/link"
import { Leaf, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import ThemeToggle from "./theme-toggle"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

export default function SiteHeader() {
  const { theme, mounted } = useTheme()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const auth = getFirebaseAuth()

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [auth])

  async function handleSignOut() {
    if (!auth) return
    await signOut(auth)
    window.location.assign("/auth/sign-in")
  }

  if (!mounted) {
    return (
      <header className="w-full bg-[#F7FAFC]/80 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[#F7FAFC]/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold text-[#2D3748]">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#4FD1C5]" />
            </div>
            <span>Sweet Spott</span>
          </div>
          <div className="w-16 h-8 rounded-full bg-slate-200 animate-pulse" />
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        "w-full sticky top-0 z-30 backdrop-blur border-b transition-all duration-300",
        theme === "dark"
          ? "bg-[#1a1a1a]/95 border-[#374151] shadow-lg"
          : "bg-[#F7FAFC]/80 supports-[backdrop-filter]:bg-[#F7FAFC]/70 border-slate-200",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-lg font-semibold transition-colors duration-300",
            theme === "dark" ? "text-white" : "text-[#2D3748]", // Made white in dark mode
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full border shadow-sm flex items-center justify-center transition-all duration-300",
              theme === "dark"
                ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                : "bg-white border-slate-200",
            )}
          >
            <Leaf className="w-4 h-4 text-[#4FD1C5]" />
          </div>
          <span>Sweet Spott</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!user ? (
            <>
              <Link href="/auth/sign-in">
                <Button
                  variant="ghost"
                  className={cn(
                    "transition-colors duration-300",
                    theme === "dark"
                      ? "text-[#f5f5f5] hover:bg-[#2a2a2a] hover:text-white"
                      : "text-[#2D3748] hover:bg-slate-100",
                  )}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="rounded-xl bg-[#4FD1C5] hover:bg-[#3bb9ad] text-[#2D3748] font-medium">
                  Create Account
                </Button>
              </Link>
            </>
          ) : (
            <>
              <span
                className={cn(
                  "hidden sm:block text-sm mr-1 transition-colors duration-300",
                  theme === "dark" ? "text-[#d1d5db]" : "text-[#718096]",
                )}
              >
                {user.displayName || user.email}
              </span>
              <Button
                variant="outline"
                className={cn(
                  "rounded-xl font-medium transition-all duration-300",
                  theme === "dark"
                    ? "border-[#374151] text-[#f5f5f5] bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] hover:from-[#3a3a3a] hover:to-[#2a2a2a] hover:text-white"
                    : "border-slate-300 text-[#2D3748] bg-transparent hover:bg-slate-50",
                )}
                onClick={() => setOpen(true)}
              >
                Submit a Spot
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className={cn(
                  "transition-all duration-300 font-medium", // Made brighter and added font-medium
                  theme === "dark"
                    ? "text-[#f5f5f5] hover:bg-[#2a2a2a] hover:text-white" // Bright text like Submit a Spot
                    : "text-[#2D3748] hover:bg-slate-100",
                )}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "sm:max-w-md transition-all duration-300",
            theme === "dark"
              ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
              : "bg-white border-slate-200",
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn("transition-colors duration-300", theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]")}
            >
              {"Submit a New Quiet Spot"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Place name" />
            <Input placeholder="Address" />
            <div className="flex gap-3">
              <Input placeholder="Category (e.g., Park, Library)" />
              <Input placeholder="Approx. distance (m)" />
            </div>
            <Textarea placeholder="Short description (optional)" />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className={cn(
                "rounded-xl font-medium",
                theme === "dark"
                  ? "border-[#374151] text-[#f5f5f5] bg-transparent hover:bg-[#2a2a2a]"
                  : "border-slate-300 text-[#2D3748] bg-transparent hover:bg-slate-50",
              )}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-[#4FD1C5] hover:bg-[#3bb9ad] text-[#2D3748] font-medium"
              onClick={() => setOpen(false)}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
