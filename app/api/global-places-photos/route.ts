import { NextResponse } from "next/server"
import { globalOasisPlaces } from "@/lib/data"

// Function to get Google Places photo (same as Google Maps uses)
async function getGooglePlacePhoto(placeName: string, lat: number, lng: number): Promise<string | null> {
  try {
    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!GOOGLE_API_KEY || GOOGLE_API_KEY.length < 10) {
      console.log("Google API key not available")
      return null
    }

    // Search for the exact place on Google Places (same as Google Maps)
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&locationbias=circle:5000@${lat},${lng}&fields=place_id,photos,name&key=${GOOGLE_API_KEY}`

    console.log(`Fetching Google photo for: ${placeName}`)
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (searchData.status !== "OK") {
      console.log(`Google Places search failed for ${placeName}:`, searchData.status)
      return null
    }

    if (searchData.candidates && searchData.candidates.length > 0) {
      const candidate = searchData.candidates[0]

      if (candidate.photos && candidate.photos.length > 0) {
        const photoReference = candidate.photos[0].photo_reference

        // Get the actual photo URL (same as Google Maps displays)
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&maxheight=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`

        console.log(`✅ Found Google photo for: ${placeName}`)
        return photoUrl
      }
    }

    console.log(`❌ No Google photo found for: ${placeName}`)
    return null
  } catch (error) {
    console.error(`Error fetching Google photo for ${placeName}:`, error)
    return null
  }
}

export async function GET() {
  try {
    console.log("🔄 Fetching Google Photos for global places...")

    // Fetch real Google Photos for all global places
    const placesWithPhotos = await Promise.all(
      globalOasisPlaces.map(async (place) => {
        const googlePhoto = await getGooglePlacePhoto(place.name, place.lat, place.lng)

        return {
          ...place,
          imageUrl: googlePhoto || `/placeholder.svg?height=300&width=600&query=${encodeURIComponent(place.name)}`,
        }
      }),
    )

    console.log("✅ Successfully fetched photos for global places")
    return NextResponse.json({ places: placesWithPhotos, success: true })
  } catch (error) {
    console.error("❌ Error fetching global places photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}
