"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"loading" | "ready" | "entering">("loading")

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setPhase("ready")
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (phase === "ready") {
      const timer = setTimeout(() => {
        setPhase("entering")
        setTimeout(onComplete, 600)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <AnimatePresence>
      {phase !== "entering" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 bg-neutral-950 z-50 flex items-center justify-center"
        >
          <div className="text-center">
            {/* Logo/Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-light text-white tracking-widest">
                CREATIVE STUDIO
              </h1>
              <p className="text-neutral-500 text-sm mt-2 tracking-wide">
                Portfolio Experience
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.2 }}
              className="w-64 mx-auto"
            >
              <div className="h-0.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              <div className="mt-4 flex justify-between text-xs text-neutral-500">
                <span>Loading experience</span>
                <span>{Math.round(Math.min(progress, 100))}%</span>
              </div>
            </motion.div>

            {/* Ready state */}
            <AnimatePresence>
              {phase === "ready" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 text-neutral-400 text-sm"
                >
                  Entering workspace...
                </motion.p>
              )}
            </AnimatePresence>

            {/* Loading hints */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-neutral-600 text-xs max-w-xs mx-auto"
            >
              <p>Explore my creative workspace in 3D</p>
              <p className="mt-1">Interact with objects to discover my work</p>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Subtle grid */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #333 1px, transparent 1px),
                  linear-gradient(to bottom, #333 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
            
            {/* Corner accents */}
            <div className="absolute top-8 left-8 w-12 h-12 border-l border-t border-neutral-800" />
            <div className="absolute top-8 right-8 w-12 h-12 border-r border-t border-neutral-800" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-neutral-800" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-neutral-800" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
