import { type NextRequest, NextResponse } from "next/server"
import { calculateDistance } from "@/lib/foursquare"
import type { Place } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const query = searchParams.get("query") || ""

    console.log("🔍 API Request received:", { lat, lng, query })

    if (!lat || !lng) {
      console.log("❌ Missing coordinates")
      return NextResponse.json({ error: "Location coordinates are required", success: false }, { status: 400 })
    }

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      console.log("❌ Invalid coordinates:", { lat, lng })
      return NextResponse.json({ error: "Invalid coordinates provided", success: false }, { status: 400 })
    }

    console.log("🔍 Searching for places:", { latitude, longitude, query })

    // Always try Google Places API first for comprehensive results
    const realPlaces = await getRealPlacesFromGoogle(latitude, longitude, query)

    if (realPlaces && realPlaces.length > 0) {
      console.log(`✅ Found ${realPlaces.length} REAL places from Google Places API`)
      return NextResponse.json({
        places: realPlaces,
        success: true,
        message: `Found ${realPlaces.length} places${query ? ` for "${query}"` : " near you"}`,
      })
    }

    // If no results, try broader search
    console.log("🔄 Trying broader search...")
    const broadPlaces = await getRealPlacesFromGoogle(latitude, longitude, "", true)

    return NextResponse.json({
      places: broadPlaces || [],
      success: true,
      message:
        broadPlaces && broadPlaces.length > 0
          ? `Found ${broadPlaces.length} places in your area`
          : "No places found in your area. Try a different search term or location.",
    })
  } catch (error) {
    console.error("❌ Unexpected error in API route:", error)
    return NextResponse.json(
      {
        places: [],
        message: "Error finding places in your area. Please try again.",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Comprehensive Google Places search that handles everything
async function getRealPlacesFromGoogle(
  lat: number,
  lng: number,
  query = "",
  broadSearch = false,
): Promise<Place[] | null> {
  try {
    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    console.log("🔑 Google API Key available:", GOOGLE_API_KEY ? `${GOOGLE_API_KEY.substring(0, 10)}...` : "NO KEY")

    if (!GOOGLE_API_KEY || GOOGLE_API_KEY.length < 10) {
      console.log("❌ Google API key not available or too short")
      return null
    }

    const allPlaces: Place[] = []

    if (query && query.trim()) {
      // Intelligent search based on user query
      console.log(`🔍 Intelligent search for: "${query}"`)

      const searchTerms = getIntelligentSearchTerms(query.toLowerCase())
      console.log(`🎯 Expanded search terms:`, searchTerms.slice(0, 3)) // Log first 3 terms

      for (const searchTerm of searchTerms.slice(0, 5)) {
        // Limit to 5 terms to avoid timeout
        try {
          const places = await searchGooglePlaces(lat, lng, searchTerm, GOOGLE_API_KEY)
          allPlaces.push(...places)

          // Add small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`❌ Error searching for "${searchTerm}":`, error)
          continue // Continue with other search terms
        }
      }
    } else if (broadSearch) {
      // Comprehensive search for all types of tranquil places
      const comprehensiveTerms = [
        "park",
        "library",
        "cafe",
        "museum",
        "spa",
        "garden",
        "coffee shop",
        "art gallery",
        "wellness center",
        "yoga studio",
      ]

      for (const searchTerm of comprehensiveTerms.slice(0, 6)) {
        // Limit to 6 terms
        try {
          const places = await searchGooglePlaces(lat, lng, searchTerm, GOOGLE_API_KEY)
          allPlaces.push(...places.slice(0, 2)) // Limit per category for broad search

          // Add small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`❌ Error in broad search for "${searchTerm}":`, error)
          continue
        }
      }
    } else {
      // Default search for most common tranquil places
      const defaultTerms = ["park", "library", "cafe", "museum"]

      for (const searchTerm of defaultTerms) {
        try {
          const places = await searchGooglePlaces(lat, lng, searchTerm, GOOGLE_API_KEY)
          allPlaces.push(...places.slice(0, 3))

          // Add small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`❌ Error in default search for "${searchTerm}":`, error)
          continue
        }
      }
    }

    // Remove duplicates and filter for quality
    const uniquePlaces = removeDuplicatePlaces(allPlaces)
    const qualityPlaces = filterQualityPlaces(uniquePlaces)

    // Sort by relevance and distance
    qualityPlaces.sort((a, b) => {
      // Prioritize higher tranquility scores, then distance
      if (a.tranquility !== b.tranquility) {
        return b.tranquility - a.tranquility
      }
      return a.distanceMeters - b.distanceMeters
    })

    console.log(`✅ Total quality places found: ${qualityPlaces.length}`)
    return qualityPlaces.slice(0, 20) // Return top 20 results
  } catch (error) {
    console.error("❌ Error in getRealPlacesFromGoogle:", error)
    return null
  }
}

// Intelligent search term expansion based on user query
function getIntelligentSearchTerms(query: string): string[] {
  const terms: string[] = []

  // Always include the original query
  terms.push(query)

  // Cafe & Coffee searches
  if (query.includes("cafe") || query.includes("coffee")) {
    terms.push(
      "cafe",
      "coffee shop",
      "coffee house",
      "espresso bar",
      "local cafe",
      "specialty coffee",
      "artisan coffee",
    )
  }

  // Spa & Wellness searches
  if (query.includes("spa") || query.includes("wellness") || query.includes("massage")) {
    terms.push(
      "spa",
      "day spa",
      "wellness center",
      "massage",
      "massage therapy",
      "wellness spa",
      "relaxation spa",
      "therapeutic massage",
    )
  }

  // Yoga & Meditation searches
  if (query.includes("yoga") || query.includes("meditation") || query.includes("zen")) {
    terms.push("yoga studio", "meditation center", "zen center", "mindfulness center", "yoga class", "meditation space")
  }

  // Restaurant & Food searches
  if (query.includes("restaurant") || query.includes("food") || query.includes("dining")) {
    terms.push("restaurant", "quiet restaurant", "bistro", "fine dining", "peaceful restaurant", "cozy restaurant")
  }

  // Park & Nature searches
  if (query.includes("park") || query.includes("garden") || query.includes("nature")) {
    terms.push(
      "park",
      "garden",
      "botanical garden",
      "public park",
      "nature park",
      "city park",
      "community garden",
      "arboretum",
    )
  }

  // Library & Study searches
  if (query.includes("library") || query.includes("book") || query.includes("study")) {
    terms.push("library", "public library", "bookstore", "reading room", "study space", "academic library")
  }

  // Museum & Culture searches
  if (query.includes("museum") || query.includes("art") || query.includes("gallery")) {
    terms.push("museum", "art gallery", "art museum", "cultural center", "exhibition", "gallery space")
  }

  // Spiritual & Religious searches
  if (query.includes("temple") || query.includes("church") || query.includes("spiritual")) {
    terms.push("temple", "church", "mosque", "synagogue", "spiritual center", "meditation temple", "monastery")
  }

  // Quiet & Peaceful searches
  if (query.includes("quiet") || query.includes("peaceful") || query.includes("calm") || query.includes("tranquil")) {
    terms.push("quiet cafe", "peaceful place", "tranquil spot", "calm environment", "serene location", "zen space")
  }

  // Shopping & Retail (for quiet bookstores, etc.)
  if (query.includes("shop") || query.includes("store") || query.includes("bookstore")) {
    terms.push("bookstore", "quiet shop", "specialty store", "local shop", "artisan shop")
  }

  // Remove duplicates and return
  return [...new Set(terms)]
}

// Enhanced Google Places search with comprehensive error handling
async function searchGooglePlaces(lat: number, lng: number, searchTerm: string, apiKey: string): Promise<Place[]> {
  try {
    // Use text search as primary method (more reliable)
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm + " near me")}&location=${lat},${lng}&radius=5000&key=${apiKey}`

    console.log(`🔍 Searching Google Places for: "${searchTerm}"`)

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    // Check if response is ok
    if (!response.ok) {
      console.error(`❌ Google Places API HTTP error: ${response.status} ${response.statusText}`)
      return []
    }

    // Check content type
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`❌ Google Places API returned non-JSON content: ${contentType}`)
      const text = await response.text()
      console.error(`Response text: ${text.substring(0, 200)}...`)
      return []
    }

    const data = await response.json()

    if (data.status === "OK" && data.results) {
      console.log(`✅ Found ${data.results.length} results for "${searchTerm}"`)

      // Transform results to our Place format
      const places: Place[] = []

      for (const place of data.results.slice(0, 8)) {
        // Limit to 8 results per search
        try {
          // Get high-quality photo
          let imageUrl = `/placeholder.svg?height=300&width=600&query=${encodeURIComponent(place.name + " " + searchTerm)}`

          if (place.photos && place.photos.length > 0) {
            const photoReference = place.photos[0].photo_reference
            imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&maxheight=400&photoreference=${photoReference}&key=${apiKey}`
          }

          // Calculate distance
          const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)

          // Enhanced tranquility mapping
          const tranquility = mapPlaceTypeToTranquility(place.types || [], place.name || "")

          const transformedPlace: Place = {
            id: `google-${place.place_id}`,
            name: place.name,
            distanceMeters: Math.round(distance),
            tranquility,
            fsqRating: place.rating ? place.rating * 2 : Math.random() * 2 + 7.5,
            category: getCategoryFromTypes(place.types || []),
            imageUrl,
            address: place.vicinity || place.formatted_address || "Address not available",
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            pos: {
              x: Math.random() * 80 + 10,
              y: Math.random() * 80 + 10,
            },
          }

          places.push(transformedPlace)
        } catch (error) {
          console.error("❌ Error transforming place:", error)
        }
      }

      return places
    } else if (data.status === "ZERO_RESULTS") {
      console.log(`ℹ️ No results for "${searchTerm}"`)
      return []
    } else {
      console.error(`❌ Google Places API error for "${searchTerm}":`, data.status, data.error_message || "")
      return []
    }
  } catch (error) {
    console.error(`❌ Network/Parse error in searchGooglePlaces for "${searchTerm}":`, error)
    return []
  }
}

