"use client"

import { useState, useEffect } from "react"
import { Inter } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, MapPin, Star, Globe, ExternalLink } from "lucide-react"
import { places as mockPlaces, globalOasisPlaces, type Place } from "@/lib/data"
import LeafRating from "@/components/leaf-rating"
import SubmissionModal from "@/components/submission-modal"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"

const inter = Inter({ subsets: ["latin"] })

export default function PlaceDetailPage({ params }: { params: { id: string } }) {
  const { theme, mounted } = useTheme()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const getImageSrc = () => {
    if (!place) return "/placeholder.svg"
    if (imageError) {
      return `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(place.name + " " + place.category + " beautiful view")}`
    }
    return place.imageUrl || `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(place.name)}`
  }

  // Fetch the specific place data
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        console.log(`🔍 Looking for place with ID: ${params.id}`)

        // First check if it's a global place
        const globalPlace = globalOasisPlaces.find((p) => p.id === params.id)
        if (globalPlace) {
          console.log(`✅ Found global place: ${globalPlace.name}`)

          // Get real photo for global place
          try {
            const response = await fetch("/api/global-places-photos")
            const data = await response.json()
            if (data.success && data.places) {
              const placeWithPhoto = data.places.find((p: any) => p.id === params.id)
              if (placeWithPhoto) {
                setPlace(placeWithPhoto)
                setLoading(false)
                return
              }
            }
          } catch (error) {
            console.error("Error fetching global place photo:", error)
          }

          setPlace(globalPlace)
          setLoading(false)
          return
        }

        // Check if it's a local mock place
        const mockPlace = mockPlaces.find((p) => p.id === params.id)
        if (mockPlace) {
          console.log(`✅ Found mock place: ${mockPlace.name}`)

          // Get real photo for mock place
          try {
            const response = await fetch(
              `/api/place-photo?name=${encodeURIComponent(mockPlace.name)}&lat=${mockPlace.lat}&lng=${mockPlace.lng}`,
            )
            const data = await response.json()
            if (data.success && data.imageUrl) {
              setPlace({ ...mockPlace, imageUrl: data.imageUrl })
            } else {
              setPlace(mockPlace)
            }
          } catch (error) {
            console.error("Error fetching mock place photo:", error)
            setPlace(mockPlace)
          }

          setLoading(false)
          return
        }

        // If it's a Google place ID, fetch from Google Places API
        if (params.id.startsWith("google-")) {
          console.log(`🔍 Fetching Google place details for: ${params.id}`)

          try {
            const response = await fetch(`/api/place-details?placeId=${encodeURIComponent(params.id)}`)
            const data = await response.json()

            if (data.success && data.place) {
              console.log(`✅ Found Google place: ${data.place.name}`)
              setPlace(data.place)
            } else {
              console.log(`❌ Google place not found: ${params.id}`)
              // Fallback to first global place
              setPlace(globalOasisPlaces[0])
            }
          } catch (error) {
            console.error("Error fetching Google place details:", error)
            setPlace(globalOasisPlaces[0])
          }
        } else {
          console.log(`❌ Place not found: ${params.id}`)
          // Fallback to first global place
          setPlace(globalOasisPlaces[0])
        }
      } catch (error) {
        console.error("Error in fetchPlace:", error)
        setPlace(globalOasisPlaces[0])
      } finally {
        setLoading(false)
      }
    }

    fetchPlace()
  }, [params.id])

  if (!mounted) {
    return (
      <main className={cn("min-h-screen bg-[#F7FAFC] px-4 md:px-8", inter.className)}>
        <div className="max-w-6xl mx-auto py-4">
          <div className="animate-pulse text-[#718096]">Loading...</div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main
        className={cn(
          "main-app min-h-screen px-4 md:px-8 transition-all duration-500", // Added main-app class
          theme === "dark" ? "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a2a2a]" : "bg-[#F7FAFC]",
          inter.className,
        )}
      >
        <div className="max-w-6xl mx-auto py-4">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                className={cn(
                  "rounded-xl transition-colors duration-300",
                  theme === "dark" ? "text-[#f5f5f5] hover:bg-[#2a2a2a]" : "text-[#2D3748]",
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-4">
              <div
                className={cn(
                  "w-full h-[240px] md:h-[400px] rounded-xl animate-pulse",
                  theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200",
                )}
              />
              <div className="space-y-2">
                <div
                  className={cn("h-8 rounded w-3/4 animate-pulse", theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200")}
                />
                <div
                  className={cn("h-4 rounded w-1/2 animate-pulse", theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200")}
                />
              </div>
            </div>
            <div className="grid gap-4">
              <div className={cn("h-32 rounded animate-pulse", theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200")} />
              <div className={cn("h-48 rounded animate-pulse", theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200")} />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!place) {
    return (
      <main
        className={cn(
          "main-app min-h-screen px-4 md:px-8 transition-all duration-500", // Added main-app class
          theme === "dark" ? "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a2a2a]" : "bg-[#F7FAFC]",
          inter.className,
        )}
      >
        <div className="max-w-6xl mx-auto py-4">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                className={cn(
                  "rounded-xl transition-colors duration-300",
                  theme === "dark" ? "text-[#f5f5f5] hover:bg-[#2a2a2a]" : "text-[#2D3748]",
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="text-center py-16">
            <p className={cn("transition-colors duration-300", theme === "dark" ? "text-[#d1d5db]" : "text-[#718096]")}>
              Place not found
            </p>
          </div>
        </div>
      </main>
    )
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`

  return (
    <main
      className={cn(
        "main-app min-h-screen px-4 md:px-8 transition-all duration-500", // Added main-app class
        theme === "dark" ? "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a2a2a]" : "bg-[#F7FAFC]",
        inter.className,
      )}
    >
      <div className="max-w-6xl mx-auto py-4">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/">
            <Button
              variant="ghost"
              className={cn(
                "rounded-xl transition-colors duration-300",
                theme === "dark" ? "text-[#f5f5f5] hover:bg-[#2a2a2a]" : "text-[#2D3748]",
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column */}
          <div className="grid gap-4">
            <div
              className={cn(
                "relative w-full h-[240px] md:h-[400px] rounded-xl overflow-hidden border shadow-sm",
                theme === "dark" ? "border-[#374151] bg-[#2a2a2a]" : "border-slate-200 bg-white",
              )}
            >
              <Image
                src={getImageSrc() || "/placeholder.svg"}
                alt={`${place.name} - ${place.country || place.address}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={handleImageError}
                unoptimized={getImageSrc().includes("googleapis.com")}
              />
              {place.isGlobalShowcase && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#4FD1C5]/95 text-[#2D3748] border-0 backdrop-blur-sm shadow-sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Global Oasis
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <h1
                className={cn(
                  "text-2xl md:text-3xl font-semibold transition-colors duration-300",
                  theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]",
                )}
              >
                {place.name}
              </h1>
              <div
                className={cn(
                  "flex items-center gap-2 transition-colors duration-300",
                  theme === "dark" ? "text-[#d1d5db]" : "text-[#718096]",
                )}
              >
                <MapPin className="w-4 h-4" />
                <span>{place.address}</span>
                {place.country && place.isGlobalShowcase && (
                  <Badge
                    className={cn(
                      "ml-2 transition-all duration-300",
                      theme === "dark"
                        ? "bg-[#3a3a3a] text-[#f5f5f5] border-[#4b5563]"
                        : "bg-slate-100 text-[#2D3748] border-slate-200",
                    )}
                  >
                    {place.country}
                  </Badge>
                )}
              </div>

              {place.description && (
                <p
                  className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-[#9ca3af]" : "text-[#718096]",
                  )}
                >
                  {place.description}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Badge
                  className={cn(
                    "rounded-full transition-all duration-300",
                    theme === "dark"
                      ? "bg-[#3a3a3a] text-[#f5f5f5] border-[#4b5563]"
                      : "bg-slate-100 text-[#2D3748] border-slate-200",
                  )}
                >
                  {place.category}
                </Badge>
                {!place.isGlobalShowcase && (
                  <Badge
                    className={cn(
                      "rounded-full transition-all duration-300",
                      theme === "dark"
                        ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] text-[#f5f5f5] border-[#4b5563]"
                        : "bg-white text-[#2D3748] border-slate-200",
                    )}
                  >{`${Math.round(place.distanceMeters)}m away`}</Badge>
                )}
              </div>

              <div className="pt-2">
                <a href={mapsHref} target="_blank" rel="noreferrer">
                  <Button className="rounded-xl bg-[#4FD1C5] hover:bg-[#3bb9ad] text-[#2D3748]">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {place.isGlobalShowcase ? "View on Maps" : "Get Directions"}
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="grid gap-4">
            <Card
              className={cn(
                "p-4 transition-all duration-300",
                theme === "dark"
                  ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                  : "bg-white border-slate-200",
              )}
            >
              <h2
                className={cn(
                  "font-semibold mb-3 transition-colors duration-300",
                  theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]",
                )}
              >
                The Vibe
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "transition-colors duration-300",
                      theme === "dark" ? "text-[#d1d5db]" : "text-[#718096]",
                    )}
                  >
                    Tranquility Score
                  </span>
                  <LeafRating value={place.tranquility} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-2 transition-colors duration-300",
                    theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]",
                  )}
                >
                  <span>Rating</span>
                  <span className="font-medium">{place.fsqRating.toFixed(1)}/10</span>
                  <Star className="w-4 h-4 text-[#4FD1C5] fill-current" />
                </div>
              </div>
            </Card>

            <Card
              className={cn(
                "p-4 transition-all duration-300",
                theme === "dark"
                  ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                  : "bg-white border-slate-200",
              )}
            >
              <h2
                className={cn(
                  "font-semibold mb-3 transition-colors duration-300",
                  theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]",
                )}
              >
                {place.isGlobalShowcase ? "Visitor Reviews" : "Tranquility Reviews"}
              </h2>
              <div className="grid gap-3">
                {(place.reviews?.length ? place.reviews : defaultReviews).map((r) => (
                  <div key={r.id} className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium transition-colors duration-300",
                          theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]",
                        )}
                      >
                        {r.user}
                      </span>
                      <LeafRating value={r.rating} size={14} />
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed transition-colors duration-300",
                        theme === "dark" ? "text-[#9ca3af]" : "text-[#718096]",
                      )}
                    >
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {!place.isGlobalShowcase && (
              <Card
                className={cn(
                  "p-4 transition-all duration-300",
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                    : "bg-white border-slate-200",
                )}
              >
                <div className="flex flex-col items-start gap-2">
                  <h3
                    className={cn(
                      "font-semibold transition-colors duration-300",
                      theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]",
                    )}
                  >
                    Been here? Rate its tranquility.
                  </h3>
                  <Button
                    onClick={() => setOpen(true)}
                    className="rounded-xl bg-[#4FD1C5] hover:bg-[#3bb9ad] text-[#2D3748]"
                  >
                    Rate this Place
                  </Button>
                </div>
              </Card>
            )}

            {place.isGlobalShowcase && (
              <Card
                className={cn(
                  "p-4 transition-all duration-300",
                  theme === "dark"
                    ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-[#4FD1C5]/30"
                    : "bg-gradient-to-r from-[#E6FFFA] to-[#F0FFF4] border-[#4FD1C5]/30",
                )}
              >
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-[#2D3748] mt-0.5" />
                  <div>
                    <h3
                      className={cn(
                        "font-semibold mb-1 transition-colors duration-300",
                        theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]",
                      )}
                    >
                      Global Oasis
                    </h3>
                    <p
                      className={cn(
                        "text-sm transition-colors duration-300",
                        theme === "dark" ? "text-[#9ca3af]" : "text-[#718096]",
                      )}
                    >
                      This is one of the world's most renowned tranquil destinations, inspiring peace-seekers globally.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <SubmissionModal open={open} onOpenChange={setOpen} placeName={place.name} />
    </main>
  )
}

const defaultReviews = [
  { id: "r1", user: "Amaya", comment: "Quiet on weekday mornings, birdsong everywhere.", rating: 5 },
  { id: "r2", user: "Rohit", comment: "A calm spot to read under the banyan tree.", rating: 4 },
  { id: "r3", user: "Lea", comment: "Some distant traffic hum, but still relaxing.", rating: 4 },
]
