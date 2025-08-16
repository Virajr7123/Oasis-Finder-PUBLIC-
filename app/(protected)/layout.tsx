"use client"

import { type ReactNode, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import { Leaf } from "lucide-react"

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const auth = getFirebaseAuth()
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname || "/")}`)
    })
    return () => unsub()
  }, [auth, pathname, router])

  if (user === undefined) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F7FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E6FFFA] grid place-items-center">
            <Leaf className="w-7 h-7 text-[#4FD1C5] animate-pulse" />
          </div>
          <p className="text-[#718096]">Checking your session…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
