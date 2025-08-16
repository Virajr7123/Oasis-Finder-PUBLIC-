export interface FoursquarePlace {
  fsq_id: string
  name: string
  location: {
    address?: string
    locality?: string
    region?: string
    country?: string
    formatted_address?: string
  }
  geocodes: {
    main: {
      latitude: number
      longitude: number
    }
  }
  categories: Array<{
    id: number
    name: string
    icon: {
      prefix: string
      suffix: string
    }
  }>
  distance?: number
  rating?: number
  photos?: Array<{
    id: string
    prefix: string
    suffix: string
    width: number
    height: number
  }>
}

export interface FoursquareResponse {
  results: FoursquarePlace[]
}

// Updated categories for current Foursquare API
export const TRANQUIL_CATEGORIES = [
  "16032", // Park
  "16033", // Garden
  "12059", // Library
  "12060", // Museum
  "13034", // Café
  "13035", // Coffee Shop
  "10032", // Spa
  "10033", // Yoga Studio
]

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function mapCategoryToTranquility(categories: FoursquarePlace["categories"]): number {
  if (!categories.length) return 3

  const category = categories[0]
  const categoryName = category.name.toLowerCase()

  // Higher tranquility for nature and quiet spaces
  if (categoryName.includes("park") || categoryName.includes("garden") || categoryName.includes("nature")) return 5
  if (categoryName.includes("library") || categoryName.includes("museum") || categoryName.includes("gallery")) return 4
  if (categoryName.includes("spa") || categoryName.includes("yoga") || categoryName.includes("meditation")) return 5
  if (categoryName.includes("café") || categoryName.includes("coffee") || categoryName.includes("tea")) return 3
  if (categoryName.includes("beach") || categoryName.includes("lake") || categoryName.includes("river")) return 5
  if (categoryName.includes("temple") || categoryName.includes("church") || categoryName.includes("spiritual")) return 4

  return 3
}
