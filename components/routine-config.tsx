"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Play, User } from "lucide-react"
import type { RoutineConfig, BodyPartOption } from "@/types/routine"

const BODY_PART_OPTIONS: BodyPartOption[] = [
  {
    id: "full-body",
    label: "Full Body",
    description: "Complete figure poses with dynamic movement",
    icon: "🧍",
  },
  {
    id: "hands",
    label: "Hands",
    description: "Hand gestures, finger positions, and grip studies",
    icon: "✋",
  },
  {
    id: "heads",
    label: "Heads & Faces",
    description: "Portraits, facial expressions, and head angles",
    icon: "👤",
  },
  {
    id: "feet",
    label: "Feet",
    description: "Foot anatomy, toe positions, and ankle studies",
    icon: "🦶",
  },
  {
    id: "torso",
    label: "Torso",
    description: "Chest, back, shoulders, and core anatomy",
    icon: "🫁",
  },
]

const TIMER_OPTIONS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 0, label: "No timer" },
]

interface RoutineConfigProps {
  onStartRoutine: (config: RoutineConfig) => void
}

export function RoutineConfig({ onStartRoutine }: RoutineConfigProps) {
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(["full-body"])
  const [contentType, setContentType] = useState<"sfw" | "nsfw">("sfw")
  const [imageCount, setImageCount] = useState([12])
  const [timerDuration, setTimerDuration] = useState(60)
  const [timePerImage, setTimePerImage] = useState([60])

  const toggleBodyPart = (bodyPartId: string) => {
    setSelectedBodyParts((prev) =>
      prev.includes(bodyPartId) ? prev.filter((id) => id !== bodyPartId) : [...prev, bodyPartId],
    )
  }

  const handleStartRoutine = () => {
    const config: RoutineConfig = {
      bodyParts: selectedBodyParts,
      contentType,
      timePerImage: timePerImage[0],
      imageCount: imageCount[0],
      timerDuration: timePerImage[0], // Use the same value for timer duration
    }
    onStartRoutine(config)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Configure Your Drawing Session</h1>
        <p className="text-lg text-muted-foreground">
          Set up your gesture drawing practice with customized references and timing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Body Parts Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Body Parts Focus
            </CardTitle>
            <CardDescription>Choose which body parts you want to practice drawing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {BODY_PART_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedBodyParts.includes(option.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleBodyPart(option.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{option.label}</h3>
                      {selectedBodyParts.includes(option.id) && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Session Settings
            </CardTitle>
            <CardDescription>Configure timing and content preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Type Toggle */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Content Type</Label>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <div className="font-medium">{contentType === "sfw" ? "Safe for Work" : "Artistic Nude"}</div>
                  <div className="text-sm text-muted-foreground">
                    {contentType === "sfw"
                      ? "Dynamic poses with clothing, focused on movement and gesture"
                      : "Artistic nude references for anatomical study"}
                  </div>
                </div>
                <Switch
                  checked={contentType === "nsfw"}
                  onCheckedChange={(checked) => setContentType(checked ? "nsfw" : "sfw")}
                />
              </div>
            </div>

            <Separator />

            {/* Quick Timer Presets */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Quick Timer Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 120, 300, 600].map((seconds) => (
                  <Button
                    key={seconds}
                    variant={timePerImage[0] === seconds ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimePerImage([seconds])}
                  >
                    {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Image Count */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Number of Images: {imageCount[0]}</Label>
              <Slider value={imageCount} onValueChange={setImageCount} max={24} min={6} step={3} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 images</span>
                <span>24 images</span>
              </div>
            </div>

            <Separator />

            {/* Time per Image */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Time per Image: {timePerImage[0]} seconds</Label>
              <Slider
                value={timePerImage}
                onValueChange={setTimePerImage}
                max={600}
                min={15}
                step={15}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15 sec</span>
                <span>10 min</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Total session: ~{Math.round((timePerImage[0] * imageCount[0]) / 60)} minutes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <Button
          onClick={handleStartRoutine}
          size="lg"
          className="px-8 py-3 text-lg"
          disabled={selectedBodyParts.length === 0}
        >
          <Play className="w-5 h-5 mr-2" />
          Start Drawing Session
        </Button>
        {selectedBodyParts.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">Please select at least one body part to focus on</p>
        )}
      </div>
    </div>
  )
}
