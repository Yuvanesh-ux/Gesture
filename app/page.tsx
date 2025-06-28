"use client"

import { useState } from "react"
import { RoutineConfig } from "@/components/routine-config"
import { GestureDrawingGallery } from "@/components/gesture-drawing-gallery"
import type { RoutineConfig as RoutineConfigType } from "@/types/routine"

export default function Home() {
  const [currentConfig, setCurrentConfig] = useState<RoutineConfigType | null>(null)

  const handleStartRoutine = (config: RoutineConfigType) => {
    setCurrentConfig(config)
  }

  const handleBackToConfig = () => {
    setCurrentConfig(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {currentConfig ? (
        <GestureDrawingGallery config={currentConfig} onBackToConfig={handleBackToConfig} />
      ) : (
        <RoutineConfig onStartRoutine={handleStartRoutine} />
      )}
    </div>
  )
}
