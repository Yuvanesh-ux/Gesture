export interface RoutineConfig {
  bodyParts: string[]
  contentType: "sfw" | "nsfw"
  timePerImage: number // Changed from sessionDuration to timePerImage
  imageCount: number
  timerDuration: number
}

export interface BodyPartOption {
  id: string
  label: string
  description: string
  icon: string
}
