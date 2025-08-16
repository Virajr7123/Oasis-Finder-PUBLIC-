"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import LeafRating from "./leaf-rating"

type Props = {
  open?: boolean
  onOpenChange?: (o: boolean) => void
  placeName?: string
}

export default function SubmissionModal({ open = false, onOpenChange, placeName = "this place" }: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  function submit() {
    // Placeholder submit
    console.log("Submitted rating", { rating, comment, placeName })
    onOpenChange?.(false)
    setRating(0)
    setComment("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#2D3748]">{`How peaceful is ${placeName}?`}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <LeafRating value={rating} interactive onChange={setRating} size={22} />
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts... what makes this place special?"
            className="min-h-[120px]"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-slate-300 text-[#2D3748] bg-transparent"
            onClick={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={rating === 0}
            onClick={submit}
            className="rounded-xl bg-[#4FD1C5] hover:bg-[#3bb9ad] text-[#2D3748]"
          >
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
