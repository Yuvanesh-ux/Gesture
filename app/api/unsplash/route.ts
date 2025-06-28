import { type NextRequest, NextResponse } from "next/server"

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

// Search queries for different body parts and content types
const SEARCH_QUERIES = {
  "full-body": {
    sfw: "figure drawing dynamic pose reference human anatomy action pose dance movement athletic",
    nsfw: "figure drawing nude reference human anatomy artistic nude pose life drawing",
  },
  hands: {
    sfw: "hand gesture reference drawing anatomy fingers palm artistic hand pose",
    nsfw: "hand anatomy reference artistic nude hand gesture life drawing",
  },
  heads: {
    sfw: "portrait reference face anatomy head drawing facial expression profile",
    nsfw: "portrait nude reference face anatomy artistic nude portrait life drawing",
  },
  feet: {
    sfw: "feet anatomy reference foot drawing toes ankle artistic foot pose",
    nsfw: "feet anatomy nude reference artistic nude foot life drawing",
  },
  torso: {
    sfw: "torso anatomy reference chest back shoulder artistic pose figure drawing",
    nsfw: "torso nude reference artistic nude chest back life drawing anatomy",
  },
}

export async function GET(request: NextRequest) {
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ error: "Unsplash API key not configured" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const bodyPart = searchParams.get("bodyPart") || "full-body"
  const contentType = searchParams.get("contentType") || "sfw"
  const count = Number.parseInt(searchParams.get("count") || "12")

  const query =
    SEARCH_QUERIES[bodyPart as keyof typeof SEARCH_QUERIES]?.[contentType as "sfw" | "nsfw"] ||
    SEARCH_QUERIES["full-body"]["sfw"]

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=${count}&orientation=portrait`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from Unsplash")
    }

    const data = await response.json()

    // Transform the data to include only what we need
    const images = Array.isArray(data) ? data : [data]
    const transformedImages = images.map((img: any) => ({
      id: img.id,
      url: img.urls.regular,
      thumb: img.urls.thumb,
      alt: img.alt_description || `${bodyPart} gesture drawing reference`,
      photographer: img.user.name,
      photographerUrl: img.user.links.html,
      downloadUrl: img.links.download_location,
    }))

    return NextResponse.json({ images: transformedImages })
  } catch (error) {
    console.error("Error fetching from Unsplash:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
