"use client"

import { useMemo, useState, useEffect } from "react"
import { Inter } from "next/font/google"
import { LocateFixed, Search, AlertCircle, CheckCircle, Globe, Plus, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"

import { globalOasisPlaces, type Place } from "@/lib/data"
import PlaceCard from "@/components/place-card"
import MapView from "@/components/map-view"
import SiteHeader from "@/components/site-header"
import { useGeolocation } from "@/hooks/use-geolocation"

const inter = Inter({ subsets: ["latin"] })

export default function Page() {
  const { theme, mounted } = useTheme()
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"list" | "map">("list")
  const [places, setPlaces] = useState<Place[]>([]) // Start empty, will load with Google Photos
  const [loading, setLoading] = useState(true) // Start with loading to fetch Google Photos
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [usingRealData, setUsingRealData] = useState(false)
  const [showingGlobalPlaces, setShowingGlobalPlaces] = useState(true)
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null) // Current hover state
  const [lastHoveredPlace, setLastHoveredPlace] = useState<Place | null>(null) // Persistent state

  // Load More functionality
  const [visibleCount, setVisibleCount] = useState(4) // Show 4 places initially in map view
  const [loadingMore, setLoadingMore] = useState(false)

  const { latitude, longitude, error: geoError, loading: geoLoading, getCurrentPosition } = useGeolocation()

  // Load global places with real Google Photos on component mount
  useEffect(() => {
    const loadGlobalPlacesWithPhotos = async () => {
      try {
        console.log("🔄 Loading global places with Google Photos...")
        const response = await fetch("/api/global-places-photos")
        const data = await response.json()

        if (data.success && data.places) {
          setPlaces(data.places)
          setSuccess("Discover tranquil places around the world with real photos!")
          console.log("✅ Loaded global places with Google Photos")
        } else {
          // Fallback to original global places
          setPlaces(globalOasisPlaces)
          setSuccess("Discover tranquil places around the world!")
        }
      } catch (error) {
        console.error("❌ Error loading global places:", error)
        setPlaces(globalOasisPlaces)
        setSuccess("Discover tranquil places around the world!")
      } finally {
        setLoading(false)
      }
    }

    loadGlobalPlacesWithPhotos()
  }, [])

  const filteredPlaces = useMemo(() => {
    if (!query.trim()) return places
    const q = query.toLowerCase()
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q),
    )
  }, [query, places])

  // Reset visible count when places change
  useEffect(() => {
    setVisibleCount(4)
  }, [places])

  // Handle Load More with animation
  const handleLoadMore = async () => {
    setLoadingMore(true)

    // Add a nice delay for the animation effect
    await new Promise((resolve) => setTimeout(resolve, 800))

    setVisibleCount((prev) => Math.min(prev + 4, filteredPlaces.length))
    setLoadingMore(false)
  }

  const fetchNearbyPlaces = async (lat: number, lng: number, searchQuery = "") => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setShowingGlobalPlaces(false)
    setHoveredPlace(null) // Clear current hover
    setLastHoveredPlace(null) // Clear persistent hover when fetching new data
    setVisibleCount(4) // Reset visible count

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
      })

      if (searchQuery.trim()) {
        params.append("query", searchQuery.trim())
      }

      console.log("🔄 Searching for places near you...")
      const response = await fetch(`/api/places?${params}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Check content type before parsing
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("❌ API returned non-JSON response:", text.substring(0, 200))
        throw new Error("Server returned an invalid response. Please try again.")
      }

      const data = await response.json()
      console.log("✅ API Response:", data)

      if (data.success && data.places) {
        setPlaces(data.places)
        setUsingRealData(true)
        setSuccess(data.message || `Found ${data.places.length} places near you!`)

        if (data.places.length === 0) {
          setError("No places found for your search. Try a different search term or location.")
        }
      } else if (data.message) {
        setError(data.message)
        setPlaces([])
        setUsingRealData(true)
      } else {
        throw new Error(data.error || "Unknown error occurred")
      }
    } catch (err) {
      console.error("❌ Error fetching places:", err)
      setUsingRealData(false)
      setPlaces([])
      setShowingGlobalPlaces(false)

      if (err instanceof Error) {
        if (err.message.includes("JSON")) {
          setError("Server error occurred. Please try again in a moment.")
        } else if (err.message.includes("HTTP")) {
          setError("Network error. Please check your connection and try again.")
        } else {
          setError(err.message)
        }
      } else {
        setError("Unable to find places. Please check your connection and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFindNearby = () => {
    if (latitude && longitude) {
      fetchNearbyPlaces(latitude, longitude, query)
    } else {
      getCurrentPosition()
    }
  }

  const handleShowGlobalPlaces = async () => {
    setLoading(true)
    setHoveredPlace(null) // Clear current hover
    setLastHoveredPlace(null) // Clear persistent hover
    setVisibleCount(4) // Reset visible count
    try {
      console.log("🔄 Loading global places with Google Photos...")
      const response = await fetch("/api/global-places-photos")
      const data = await response.json()

      if (data.success && data.places) {
        setPlaces(data.places)
        console.log("✅ Loaded global places with Google Photos")
      } else {
        setPlaces(globalOasisPlaces)
      }
    } catch (error) {
      console.error("❌ Error loading global places:", error)
      setPlaces(globalOasisPlaces)
    }

    setShowingGlobalPlaces(true)
    setUsingRealData(false)
    setError(null)
    setSuccess("Discover tranquil places around the world with real photos!")
    setQuery("")
    setLoading(false)
  }

  // Handle tab change - auto-request location when switching to Map View
  const handleTabChange = (newTab: "list" | "map") => {
    setActiveTab(newTab)
    setHoveredPlace(null) // Clear current hover when changing tabs
    setLastHoveredPlace(null) // Clear persistent hover when changing tabs
    setVisibleCount(newTab === "map" ? 4 : filteredPlaces.length) // Reset count for map view

    if (newTab === "map") {
      // Auto-request location when switching to Map View
      if (!latitude && !longitude && !geoLoading) {
        getCurrentPosition()
      }
      // If we have location but showing global places, fetch nearby places
      else if (latitude && longitude && showingGlobalPlaces) {
        fetchNearbyPlaces(latitude, longitude)
      }
    }
  }

  // Auto-fetch when location is available and we're in map view
  useEffect(() => {
    if (latitude && longitude && activeTab === "map" && showingGlobalPlaces) {
      fetchNearbyPlaces(latitude, longitude)
    }
  }, [latitude, longitude, activeTab, showingGlobalPlaces])

  // Enhanced place hover handler with persistence
  const handlePlaceHover = (place: Place | null) => {
    setHoveredPlace(place)

    // Only update lastHoveredPlace when we hover on a NEW place (not when we hover off)
    if (place && place !== lastHoveredPlace) {
      setLastHoveredPlace(place)
    }
    // Don't clear lastHoveredPlace when place becomes null - that's the persistence!
  }

  // Determine which place to show on map (current hover or last hovered)
  const mapDisplayPlace = hoveredPlace || lastHoveredPlace

  // Get visible places for map view
  const visiblePlaces = activeTab === "map" ? filteredPlaces.slice(0, visibleCount) : filteredPlaces
  const hasMorePlaces = activeTab === "map" && visibleCount < filteredPlaces.length

  // Don't render theme-dependent styles until mounted
  if (!mounted) {
    return (
      <main className={cn("min-h-screen bg-[#F7FAFC]", inter.className)}>
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-[#718096]">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main
      className={cn(
        "main-app min-h-screen transition-all duration-500", // Added main-app class
        theme === "dark" ? "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a2a2a]" : "bg-[#F7FAFC]",
        inter.className,
      )}
    >
      <SiteHeader />
      <section className="px-4 md:px-8">
        <div className="mx-auto max-w-4xl text-center py-10 md:py-16">
          <h1
            className={cn(
              "text-3xl md:text-5xl font-semibold transition-colors duration-300",
              theme === "dark" ? "text-[#f5f5f5]" : "text-[#2D3748]",
            )}
          >
            {"Find your pocket of peace in the city."}
          </h1>
          <p
            className={cn(
              "mt-3 text-base md:text-lg transition-colors duration-300",
              theme === "dark" ? "text-[#d1d5db]" : "text-[#718096]",
            )}
          >
            {
              "Discover quiet parks, serene libraries, tranquil cafes, relaxing spas, and peaceful spots to escape the noise."
            }
          </p>

          <div className="mt-6 md:mt-8 grid gap-3 md:gap-4">
            <div className="relative">
              <Search
                className={cn(
                  "w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300",
                  theme === "dark" ? "text-[#9ca3af]" : "text-[#718096]",
                )}
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  showingGlobalPlaces
                    ? "Search global oasis places..."
                    : "Search for anything: spa, cafe, library, park, museum, yoga studio..."
                }
                className={cn(
                  "pl-10 h-12 rounded-xl shadow-sm transition-all duration-300",
                  theme === "dark"
                    ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-[#374151] text-[#f5f5f5] placeholder:text-[#9ca3af] focus:border-[#4FD1C5] focus:ring-[#4FD1C5]/20"
                    : "border-slate-200 bg-white text-[#2D3748] focus:border-[#4FD1C5] focus:ring-[#4FD1C5]/20",
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (showingGlobalPlaces && !latitude) {
                      // Just filter global places
                      return
                    }
                    handleFindNearby()
                  }
                }}
              />
            </div>

            <div className="flex justify-center gap-3">
              <Button
                className="rounded-xl h-11 px-5 bg-[#4FD1C5] hover:bg-[#3bb9ad] text-[#2D3748] font-medium disabled:opacity-60 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handleFindNearby}
                disabled={loading || geoLoading}
              >
                <LocateFixed className="w-4 h-4 mr-2" />
                {loading ? "Finding Places..." : geoLoading ? "Getting Location..." : "Find Serenity Near Me"}
              </Button>

              {!showingGlobalPlaces && (
                <Button
                  variant="outline"
                  className={cn(
                    "rounded-xl h-11 px-5 font-medium transition-all duration-300",
                    theme === "dark"
                      ? "border-[#4FD1C5] text-[#f5f5f5] bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] hover:from-[#3a3a3a] hover:to-[#2a2a2a] hover:border-[#4FD1C5]/80"
                      : "border-[#4FD1C5] text-[#2D3748] hover:bg-[#4FD1C5]/10 bg-transparent",
                  )}
                  onClick={handleShowGlobalPlaces}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Global Oasis
                </Button>
              )}
            </div>

            {/* Status messages */}
            {geoError && (
              <Alert
                className={cn(
                  "max-w-md mx-auto border-amber-200 transition-all duration-300",
                  theme === "dark" ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-amber-500/30" : "bg-white",
                )}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-[#2D3748]">{geoError}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert
                className={cn(
                  "max-w-md mx-auto border-red-200 transition-all duration-300",
                  theme === "dark" ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-red-500/30" : "bg-white",
                )}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-[#2D3748]">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert
                className={cn(
                  "max-w-md mx-auto border-green-200 transition-all duration-300",
                  theme === "dark" ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-green-500/30" : "bg-white",
                )}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-[#2D3748] text-slate-400">{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          {/* Global showcase header - ONLY show in List view */}
          {showingGlobalPlaces && activeTab === "list" && (
            <div className="mb-6">
              <Card
                className={cn(
                  "border-[#4FD1C5]/30 transition-all duration-300",
                  theme === "dark"
                    ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-[#4FD1C5]/50"
                    : "bg-gradient-to-r from-[#E6FFFA] to-[#F0FFF4]",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#2D3748] text-slate-100" />
                    <h2 className="text-lg font-semibold text-[#2D3748] text-slate-300">
                      Popular Oasis Places Around the World
                    </h2>
                  </div>
                  <p className="text-sm text-[#718096] text-slate-500">
                    Discover the most tranquil places with authentic photos from around the globe
                  </p>
                </CardHeader>
              </Card>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center">
              <TabsList
                className={cn(
                  "rounded-full shadow-sm border p-1 transition-all duration-300",
                  theme === "dark"
                    ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                    : "bg-white border-slate-200",
                )}
              >
                <TabsTrigger
                  value="list"
                  className={cn(
                    "rounded-full px-4 h-9 data-[state=active]:bg-[#4FD1C5] data-[state=active]:text-[#2D3748] transition-all duration-300",
                    theme === "dark" ? "text-[#d1d5db] data-[state=inactive]:hover:bg-[#3a3a3a]" : "text-[#718096]",
                  )}
                >
                  List View
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className={cn(
                    "rounded-full px-4 h-9 data-[state=active]:bg-[#4FD1C5] data-[state=active]:text-[#2D3748] transition-all duration-300",
                    theme === "dark" ? "text-[#d1d5db] data-[state=inactive]:hover:bg-[#3a3a3a]" : "text-[#718096]",
                  )}
                >
                  Map View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-6">
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card
                      key={i}
                      className={cn(
                        "overflow-hidden animate-pulse transition-all duration-300",
                        theme === "dark"
                          ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                          : "bg-white border-slate-200",
                      )}
                    >
                      <div
                        className={cn(
                          "w-full h-48 transition-all duration-300",
                          theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200",
                        )}
                      />
                      <div className="p-4 space-y-2">
                        <div
                          className={cn(
                            "h-4 rounded w-3/4 transition-all duration-300",
                            theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200",
                          )}
                        />
                        <div
                          className={cn(
                            "h-3 rounded w-1/2 transition-all duration-300",
                            theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200",
                          )}
                        />
                        <div
                          className={cn(
                            "h-3 rounded w-2/3 transition-all duration-300",
                            theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200",
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlaces.map((p) => (
                    <PlaceCard key={p.id} place={p} />
                  ))}
                </div>
              )}
              {!loading && filteredPlaces.length === 0 && (
                <Card
                  className={cn(
                    "mt-6 transition-all duration-300",
                    theme === "dark"
                      ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                      : "bg-white border-slate-200",
                  )}
                >
                  <CardContent className="p-8 text-center text-[#718096]">
                    {query ? (
                      <div className="space-y-3">
                        <p>No places found for "{query}"</p>
                        <p className="text-sm">Try searching for:</p>
                        <p className="text-sm font-medium text-[#2D3748]">
                          spa • cafe • library • park • museum • yoga studio • bookstore • art gallery • meditation
                          center
                        </p>
                      </div>
                    ) : (
                      "No quiet spots found."
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="map" className="mt-6">
              <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <MapView
                  places={filteredPlaces}
                  userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
                  hoveredPlace={mapDisplayPlace} // Pass the persistent place to the map
                />
                <div className="hidden md:block">
                  <div className="sticky top-4 grid gap-4">
                    <div
                      className={cn(
                        "mb-2 p-3 rounded-lg border transition-all duration-300",
                        theme === "dark"
                          ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                          : "bg-white border-slate-200",
                      )}
                    >
                      <p className="text-sm text-[#718096] text-center mb-1">
                        💡 Hover over places to see them on the map
                      </p>
                      {latitude && longitude && (
                        <p className="text-xs text-[#4FD1C5] text-center">
                          🛣️ Map stays focused until you hover on a different place
                        </p>
                      )}
                    </div>

                    {/* Visible places with staggered animation */}
                    {visiblePlaces.map((p, index) => (
                      <div
                        key={p.id}
                        className="animate-in slide-in-from-right-2 fade-in duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <PlaceCard
                          place={p}
                          compact
                          onHover={handlePlaceHover}
                          isHovered={hoveredPlace?.id === p.id || (!hoveredPlace && lastHoveredPlace?.id === p.id)}
                        />
                      </div>
                    ))}

                    {/* Beautiful Load More Button */}
                    {hasMorePlaces && (
                      <div className="animate-in slide-in-from-bottom-2 fade-in duration-700">
                        <Card
                          className={cn(
                            "overflow-hidden hover:shadow-lg transition-all duration-300",
                            theme === "dark"
                              ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#4FD1C5]/30 hover:border-[#4FD1C5]/50"
                              : "bg-gradient-to-br from-[#E6FFFA] via-white to-[#F0FFF4] border-[#4FD1C5]/30 hover:border-[#4FD1C5]/50",
                          )}
                        >
                          <CardContent className="p-6">
                            <Button
                              onClick={handleLoadMore}
                              disabled={loadingMore}
                              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#38B2AC] hover:from-[#3bb9ad] hover:to-[#319795] text-[#2D3748] font-medium shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-70"
                            >
                              {loadingMore ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-5 h-5 border-2 border-[#2D3748]/30 border-t-[#2D3748] rounded-full animate-spin" />
                                  <span>Discovering more places...</span>
                                  <Sparkles className="w-4 h-4 animate-pulse" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <Plus className="w-5 h-5" />
                                  <span>Load More Tranquil Places</span>
                                  <ChevronDown className="w-4 h-4 animate-bounce" />
                                </div>
                              )}
                            </Button>

                            <div className="mt-3 text-center">
                              <p className="text-xs text-[#718096]">
                                Showing {visibleCount} of {filteredPlaces.length} places
                              </p>
                              <div
                                className={cn(
                                  "mt-2 w-full rounded-full h-1.5 transition-all duration-300",
                                  theme === "dark" ? "bg-[#3a3a3a]" : "bg-slate-200",
                                )}
                              >
                                <div
                                  className="bg-gradient-to-r from-[#4FD1C5] to-[#38B2AC] h-1.5 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${(visibleCount / filteredPlaces.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* All places loaded message */}
                    {!hasMorePlaces && filteredPlaces.length > 4 && (
                      <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                        <Card
                          className={cn(
                            "transition-all duration-300",
                            theme === "dark"
                              ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-[#4FD1C5]/20"
                              : "bg-gradient-to-r from-[#F0FFF4] to-[#E6FFFA] border-[#4FD1C5]/20",
                          )}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-[#2D3748]">
                              <Sparkles className="w-4 h-4 text-[#4FD1C5]" />
                              <span className="text-sm font-medium">
                                All {filteredPlaces.length} places discovered!
                              </span>
                              <Sparkles className="w-4 h-4 text-[#4FD1C5]" />
                            </div>
                            <p className="text-xs text-[#718096] mt-1">
                              You've seen all the tranquil spots in your area
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile version */}
              <div className="md:hidden mt-4">
                <div
                  className={cn(
                    "mb-4 p-3 rounded-lg border transition-all duration-300",
                    theme === "dark"
                      ? "bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-[#374151]"
                      : "bg-white border-slate-200",
                  )}
                >
                  <p className="text-sm text-[#718096] text-center mb-1">💡 Tap places to see them on the map above</p>
                  {latitude && longitude && (
                    <p className="text-xs text-[#4FD1C5] text-center">🛣️ Map stays focused on your selection</p>
                  )}
                </div>

                <div className="grid gap-4">
                  {visiblePlaces.map((p, index) => (
                    <div
                      key={p.id}
                      className="animate-in slide-in-from-bottom-2 fade-in duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <PlaceCard
                        place={p}
                        compact
                        onHover={handlePlaceHover}
                        isHovered={hoveredPlace?.id === p.id || (!hoveredPlace && lastHoveredPlace?.id === p.id)}
                      />
                    </div>
                  ))}

                  {/* Mobile Load More Button */}
                  {hasMorePlaces && (
                    <div className="animate-in slide-in-from-bottom-2 fade-in duration-700">
                      <Card
                        className={cn(
                          "overflow-hidden transition-all duration-300",
                          theme === "dark"
                            ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-[#4FD1C5]/30"
                            : "bg-gradient-to-br from-[#E6FFFA] via-white to-[#F0FFF4] border-[#4FD1C5]/30",
                        )}
                      >
                        <CardContent className="p-4">
                          <Button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4FD1C5] to-[#38B2AC] hover:from-[#3bb9ad] hover:to-[#319795] text-[#2D3748] font-medium"
                          >
                            {loadingMore ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#2D3748]/30 border-t-[#2D3748] rounded-full animate-spin" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                <span>Load More Places</span>
                                <ChevronDown className="w-4 h-4 animate-bounce" />
                              </div>
                            )}
                          </Button>
                          <p className="text-xs text-[#718096] text-center mt-2">
                            {visibleCount} of {filteredPlaces.length} places
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <footer
        className={cn(
          "px-4 md:px-8 max-w-6xl mx-auto py-10 text-center text-sm transition-colors duration-300",
          theme === "dark" ? "text-[#d1d5db]" : "text-[#718096]",
        )}
      >
        {showingGlobalPlaces
          ? "Featuring authentic photos of the world's most tranquil destinations"
          : usingRealData
            ? "Powered by Google Places and Foresquare API with real photos, locations, and persistent walking directions"
            : "Search for any type of peaceful place - we'll find it and show you the route"}
      </footer>
    </main>
  )
}
