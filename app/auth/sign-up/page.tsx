"use client"

import dynamic from "next/dynamic"
import { Inter } from "next/font/google"
import { Card } from "@/components/ui/card"
import AuthForm from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })
const SketchfabScene = dynamic(() => import("@/components/auth/sketchfab-scene").then((m) => m.default), { ssr: false })

export default function SignUpPage() {
  return (
    <main className={cn("min-h-screen bg-[#F7FAFC]", inter.className)} data-auth-page>
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="relative hidden lg:block overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E6FFFA] via-[#F7FAFC] to-white opacity-20 z-10" />
          <SketchfabScene />
          <div className="absolute top-6 left-6 z-20">
            <Link href="/">
              <Button variant="ghost" className="text-white bg-black/20 backdrop-blur-sm hover:bg-black/30">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-3xl font-semibold text-[#2D3748]">Sweet Spott</h2>
              <p className="text-[#718096] mt-1">{"Create your account and find your oasis of peace."}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 md:p-8 bg-white border-slate-200 shadow-sm">
            <h1 className="text-2xl font-semibold text-[#2D3748]">Create your account</h1>
            <p className="text-sm text-[#718096] mt-1">
              {"Join Sweet Spott and discover tranquil parks, libraries, and quiet cafes."}
            </p>
            <div className="mt-6">
              <AuthForm mode="signup" />
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
