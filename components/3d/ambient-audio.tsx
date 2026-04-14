"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Volume2, VolumeX } from "lucide-react"

// Ambient room audio component - generates subtle room tone
export function AmbientAudio() {
  const [isMuted, setIsMuted] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{
    brownNoise: AudioBufferSourceNode | null
    filter: BiquadFilterNode | null
    gain: GainNode | null
  }>({
    brownNoise: null,
    filter: null,
    gain: null,
  })

  const initAudio = useCallback(() => {
    if (isInitialized) return

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      audioContextRef.current = audioContext

      // Create subtle room ambience using filtered noise
      const bufferSize = 2 * audioContext.sampleRate
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
      const output = noiseBuffer.getChannelData(0)

      // Generate brown noise (more natural room tone)
      let lastOut = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = output[i]
        output[i] *= 3.5 // Normalize
      }

      const noiseSource = audioContext.createBufferSource()
      noiseSource.buffer = noiseBuffer
      noiseSource.loop = true

      // Low-pass filter for subtle room tone
      const filter = audioContext.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = 200

      // Very low gain for subtle ambient effect
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 0

      // Connect nodes
      noiseSource.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Start noise
      noiseSource.start()

      // Store references
      nodesRef.current = {
        brownNoise: noiseSource,
        filter,
        gain: gainNode,
      }

      setIsInitialized(true)
    } catch (error) {
      console.log("Audio initialization failed:", error)
    }
  }, [isInitialized])

  const toggleMute = useCallback(() => {
    if (!isInitialized) {
      initAudio()
    }

    const gain = nodesRef.current.gain
    if (gain && audioContextRef.current) {
      if (isMuted) {
        // Resume audio context if suspended
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume()
        }
        // Fade in
        gain.gain.linearRampToValueAtTime(0.015, audioContextRef.current.currentTime + 0.5)
      } else {
        // Fade out
        gain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.3)
      }
    }

    setIsMuted(!isMuted)
  }, [isMuted, isInitialized, initAudio])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (nodesRef.current.brownNoise) {
        nodesRef.current.brownNoise.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 left-4 z-20 p-2 bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
      title={isMuted ? "Enable ambient audio" : "Mute ambient audio"}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 text-neutral-400" />
      ) : (
        <Volume2 className="w-4 h-4 text-white" />
      )}
    </button>
  )
}
