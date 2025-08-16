"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"

type Props = {
  mode: "signin" | "signup"
  className?: string
}

export default function AuthForm({ mode, className }: Props) {
  const router = useRouter()
  const next = useSearchParams().get("next") || "/"
  const auth = getFirebaseAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  function readableError(code?: string, message?: string) {
    switch (code) {
      case "auth/user-not-found":
        return "No account found for this email."
      case "auth/wrong-password":
        return "Incorrect password."
      case "auth/invalid-credential":
        return "Invalid email or password."
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later or reset your password."
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again."
      case "auth/operation-not-allowed":
        return "Email/password sign-in is not enabled for this project."
      case "auth/invalid-api-key":
        return "Invalid API key. Please check your Firebase configuration."
      case "auth/config-domain-not-whitelisted":
      case "auth/unauthorized-domain":
        return "This domain isn’t authorized for sign-in. Add this preview domain in Firebase Auth settings."
      default:
        return message || "Authentication failed. Please try again."
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) {
      setError("Authentication is unavailable right now.")
      return
    }
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      await setPersistence(auth, browserLocalPersistence)

      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() })
        }
        // Send a verification email, but let them in. We’ll show a gentle info message.
        try {
          await sendEmailVerification(cred.user)
          setInfo("Verification email sent. You can continue and verify later.")
        } catch {
          // non-fatal
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }

      router.replace(next)
    } catch (err: any) {
      // Refine wrong-password vs user-not-found for better guidance
      if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email.trim())
          if (!methods || methods.length === 0) {
            setError("No account found for this email. Create an account instead.")
          } else if (!methods.includes("password")) {
            setError("This email uses a different sign-in method.")
          } else {
            setError("Incorrect password. You can reset it below.")
          }
        } catch {
          setError(readableError(err?.code, err?.message))
        }
      } else {
        setError(readableError(err?.code, err?.message))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!auth) return
    setError(null)
    setInfo(null)
    try {
      const addr = email.trim()
      if (!addr) {
        setError("Enter your email above first, then click Reset password.")
        return
      }
      await sendPasswordResetEmail(auth, addr)
      setInfo("Password reset email sent. Check your inbox.")
    } catch (err: any) {
      setError(readableError(err?.code, err?.message))
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-5", className)}>
      {mode === "signup" && (
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-[#2D3748]">
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl"
            autoComplete="name"
          />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-[#2D3748]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl text-black"
          required
          autoComplete="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password" className="text-[#2D3748]">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPass ? "text" : "password"}
            placeholder={mode === "signup" ? "Create a password" : "Your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl pr-10 text-black"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {mode === "signin" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-[#2D3748] underline decoration-[#4FD1C5] underline-offset-4 hover:opacity-80"
            >
              Forgot password?
            </button>
          </div>
        )}
      </div>

      {error && (
        <Alert className="bg-white border-red-200">
          <AlertDescription className="text-[#2D3748]">{error}</AlertDescription>
        </Alert>
      )}
      {info && (
        <Alert className="bg-white border-emerald-200">
          <AlertDescription className="text-[#2D3748]">{info}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="h-11 rounded-xl bg-[#4FD1C5] hover:bg-[#3bb9ad] text-[#2D3748] font-medium disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {mode === "signup" ? "Create Account" : "Sign In"}
      </Button>

      <p className="text-sm text-[#718096]">
        {mode === "signup" ? "Already have an account? " : "New here? "}
        <Link
          href={mode === "signup" ? "/auth/sign-in" : "/auth/sign-up"}
          className="font-medium text-[#2D3748] underline decoration-[#4FD1C5] underline-offset-4"
        >
          {mode === "signup" ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  )
}
