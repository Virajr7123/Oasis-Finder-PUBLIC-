"use client"

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"

// Prefer env-provided config; fall back to current defaults.
// You can set these as NEXT_PUBLIC_* in the v0 project settings if needed.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCPO6gytM_AApVxxAE4QIA1rtDhuIOinMs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sweet-spot-d2807.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sweet-spot-d2807",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sweet-spot-d2807.appspot.com", // ensure appspot.com
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1087094087535",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1087094087535:web:87aa1885d464a4566bd29a",
}

// Add Google Maps API key configuration
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAbEb5js41huSFfNkNmDZuH_k8rfkUIudM"

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
