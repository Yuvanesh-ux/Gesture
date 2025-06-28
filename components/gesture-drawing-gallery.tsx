"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Timer, ArrowLeft, Pause, Play } from "lucide-react"
import Image from "next/image"
import type { RoutineConfig } from "@/types/routine"

interface UnsplashImage {
  id: string
  url: string
  thumb: string
  alt: string
  photographer: string
  photographerUrl: string
  downloadUrl: string
}

interface GestureDrawingGalleryProps {
  config: RoutineConfig
  onBackToConfig: () => void
}

export function GestureDrawingGallery({ config, onBackToConfig }: GestureDrawingGalleryProps) {
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timer, setTimer] = useState<number | null>(null)
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [sessionStartTime] = useState(Date.now())

  const fetchImages = async (bodyPart: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/unsplash?bodyPart=${bodyPart}&contentType=${config.contentType}&count=${config.imageCount}`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch images")
      }

      return data.images
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return []
    }
  }

  const loadAllImages = async () => {
    setLoading(true)
    const allImages: UnsplashImage[] = []

    for (const bodyPart of config.bodyParts) {
      const bodyPartImages = await fetchImages(bodyPart)
      allImages.push(...bodyPartImages)
    }

    // Shuffle the images for variety
    const shuffledImages = allImages.sort(() => Math.random() - 0.5)
    setImages(shuffledImages.slice(0, config.imageCount))
    setLoading(false)
  }

  const startTimer = () => {
    if (config.timePerImage === 0) return

    setTimer(config.timePerImage)
    setIsPaused(false)

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          // Auto advance to next image
          setCurrentImageIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : prevIndex))
          // Start timer for next image
          setTimeout(() => startTimer(), 1000)
          return null
        }
        return prev - 1
      })
    }, 1000)

    setActiveTimer(interval)
  }

  const pauseTimer = () => {
    if (activeTimer) {
      clearInterval(activeTimer)
      setActiveTimer(null)
      setIsPaused(true)
    }
  }

  const resumeTimer = () => {
    if (timer && timer > 0) {
      setIsPaused(false)
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            setCurrentImageIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : prevIndex))
            setTimeout(() => startTimer(), 1000)
            return null
          }
          return prev - 1
        })
      }, 1000)
      setActiveTimer(interval)
    }
  }

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
      if (config.timePerImage > 0) {
        if (activeTimer) clearInterval(activeTimer)
        startTimer()
      }
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
      if (config.timePerImage > 0) {
        if (activeTimer) clearInterval(activeTimer)
        startTimer()
      }
    }
  }

  useEffect(() => {
    loadAllImages()
    return () => {
      if (activeTimer) {
        clearInterval(activeTimer)
      }
    }
  }, [])

  useEffect(() => {
    if (images.length > 0 && config.timePerImage > 0) {
      startTimer()
    }
  }, [images])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getSessionProgress = () => {
    const totalExpectedTime = config.timePerImage * images.length // Total expected session time in seconds
    const elapsed = (Date.now() - sessionStartTime) / 1000 // elapsed time in seconds
    return Math.min((elapsed / totalExpectedTime) * 100, 100)
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={loadAllImages} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onBackToConfig} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Config
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={onBackToConfig} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Config
          </Button>
          <div className="text-center">
            <p className="text-lg">Loading your drawing session...</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Skeleton className="w-96 h-[500px]" />
        </div>
      </div>
    )
  }

  const currentImage = images[currentImageIndex]

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <Button onClick={onBackToConfig} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Config
        </Button>

        <div className="flex items-center gap-4">
          {/* Session Progress */}
          <div className="text-sm text-muted-foreground">Session: {Math.round(getSessionProgress())}%</div>

          {/* Image Counter */}
          <Badge variant="outline">
            {currentImageIndex + 1} / {images.length}
          </Badge>

          {/* Timer */}
          {config.timePerImage > 0 && timer !== null && (
            <Badge variant="secondary" className="text-lg px-3 py-1">
              <Timer className="w-4 h-4 mr-1" />
              {formatTime(timer)}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {config.timePerImage > 0 && (
            <Button onClick={isPaused ? resumeTimer : pauseTimer} variant="outline" size="sm">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          )}
          <Button onClick={loadAllImages} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Image Display */}
      {currentImage && (
        <div className="flex justify-center">
          <Card className="overflow-hidden w-full max-w-4xl">
            <CardContent className="p-0">
              <div className="relative w-full h-[70vh] min-h-[500px]">
                <Image
                  src={currentImage.url || "/placeholder.svg"}
                  alt={currentImage.alt}
                  fill
                  className="object-contain bg-gray-50"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                />
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Photo by{" "}
                  <a
                    href={currentImage.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-medium"
                  >
                    {currentImage.photographer}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex justify-center gap-4">
        <Button onClick={prevImage} disabled={currentImageIndex === 0} variant="outline">
          Previous
        </Button>
        <Button onClick={nextImage} disabled={currentImageIndex === images.length - 1} variant="outline">
          Next
        </Button>
      </div>

      {/* Configuration Summary */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>
          <strong>Focus:</strong> {config.bodyParts.join(", ")} • <strong>Content:</strong>{" "}
          {config.contentType.toUpperCase()} • <strong>Time per image:</strong>{" "}
          {config.timePerImage > 0 ? `${config.timePerImage}s` : "No timer"} • <strong>Total images:</strong>{" "}
          {images.length}
        </p>
        <p>
          Images provided by{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-medium"
          >
            Unsplash
          </a>
        </p>
      </div>
    </div>
  )
}
