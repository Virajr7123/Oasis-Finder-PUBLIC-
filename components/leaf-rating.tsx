"use client"

import { Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  value?: number // 0..5
  size?: number
  interactive?: boolean
  onChange?: (v: number) => void
  className?: string
}

export default function LeafRating({ value = 0, size = 18, interactive = false, onChange, className }: Props) {
  const leaves = Array.from({ length: 5 }, (_, i) => i + 1)
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {leaves.map((i) => {
        const filled = i <= value
        const color = filled ? "#68D391" : "#A0AEC0" // Leaf Green or muted grey
        return (
          <button
            key={i}
            type="button"
            aria-label={`Leaf ${i}`}
            onClick={() => interactive && onChange?.(i)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            style={{ lineHeight: 0 }}
          >
            <Leaf
              width={size}
              height={size}
              className="transition-transform"
              style={{
                color,
                fill: filled ? color : "transparent",
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
