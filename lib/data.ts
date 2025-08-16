export type Review = { id: string; user: string; comment: string; rating: number }

export type Place = {
  id: string
  name: string
  distanceMeters: number
  tranquility: number // 1..5
  fsqRating: number // 0..10
  category: string
  imageUrl: string
  address: string
  lat: number
  lng: number
  pos?: { x: number; y: number } // percentage for mock map positioning
  reviews?: Review[]
  isGlobalShowcase?: boolean // New flag for global places
  country?: string
  description?: string
}

// Global showcase places - we'll fetch real Google Photos for these too
export const globalOasisPlaces: Place[] = [
  {
    id: "global-1",
    name: "Ryoan-ji Temple Rock Garden",
    distanceMeters: 0,
    tranquility: 5,
    fsqRating: 9.4,
    category: "Temple",
    imageUrl: "", // Will be populated with Google Photos
    address: "Kyoto, Japan",
    country: "Japan",
    lat: 35.0345,
    lng: 135.7183,
    pos: { x: 25, y: 30 },
    isGlobalShowcase: true,
    description: "A masterpiece of Zen Buddhism featuring 15 carefully placed stones in raked white gravel.",
    reviews: [
      { id: "g1-1", user: "Akiko", comment: "Pure meditation in stone and sand. Absolute silence.", rating: 5 },
      { id: "g1-2", user: "Marcus", comment: "The most peaceful place I've ever experienced.", rating: 5 },
    ],
  },
  {
    id: "global-2",
    name: "Central Park Bethesda Fountain",
    distanceMeters: 0,
    tranquility: 4,
    fsqRating: 9.1,
    category: "Park",
    imageUrl: "", // Will be populated with Google Photos
    address: "New York City, USA",
    country: "USA",
    lat: 40.7739,
    lng: -73.9718,
    pos: { x: 60, y: 45 },
    isGlobalShowcase: true,
    description: "An iconic oasis in Manhattan where the Angel of Waters watches over peaceful moments.",
    reviews: [
      { id: "g2-1", user: "Sarah", comment: "Magical escape from NYC chaos. The fountain is mesmerizing.", rating: 4 },
      {
        id: "g2-2",
        user: "Diego",
        comment: "Perfect spot for morning meditation before the crowds arrive.",
        rating: 4,
      },
    ],
  },
  {
    id: "global-3",
    name: "Jardin du Luxembourg",
    distanceMeters: 0,
    tranquility: 4,
    fsqRating: 9.3,
    category: "Garden",
    imageUrl: "", // Will be populated with Google Photos
    address: "Paris, France",
    country: "France",
    lat: 48.8462,
    lng: 2.3372,
    pos: { x: 40, y: 60 },
    isGlobalShowcase: true,
    description: "Elegant French gardens where Parisians find solace among manicured lawns and tree-lined promenades.",
    reviews: [
      {
        id: "g3-1",
        user: "Amélie",
        comment: "Mon jardin préféré. Perfect for reading under the chestnut trees.",
        rating: 4,
      },
      {
        id: "g3-2",
        user: "James",
        comment: "Quintessential Parisian tranquility. The palace views are stunning.",
        rating: 5,
      },
    ],
  },
  {
    id: "global-4",
    name: "Ubud Monkey Forest Sanctuary",
    distanceMeters: 0,
    tranquility: 4,
    fsqRating: 8.7,
    category: "Nature Reserve",
    imageUrl: "", // Will be populated with Google Photos
    address: "Ubud, Bali, Indonesia",
    country: "Indonesia",
    lat: -8.5069,
    lng: 115.2625,
    pos: { x: 75, y: 35 },
    isGlobalShowcase: true,
    description: "Sacred forest sanctuary where ancient temples blend with lush tropical nature.",
    reviews: [
      {
        id: "g4-1",
        user: "Kadek",
        comment: "Spiritual energy flows through these ancient trees. Very peaceful.",
        rating: 4,
      },
      { id: "g4-2", user: "Emma", comment: "Magical place where nature and spirituality meet perfectly.", rating: 4 },
    ],
  },
  {
    id: "global-5",
    name: "Kew Gardens",
    distanceMeters: 0,
    tranquility: 5,
    fsqRating: 9.0,
    category: "Botanical Garden",
    imageUrl: "", // Will be populated with Google Photos
    address: "London, United Kingdom",
    country: "UK",
    lat: 51.4879,
    lng: -0.2946,
    pos: { x: 20, y: 70 },
    isGlobalShowcase: true,
    description: "A serene Japanese-inspired garden featuring traditional architecture and peaceful water features.",
    reviews: [
      {
        id: "g5-1",
        user: "Oliver",
        comment: "Hidden gem in London. The bamboo grove is incredibly calming.",
        rating: 5,
      },
      { id: "g5-2", user: "Yuki", comment: "Authentic Japanese tranquility in the heart of England.", rating: 5 },
    ],
  },
  {
    id: "global-6",
    name: "Majorelle Garden",
    distanceMeters: 0,
    tranquility: 4,
    fsqRating: 8.9,
    category: "Garden",
    imageUrl: "", // Will be populated with Google Photos
    address: "Marrakech, Morocco",
    country: "Morocco",
    lat: 31.6417,
    lng: -8.0033,
    pos: { x: 85, y: 55 },
    isGlobalShowcase: true,
    description:
      "Vibrant cobalt blue villa surrounded by exotic plants and peaceful fountains in the heart of Marrakech.",
    reviews: [
      {
        id: "g6-1",
        user: "Fatima",
        comment: "The blue is so striking against the desert plants. Very peaceful.",
        rating: 4,
      },
      { id: "g6-2", user: "Pierre", comment: "Yves Saint Laurent's favorite retreat. I understand why.", rating: 4 },
    ],
  },
  {
    id: "global-7",
    name: "Philosopher's Path Kyoto",
    distanceMeters: 0,
    tranquility: 5,
    fsqRating: 9.2,
    category: "Walking Path",
    imageUrl: "", // Will be populated with Google Photos
    address: "Kyoto, Japan",
    country: "Japan",
    lat: 35.0184,
    lng: 135.7946,
    pos: { x: 30, y: 25 },
    isGlobalShowcase: true,
    description: "A contemplative stone path following a canal, lined with hundreds of cherry trees and small temples.",
    reviews: [
      {
        id: "g7-1",
        user: "Hiroshi",
        comment: "Perfect for morning walks and deep thinking. Especially beautiful in spring.",
        rating: 5,
      },
      {
        id: "g7-2",
        user: "Anna",
        comment: "The sound of flowing water and rustling leaves is pure meditation.",
        rating: 5,
      },
    ],
  },
  {
    id: "global-8",
    name: "Butchart Gardens",
    distanceMeters: 0,
    tranquility: 5,
    fsqRating: 9.1,
    category: "Garden",
    imageUrl: "", // Will be populated with Google Photos
    address: "Victoria, British Columbia, Canada",
    country: "Canada",
    lat: 48.5639,
    lng: -123.4675,
    pos: { x: 50, y: 80 },
    isGlobalShowcase: true,
    description: "Meticulously designed Japanese garden with koi ponds, stone lanterns, and peaceful bridges.",
    reviews: [
      {
        id: "g8-1",
        user: "Maple",
        comment: "The attention to detail is incredible. Every corner is perfectly balanced.",
        rating: 5,
      },
      {
        id: "g8-2",
        user: "Chen",
        comment: "Authentic Japanese design principles in a Canadian setting. Remarkable.",
        rating: 5,
      },
    ],
  },
]

