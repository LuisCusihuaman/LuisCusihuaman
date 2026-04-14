"use client"

import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with Three.js
const PortfolioScene = dynamic(
  () => import("@/components/3d/scene").then((mod) => mod.PortfolioScene),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Initializing...</p>
        </div>
      </div>
    )
  }
)

export default function HomePage() {
  return <PortfolioScene />
}
