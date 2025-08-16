"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Globe, MapPin } from "lucide-react"
import LeafRating from "./leaf-rating"
import type { Place } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"

type Props = {
  place?: Place
  compact?: boolean
  onHover?: (place: Place | null) => void
  isHovered?: boolean
}

export default function PlaceCard({ place, compact = false, onHover, isHovered = false }: Props) {
  const { theme, mounted } = useTheme()
  const [imageError, setImageError] = useState(false)

  const p =
    place ||
    ({
      id: "0",
      name: "Calm Park",
      distanceMeters: 500,
      tranquility: 4,
      fsqRating: 8.9,
      category: "Park",
      imageUrl: "/placeholder.svg?height=220&width=400",
      address: "123 Serenity Ave",
      lat: 0,
      lng: 0,
      pos: { x: 40, y: 40 },
    } as Place)

  const handleImageError = () => {
    setImageError(true)
  }

  const getImageSrc = () => {
    if (imageError) {
      return `/placeholder.svg?height=300&width=600&query=${encodeURIComponent(p.name + " " + p.category)}`
    }
    return p.imageUrl || `/placeholder.svg?height=300&width=600&query=${encodeURIComponent(p.name)}`
  }

  // Use default styling until mounted to avoid hydration mismatch
  const cardClassName = mounted
    ? cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group",
        theme === "dark"
          ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#374151] shadow-lg hover:shadow-2xl"
          : "bg-white border-slate-200",
        compact && "shadow-sm",
        p.isGlobalShowcase && theme === "dark"
          ? "ring-1 ring-[#4FD1C5]/50 shadow-xl"
          : p.isGlobalShowcase && "ring-1 ring-[#4FD1C5]/30 shadow-md",
        isHovered && theme === "dark"
          ? "ring-2 ring-[#4FD1C5] shadow-2xl scale-[1.02] bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a]"
          : isHovered && "ring-2 ring-[#4FD1C5] shadow-xl scale-[1.02] bg-[#F7FAFC]",
      )
    : "overflow-hidden bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"

  return (
    <Link href={`/place/${p.id}`}>
      <Card className={cardClassName} onMouseEnter={() => onHover?.(p)} onMouseLeave={() => onHover?.(null)}>
        <div className={cn("relative w-full", compact ? "h-36" : "h-48")}>
          <Image
            src={getImageSrc() || "/placeholder.svg"}
            alt={`${p.name} - ${p.country || p.address}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={p.isGlobalShowcase}
            onError={handleImageError}
            unoptimized={getImageSrc().includes("googleapis.com")} // Don't optimize Google API images
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {p.isGlobalShowcase && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#4FD1C5]/95 text-[#2D3748] border-0 backdrop-blur-sm shadow-sm">
                <Globe className="w-3 h-3 mr-1" />
                Global
              </Badge>
            </div>
          )}

          {/* Country flag or location indicator */}
          {p.isGlobalShowcase && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-white/90 text-[#2D3748] border-0 backdrop-blur-sm text-xs">{p.country}</Badge>
            </div>
          )}

          {/* Hover indicator */}
          {isHovered && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#4FD1C5] text-[#2D3748] border-0 shadow-sm animate-pulse">
                <MapPin className="w-3 h-3 shrink-0" />
                On Map
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                "font-semibold leading-tight transition-colors duration-300",
                theme === "dark" ? "text-white" : "text-[#2D3748]", // Changed to bright white
              )}
            >
              {p.name}
            </div>
            <Badge
              className={cn(
                "rounded-full text-xs shrink-0 transition-all duration-300",
                theme === "dark"
                  ? "bg-[#4a5568] text-white border-[#4b5563]" // Darker background, white text
                  : "bg-slate-100 text-[#2D3748] border-slate-200",
              )}
            >
              {p.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 grid gap-2">
          <div
            className={cn(
              "flex items-center gap-1 text-sm transition-colors duration-300",
              theme === "dark" ? "text-gray-200" : "text-[#718096]", // Brighter gray for better visibility
            )}
          >
            <MapPin className="w-3 h-3 shrink-0" />
            {p.isGlobalShowcase ? (
              <span className="truncate">{p.address}</span>
            ) : (
              <span>{`Approx. ${Math.round(p.distanceMeters)}m away`}</span>
            )}
          </div>

          {p.description && (
            <p
              className={cn(
                "text-xs line-clamp-2 leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-gray-300" : "text-[#718096]", // Brighter gray for description
              )}
            >
              {p.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm transition-colors duration-300",
                  theme === "dark" ? "text-white" : "text-[#2D3748]", // White text for "Tranquility:"
                )}
              >
                Tranquility:
              </span>
              <LeafRating value={p.tranquility} size={16} />
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-sm transition-colors duration-300",
                theme === "dark" ? "text-white" : "text-[#2D3748]", // White text for rating
              )}
            >
              <span className="font-medium">{p.fsqRating.toFixed(1)}</span>
              <Star className="w-4 h-4 text-[#4FD1C5] fill-current" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