// Original local places (keeping for backward compatibility)
export const places: Place[] = [
  {
    id: "1",
    name: "Sanjay Gandhi National Park – Bamboo Grove",
    distanceMeters: 500,
    tranquility: 5,
    fsqRating: 9.2,
    category: "Park",
    imageUrl: "", // Will be populated with Google Photos
    address: "Borivali East, Mumbai",
    lat: 19.214,
    lng: 72.91,
    pos: { x: 28, y: 36 },
    reviews: [
      { id: "a1", user: "Ira", comment: "Whispers of bamboo in the breeze.", rating: 5 },
      { id: "a2", user: "Kabir", comment: "Perfect for mindful walks.", rating: 5 },
    ],
  },
  {
    id: "2",
    name: "Quiet Leaf Library",
    distanceMeters: 820,
    tranquility: 4,
    fsqRating: 8.9,
    category: "Library",
    imageUrl: "", // Will be populated with Google Photos
    address: "42 Stillness Rd",
    lat: 19.118,
    lng: 72.842,
    pos: { x: 62, y: 24 },
  },
  {
    id: "3",
    name: "Hidden Courtyard Plaza",
    distanceMeters: 640,
    tranquility: 4,
    fsqRating: 8.4,
    category: "Plaza",
    imageUrl: "", // Will be populated with Google Photos
    address: "Old Town Passage",
    lat: 19.072,
    lng: 72.877,
    pos: { x: 45, y: 55 },
  },
  {
    id: "4",
    name: "Moss & Mint Cafe",
    distanceMeters: 450,
    tranquility: 3,
    fsqRating: 8.1,
    category: "Cafe",
    imageUrl: "", // Will be populated with Google Photos
    address: "7 Fern Lane",
    lat: 19.101,
    lng: 72.892,
    pos: { x: 72, y: 62 },
  },
  {
    id: "5",
    name: "Riverside Reading Steps",
    distanceMeters: 980,
    tranquility: 4,
    fsqRating: 8.6,
    category: "Park",
    imageUrl: "", // Will be populated with Google Photos
    address: "By the Eastern Bank",
    lat: 19.09,
    lng: 72.901,
    pos: { x: 17, y: 68 },
  },
  {
    id: "6",
    name: "Lotus View Knoll",
    distanceMeters: 1500,
    tranquility: 5,
    fsqRating: 9.4,
    category: "Park",
    imageUrl: "", // Will be populated with Google Photos
    address: "High Path",
    lat: 19.14,
    lng: 72.895,
    pos: { x: 84, y: 44 },
  },
]
