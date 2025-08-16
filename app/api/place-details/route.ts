import { type NextRequest, NextResponse } from "next/server"
import type { Place } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get("placeId")

    if (!placeId) {
      return NextResponse.json({ error: "Place ID is required" }, { status: 400 })
    }

    // Extract the actual Google Place ID from our format
    const googlePlaceId = placeId.replace("google-", "")

    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAbEb5js41huSFfNkNmDZuH_k8rfkUIudM"

    if (!GOOGLE_API_KEY || GOOGLE_API_KEY.length < 10) {
      return NextResponse.json({ error: "Google API key not available" }, { status: 500 })
    }

    console.log(`🔍 Fetching Google Place details for: ${googlePlaceId}`)

    // Get place details from Google Places API
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=place_id,name,formatted_address,geometry,photos,rating,types,vicinity&key=${GOOGLE_API_KEY}`

    const response = await fetch(detailsUrl)
    const data = await response.json()

    if (data.status !== "OK" || !data.result) {
      console.log(`❌ Google Place details failed:`, data.status)
      return NextResponse.json({ error: "Place not found", success: false }, { status: 404 })
    }

    const googlePlace = data.result

    // Get place photo
    let imageUrl = `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(googlePlace.name)}`

    if (googlePlace.photos && googlePlace.photos.length > 0) {
      const photoReference = googlePlace.photos[0].photo_reference
      imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&maxheight=600&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`
    }

    // Map place type to tranquility score
    const tranquility = mapPlaceTypeToTranquility(googlePlace.types || [])

    const place: Place = {
      id: placeId, // Keep our format
      name: googlePlace.name,
      distanceMeters: 0, // We don't have user location in this context
      tranquility,
      fsqRating: googlePlace.rating ? googlePlace.rating * 2 : 8.0, // Convert 5-star to 10-point scale
      category: getCategoryFromTypes(googlePlace.types || []),
      imageUrl,
      address: googlePlace.formatted_address || googlePlace.vicinity || "Address not available",
      lat: googlePlace.geometry.location.lat,
      lng: googlePlace.geometry.location.lng,
      pos: {
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      },
    }

    console.log(`✅ Successfully fetched place details: ${place.name}`)

    return NextResponse.json({
      success: true,
      place,
    })
  } catch (error) {
    console.error("❌ Error fetching place details:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch place details",
        success: false,
      },
      { status: 500 },
    )
  }
}

// Helper functions
function mapPlaceTypeToTranquility(types: string[]): number {
  const typeString = types.join(" ").toLowerCase()

  if (typeString.includes("park") || typeString.includes("garden") || typeString.includes("nature")) return 5
  if (typeString.includes("library") || typeString.includes("museum") || typeString.includes("gallery")) return 4
  if (typeString.includes("spa") || typeString.includes("temple") || typeString.includes("church")) return 5
  if (typeString.includes("cafe") || typeString.includes("restaurant")) return 3
  if (typeString.includes("store") || typeString.includes("shop")) return 2

  return 3 // Default tranquility
}

function getCategoryFromTypes(types: string[]): string {
  const typeString = types.join(" ").toLowerCase()

  if (typeString.includes("park")) return "Park"
  if (typeString.includes("library")) return "Library"
  if (typeString.includes("museum")) return "Museum"
  if (typeString.includes("cafe") || typeString.includes("restaurant")) return "Café"
  if (typeString.includes("store") || typeString.includes("shop")) return "Store"
  if (typeString.includes("church") || typeString.includes("temple")) return "Place of Worship"
  if (typeString.includes("hospital") || typeString.includes("health")) return "Healthcare"
  if (typeString.includes("school") || typeString.includes("university")) return "Education"

  return "Place"
}