// Remove duplicate places with smart deduplication
function removeDuplicatePlaces(places: Place[]): Place[] {
  const seen = new Set<string>()
  const unique: Place[] = []

  for (const place of places) {
    // Create multiple keys to catch different types of duplicates
    const nameKey = place.name.toLowerCase().replace(/[^a-z0-9]/g, "")
    const locationKey = `${Math.round(place.lat * 10000)}-${Math.round(place.lng * 10000)}`
    const combinedKey = `${nameKey}-${locationKey}`

    if (!seen.has(combinedKey)) {
      seen.add(combinedKey)
      unique.push(place)
    }
  }

  return unique
}

// Filter for quality places (remove low-quality results)
function filterQualityPlaces(places: Place[]): Place[] {
  return places.filter((place) => {
    // Filter out places that are clearly not tranquil
    const name = place.name.toLowerCase()
    const category = place.category.toLowerCase()

    // Exclude noisy places
    if (
      name.includes("gas station") ||
      name.includes("atm") ||
      name.includes("parking") ||
      name.includes("car wash") ||
      name.includes("auto") ||
      category.includes("gas_station") ||
      category.includes("atm") ||
      category.includes("parking")
    ) {
      return false
    }

    // Include all others
    return true
  })
}

// Enhanced tranquility mapping with name analysis
function mapPlaceTypeToTranquility(types: string[], name = ""): number {
  const typeString = types.join(" ").toLowerCase()
  const nameString = name.toLowerCase()

  // Highest tranquility (5/5)
  if (
    typeString.includes("park") ||
    typeString.includes("garden") ||
    typeString.includes("nature") ||
    typeString.includes("spa") ||
    typeString.includes("temple") ||
    typeString.includes("church") ||
    typeString.includes("monastery") ||
    nameString.includes("zen") ||
    nameString.includes("meditation") ||
    nameString.includes("botanical") ||
    nameString.includes("arboretum")
  ) {
    return 5
  }

  // High tranquility (4/5)
  if (
    typeString.includes("library") ||
    typeString.includes("museum") ||
    typeString.includes("gallery") ||
    typeString.includes("bookstore") ||
    nameString.includes("quiet") ||
    nameString.includes("peaceful") ||
    nameString.includes("wellness")
  ) {
    return 4
  }

  // Medium tranquility (3/5)
  if (
    typeString.includes("cafe") ||
    typeString.includes("coffee") ||
    typeString.includes("restaurant") ||
    nameString.includes("tea house") ||
    nameString.includes("bistro")
  ) {
    return 3
  }

  // Lower tranquility (2/5)
  if (typeString.includes("store") || typeString.includes("shop")) {
    return 2
  }

  return 3 // Default tranquility
}

// Enhanced category mapping
function getCategoryFromTypes(types: string[]): string {
  const typeString = types.join(" ").toLowerCase()

  if (typeString.includes("park")) return "Park"
  if (typeString.includes("library")) return "Library"
  if (typeString.includes("museum")) return "Museum"
  if (typeString.includes("spa")) return "Spa"
  if (typeString.includes("cafe") || typeString.includes("coffee")) return "Café"
  if (typeString.includes("restaurant")) return "Restaurant"
  if (typeString.includes("store") || typeString.includes("shop")) return "Store"
  if (typeString.includes("church") || typeString.includes("temple")) return "Place of Worship"
  if (typeString.includes("hospital") || typeString.includes("health")) return "Healthcare"
  if (typeString.includes("school") || typeString.includes("university")) return "Education"
  if (typeString.includes("lodging") || typeString.includes("hotel")) return "Lodging"
  if (typeString.includes("beauty") || typeString.includes("wellness")) return "Wellness"

  return "Place"
}