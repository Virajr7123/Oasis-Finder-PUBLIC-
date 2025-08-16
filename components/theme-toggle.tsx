"use client"

import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-slate-200 animate-pulse" />
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-16 h-8 rounded-full transition-all duration-700 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4FD1C5] shadow-lg hover:shadow-xl",
        theme === "light"
          ? "bg-gradient-to-r from-sky-400 via-sky-300 to-sky-200"
          : "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600",
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Toggle Track */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-700 ease-in-out",
          theme === "light"
            ? "bg-gradient-to-r from-sky-300 to-blue-200"
            : "bg-gradient-to-r from-slate-900 to-slate-700",
        )}
      />

      {/* Clouds (Light Mode) */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-700 ease-in-out",
          theme === "light" ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Cloud 1 */}
        <div className="absolute top-1 left-2 w-3 h-2 bg-white rounded-full opacity-80 animate-float" />
        <div className="absolute top-1.5 left-1.5 w-2 h-1.5 bg-white rounded-full opacity-60 animate-float-delayed" />

        {/* Cloud 2 */}
        <div className="absolute top-1 right-2 w-2.5 h-1.5 bg-white rounded-full opacity-70 animate-float-slow" />
        <div className="absolute top-1.5 right-1.5 w-2 h-1 bg-white rounded-full opacity-50 animate-float" />

        {/* Cloud 3 */}
        <div className="absolute bottom-1 left-3 w-2 h-1 bg-white rounded-full opacity-60 animate-float-delayed" />
      </div>

      {/* Stars (Dark Mode) */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-700 ease-in-out",
          theme === "dark" ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Star 1 */}
        <div className="absolute top-1.5 left-2 w-1 h-1 animate-twinkle">
          <div className="w-full h-full bg-yellow-200 rounded-full animate-pulse" />
          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-yellow-200 transform -translate-x-1/2 -translate-y-0.5 animate-pulse" />
          <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-yellow-200 transform -translate-y-1/2 -translate-x-0.5 animate-pulse" />
        </div>

        {/* Star 2 */}
        <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-yellow-100 rounded-full animate-twinkle-delayed" />

        {/* Star 3 */}
        <div className="absolute bottom-1.5 left-3 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-twinkle-slow" />

        {/* Star 4 */}
        <div className="absolute bottom-2 right-3 w-1 h-1 animate-twinkle">
          <div className="w-full h-full bg-yellow-100 rounded-full animate-pulse" />
        </div>

        {/* Star 5 */}
        <div className="absolute top-1 left-4 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-twinkle-delayed" />
      </div>

      {/* Sun/Moon Toggle Circle */}
      <div
        className={cn(
          "absolute top-0.5 w-7 h-7 rounded-full shadow-lg transition-all duration-700 ease-in-out transform",
          theme === "light"
            ? "left-0.5 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 shadow-yellow-300/50"
            : "left-8 bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100 shadow-slate-400/50",
        )}
      >
        {/* Sun Rays (Light Mode) */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out",
            theme === "light" ? "opacity-100 rotate-0" : "opacity-0 rotate-180",
          )}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-2 bg-yellow-300 rounded-full animate-sun-rays"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "center 14px",
                transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Moon Craters (Dark Mode) */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out",
            theme === "dark" ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full opacity-30" />
          <div className="absolute top-2.5 left-3 w-1 h-1 bg-slate-400 rounded-full opacity-20" />
          <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-slate-400 rounded-full opacity-40" />
        </div>
      </div>
    </button>
  )
}
