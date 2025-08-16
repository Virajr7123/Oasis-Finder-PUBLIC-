"use client"

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Add Google Maps API key configuration
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

let authInstance: Auth | null = null
let appInstance: FirebaseApp | null = null

export function getFirebaseAuth() {
  if (typeof window === "undefined") return null
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    appInstance = app
    if (!authInstance) {
      authInstance = getAuth(app)
      // Optional: use device language
      authInstance.useDeviceLanguage()
    }
    return authInstance
  } catch (e) {
    console.error("Failed to init Firebase:", e)
    return null
  }
}

export function getFirebaseApp() {
  return appInstance
}
