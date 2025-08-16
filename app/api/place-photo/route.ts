import { type NextRequest, NextResponse } from "next/server"

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

    console.log(`🔍 Fetching Google photo for place detail: ${placeName}`)
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (searchData.status !== "OK") {
      console.log(`❌ Google Places search failed for ${placeName}:`, searchData.status)
      return null
    }

    if (searchData.candidates && searchData.candidates.length > 0) {
      const candidate = searchData.candidates[0]

      if (candidate.photos && candidate.photos.length > 0) {
        const photoReference = candidate.photos[0].photo_reference

        // Get the actual photo URL (same as Google Maps displays)
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&maxheight=600&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`

        console.log(`✅ Found Google photo for place detail: ${placeName}`)
        return photoUrl
      }
    }

    console.log(`❌ No Google photo found for place detail: ${placeName}`)
    return null
  } catch (error) {
    console.error(`❌ Error fetching Google photo for ${placeName}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!name || !lat || !lng) {
      return NextResponse.json({ error: "Place name and coordinates are required" }, { status: 400 })
    }

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    console.log(`🔄 Fetching photo for place detail: ${name}`)

    const imageUrl = await getGooglePlacePhoto(name, latitude, longitude)

    if (imageUrl) {
      return NextResponse.json({
        success: true,
        imageUrl,
        message: `Found Google Maps photo for ${name}`,
      })
    } else {
      return NextResponse.json({
        success: false,
        imageUrl: null,
        message: `No Google Maps photo available for ${name}`,
      })
    }
  } catch (error) {
    console.error("❌ Error in place photo API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch place photo",
        success: false,
        imageUrl: null,
      },
      { status: 500 },
    )
  }
}