"use client"

import { useMemo, useState, useEffect } from "react"
import type { Place } from "@/lib/data"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LeafRating from "./leaf-rating"
import { Card } from "@/components/ui/card"
import { GOOGLE_MAPS_API_KEY } from "@/lib/firebase"

type Props = {
  places?: Place[]
  userLocation?: { lat: number; lng: number }
  hoveredPlace?: Place | null
}

export default function MapView({ places = [], userLocation, hoveredPlace }: Props) {
  const [selected, setSelected] = useState<Place | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [persistentPlace, setPersistentPlace] = useState<Place | null>(null) // For persistence

  // Update persistent place when hoveredPlace changes (but not when it becomes null)
  useEffect(() => {
    if (hoveredPlace) {
      setPersistentPlace(hoveredPlace)
    }
    // Don't clear persistentPlace when hoveredPlace becomes null - that's the persistence!
  }, [hoveredPlace])

  // Use persistent place for map calculations
  const activePlace = persistentPlace

  // Calculate distance if we have both user location and active place
  const distanceToActive = useMemo(() => {
    if (!userLocation || !activePlace) return null

    const R = 6371e3 // Earth's radius in meters
    const φ1 = (userLocation.lat * Math.PI) / 180
    const φ2 = (activePlace.lat * Math.PI) / 180
    const Δφ = ((activePlace.lat - userLocation.lat) * Math.PI) / 180
    const Δλ = ((activePlace.lng - userLocation.lng) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c) // Distance in meters
  }, [userLocation, activePlace])

  // Calculate map center and zoom for route visualization
  const mapConfig = useMemo(() => {
    if (activePlace && userLocation) {
      // When showing route, center between user and destination
      const centerLat = (userLocation.lat + activePlace.lat) / 2
      const centerLng = (userLocation.lng + activePlace.lng) / 2

      // Calculate appropriate zoom based on distance
      const distance = distanceToActive || 0
      let zoom = 14
      if (distance > 5000) zoom = 12
      else if (distance > 2000) zoom = 13
      else if (distance > 1000) zoom = 14
      else zoom = 15

      return {
        center: { lat: centerLat, lng: centerLng },
        zoom,
        showRoute: true,
      }
    }

    if (activePlace) {
      return {
        center: { lat: activePlace.lat, lng: activePlace.lng },
        zoom: 16,
        showRoute: false,
      }
    }

    if (userLocation) {
      return {
        center: userLocation,
        zoom: 14,
        showRoute: false,
      }
    }

    if (places.length > 0) {
      const avgLat = places.reduce((sum, place) => sum + place.lat, 0) / places.length
      const avgLng = places.reduce((sum, place) => sum + place.lng, 0) / places.length
      return {
        center: { lat: avgLat, lng: avgLng },
        zoom: 12,
        showRoute: false,
      }
    }

    return {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 12,
      showRoute: false,
    }
  }, [places, userLocation, activePlace, distanceToActive])

  // Check if Google Maps API key is available
  const hasGoogleMapsKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [mapConfig.center])

  // Create the map URL with route if needed
  const mapUrl = useMemo(() => {
    if (!hasGoogleMapsKey) return ""

    const centerParam = `${mapConfig.center.lat},${mapConfig.center.lng}`

    if (mapConfig.showRoute && userLocation && activePlace) {
      // Use Directions API to show route
      const origin = `${userLocation.lat},${userLocation.lng}`
      const destination = `${activePlace.lat},${activePlace.lng}`
      return `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${origin}&destination=${destination}&mode=walking&zoom=${mapConfig.zoom}`
    } else {
      // Regular map view
      return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${centerParam}&zoom=${mapConfig.zoom}`
    }
  }, [mapConfig, userLocation, activePlace, hasGoogleMapsKey])

  if (!hasGoogleMapsKey) {
    return (
      <div className="relative w-full h-[480px] md:h-[640px] rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-amber-600 text-xl">🗺️</span>
          </div>
          <div>
            <p className="text-[#2D3748] font-medium">Map unavailable</p>
            <p className="text-[#718096] text-sm mt-1">Google Maps API key required</p>
          </div>
        </div>
      </div>
    )
  }

  if (!mapLoaded) {
    return (
      <div className="relative w-full h-[480px] md:h-[640px] rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#4FD1C5] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#718096]">Loading interactive map...</p>
          {activePlace && mapConfig.showRoute && (
            <p className="text-xs text-[#4FD1C5]">🛣️ Calculating route to {activePlace.name}</p>
          )}
          {activePlace && !mapConfig.showRoute && (
            <p className="text-xs text-[#4FD1C5]">📍 Centering on {activePlace.name}</p>
          )}
          {userLocation && !activePlace && <p className="text-xs text-[#A0AEC0]">📍 Centering on your location</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[480px] md:h-[640px] rounded-xl overflow-hidden border border-slate-200">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title={
          activePlace && mapConfig.showRoute
            ? `Route from your location to ${activePlace.name}`
            : activePlace
              ? `Map showing ${activePlace.name}`
              : "Map showing tranquil places in your area"
        }
      />

      {/* REMOVED: The popup overlay that was blocking the map */}

      {/* Clean, minimal map status overlay - bottom-left */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm max-w-xs">
        {activePlace ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#2D3748]">📍 {activePlace.name}</p>
            {mapConfig.showRoute && distanceToActive && userLocation && (
              <div className="space-y-1">
                <p className="text-xs text-red-600 font-medium">
                  🛣️ Walking route:{" "}
                  {distanceToActive < 1000 ? `${distanceToActive}m` : `${(distanceToActive / 1000).toFixed(1)}km`}
                </p>
                <p className="text-xs text-[#718096]">⏱️ Est. {Math.ceil(distanceToActive / 80)}min walk</p>
              </div>
            )}
            {!mapConfig.showRoute && distanceToActive && (
              <p className="text-xs text-[#4FD1C5]">
                📏{" "}
                {distanceToActive < 1000
                  ? `${distanceToActive}m from you`
                  : `${(distanceToActive / 1000).toFixed(1)}km from you`}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs text-[#718096]">
              {places.length} tranquil place{places.length !== 1 ? "s" : ""}{" "}
              {userLocation ? "near you" : "in this area"}
            </p>
            {userLocation && <p className="text-xs text-[#4FD1C5] mt-1">📍 Your location marked</p>}
            <p className="text-xs text-[#A0AEC0] mt-1">💡 Hover over places to see routes</p>
          </div>
        )}
      </div>

      {/* Selected place card overlay - for clicking on map (future enhancement) */}
      {selected && selected !== activePlace && (
        <div className="absolute top-4 left-4 z-10">
          <Card className="w-64 bg-white border-slate-200 shadow-lg overflow-hidden">
            <div className="relative w-full h-24">
              <Image
                src={selected.imageUrl || "/placeholder.svg"}
                alt={`${selected.name} image`}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 grid gap-1">
              <div className="font-semibold text-[#2D3748]">{selected.name}</div>
              <div className="flex items-center gap-2 text-sm">
                <LeafRating value={selected.tranquility} />
                <span className="text-[#718096]">
                  {selected.isGlobalShowcase ? selected.country : `${Math.round(selected.distanceMeters)}m away`}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <Link href={`/place/${selected.id}`} className="w-full">
                  <Button className="w-full h-9 rounded-lg bg-[#4FD1C5] hover:bg-[#3bb9ad] text-[#2D3748]">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="h-9 rounded-lg border-slate-300 text-[#2D3748] bg-transparent"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
