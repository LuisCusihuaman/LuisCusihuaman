"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { RoundedBox, Html } from "@react-three/drei"

interface DeskSetupProps {
  onObjectHover: (object: string | null) => void
  onObjectClick: (object: string) => void
}

export function DeskSetup({ onObjectHover, onObjectClick }: DeskSetupProps) {
  const [deskHeight, setDeskHeight] = useState(0.75) // Default sitting height
  const [isAdjusting, setIsAdjusting] = useState(false)
  const targetHeight = useRef(0.75)
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  
  // Smooth desk height animation
  useFrame(() => {
    if (Math.abs(deskHeight - targetHeight.current) > 0.001) {
      setDeskHeight(prev => prev + (targetHeight.current - prev) * 0.1)
    }
  })
  
  // Check proximity for desk adjustment
  useFrame(() => {
    if (!groupRef.current) return
    const deskPos = new THREE.Vector3(0, 0, -1.6)
    const dist = camera.position.distanceTo(deskPos)
    setIsAdjusting(dist < 2)
  })
  
  // Handle desk height adjustment with Q/Z keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAdjusting) return
      if (e.code === "KeyQ") {
        targetHeight.current = Math.min(1.1, targetHeight.current + 0.05) // Standing
      } else if (e.code === "KeyZ") {
        targetHeight.current = Math.max(0.65, targetHeight.current - 0.05) // Sitting
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isAdjusting])
  
  return (
    <group ref={groupRef} position={[0, 0, -1.6]}>
      {/* Main Desk - Standing desk with adjustable height */}
      <StandingDesk height={deskHeight} isAdjusting={isAdjusting} />
      
      {/* Piano keyboard under desk - slides out */}
      <Piano deskHeight={deskHeight} onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Wall-mounted TV - Bigger and lower */}
      <TV onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Drawing Tablet - Better model */}
      <DrawingTablet deskHeight={deskHeight} onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Laptop */}
      <Laptop deskHeight={deskHeight} onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Keyboard */}
      <Keyboard deskHeight={deskHeight} />
      
      {/* Mouse */}
      <Mouse deskHeight={deskHeight} />
      
      {/* Red Mug */}
      <Mug deskHeight={deskHeight} onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Phone */}
      <Phone deskHeight={deskHeight} onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Microphone - Better model */}
      <Microphone deskHeight={deskHeight} onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Ring Light */}
      <RingLight />
      
      {/* Webcam */}
      <Webcam deskHeight={deskHeight} />
      
      {/* Plant */}
      <Plant deskHeight={deskHeight} onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Dock */}
      <Dock deskHeight={deskHeight} />
      
      {/* Office Chair */}
      <OfficeChair />
      
      {/* Orange Plushie */}
      <Plushie deskHeight={deskHeight} />
      
      {/* Sheet music on wall */}
      <SheetMusic />
    </group>
  )
}

function StandingDesk({ height, isAdjusting }: { height: number; isAdjusting: boolean }) {
  const deskWidth = 2.4
  const deskDepth = 0.65
  const legHeight = height - 0.03
  const legWidth = 0.06
  
  return (
    <group>
      {/* Desk top - Light natural wood */}
      <RoundedBox
        args={[deskWidth, 0.04, deskDepth]}
        position={[0, height, 0]}
        radius={0.005}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#c4a77d" roughness={0.4} metalness={0.05} />
      </RoundedBox>
      
      {/* Left leg frame - motorized standing desk style */}
      <group position={[-deskWidth / 2 + 0.12, 0, 0]}>
        {/* Outer leg */}
        <mesh position={[0, legHeight * 0.3, 0]} castShadow>
          <boxGeometry args={[legWidth, legHeight * 0.6, deskDepth - 0.15]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Inner telescoping part */}
        <mesh position={[0, legHeight * 0.7, 0]} castShadow>
          <boxGeometry args={[legWidth - 0.015, legHeight * 0.5, deskDepth - 0.2]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Motor housing */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[legWidth + 0.02, 0.12, 0.15]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>
      
      {/* Right leg frame */}
      <group position={[deskWidth / 2 - 0.12, 0, 0]}>
        {/* Outer leg */}
        <mesh position={[0, legHeight * 0.3, 0]} castShadow>
          <boxGeometry args={[legWidth, legHeight * 0.6, deskDepth - 0.15]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Inner telescoping part */}
        <mesh position={[0, legHeight * 0.7, 0]} castShadow>
          <boxGeometry args={[legWidth - 0.015, legHeight * 0.5, deskDepth - 0.2]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Motor housing */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[legWidth + 0.02, 0.12, 0.15]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>
      
      {/* Horizontal support bar */}
      <mesh position={[0, 0.08, deskDepth / 2 - 0.08]} castShadow>
        <boxGeometry args={[deskWidth - 0.3, 0.03, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Control panel on right side */}
      <group position={[deskWidth / 2 - 0.2, height + 0.025, deskDepth / 2 - 0.1]}>
        <RoundedBox args={[0.12, 0.02, 0.06]} radius={0.005} smoothness={4}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
        </RoundedBox>
        {/* Display */}
        <mesh position={[0, 0.011, 0]}>
          <planeGeometry args={[0.06, 0.025]} />
          <meshStandardMaterial color="#001a00" emissive="#003300" emissiveIntensity={0.3} />
        </mesh>
        {/* Buttons */}
        {[-0.04, 0.04].map((x, i) => (
          <mesh key={i} position={[x, 0.012, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
            <meshStandardMaterial color="#333333" roughness={0.4} />
          </mesh>
        ))}
      </group>
      
      {/* Piano shelf - slides with piano */}
      <RoundedBox
        args={[deskWidth - 0.3, 0.02, 0.35]}
        position={[0, height - 0.12, 0.1]}
        radius={0.003}
        smoothness={4}
      >
        <meshStandardMaterial color="#b8956c" roughness={0.5} />
      </RoundedBox>
      
      {/* Adjustment hint */}
      {isAdjusting && (
        <Html position={[0, height + 0.3, 0.4]} center>
          <div className="bg-black/70 text-white px-3 py-1 rounded text-xs whitespace-nowrap backdrop-blur-sm">
            [Q] Up / [Z] Down
          </div>
        </Html>
      )}
    </group>
  )
}

interface InteractiveProps {
  onHover: (object: string | null) => void
  onClick: (object: string) => void
  deskHeight?: number
}

// Multiple reggaeton melodies to randomly choose from
const reggaetonMelodies = [
  // Dembow style
  [
    { note: 'E4', time: 0 }, { note: 'E4', time: 0.125 },
    { note: 'G4', time: 0.25 }, { note: 'A4', time: 0.375 },
    { note: 'G4', time: 0.5 }, { note: 'E4', time: 0.625 },
    { note: 'D4', time: 0.75 }, { note: 'E4', time: 0.875 },
  ],
  // Perreo style
  [
    { note: 'A4', time: 0 }, { note: 'G4', time: 0.125 },
    { note: 'E4', time: 0.25 }, { note: 'E4', time: 0.375 },
    { note: 'A4', time: 0.5 }, { note: 'G4', time: 0.625 },
    { note: 'E4', time: 0.75 }, { note: 'D4', time: 0.875 },
  ],
  // Romantic reggaeton
  [
    { note: 'C4', time: 0 }, { note: 'E4', time: 0.25 },
    { note: 'G4', time: 0.5 }, { note: 'C5', time: 0.625 },
    { note: 'B4', time: 0.75 }, { note: 'G4', time: 0.875 },
  ],
  // Daddy Yankee style
  [
    { note: 'E4', time: 0 }, { note: 'E4', time: 0.0625 },
    { note: 'G4', time: 0.125 }, { note: 'G4', time: 0.1875 },
    { note: 'A4', time: 0.25 }, { note: 'A4', time: 0.375 },
    { note: 'G4', time: 0.5 }, { note: 'F4', time: 0.625 },
    { note: 'E4', time: 0.75 }, { note: 'E4', time: 0.875 },
  ],
]

const noteFrequencies: Record<string, number> = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
  'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
}

// Map key index to note
const keyToNote: Record<number, string> = {
  0: 'C4', 1: 'D4', 2: 'E4', 3: 'F4', 4: 'G4', 5: 'A4', 6: 'B4', 7: 'C5',
}

function Piano({ deskHeight = 0.75, onHover, onClick }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  const [isExtended, setIsExtended] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeKeys, setActiveKeys] = useState<number[]>([])
  const [showPrompt, setShowPrompt] = useState(false)
  const [currentMelody, setCurrentMelody] = useState(0)
  const groupRef = useRef<THREE.Group>(null)
  const slidePosition = useRef(0)
  const targetSlide = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const playingTimeouts = useRef<NodeJS.Timeout[]>([])
  const loopRef = useRef<NodeJS.Timeout | null>(null)
  const { camera } = useThree()
  
  const pianoWidth = 2.0
  const pianoDepth = 0.28
  const pianoHeight = 0.08
  const numWhiteKeys = 52

  // Get or create audio context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }

  // Play a single note with reggaeton style
  const playNote = (note: string, keyIndex: number) => {
    const ctx = getAudioContext()
    
    // Activate key visually
    setActiveKeys(prev => [...prev, keyIndex])
    setTimeout(() => setActiveKeys(prev => prev.filter(k => k !== keyIndex)), 120)
    
    // Main oscillator
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.frequency.value = noteFrequencies[note] || 440
    osc.type = 'triangle' // Warmer reggaeton tone
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
    
    // Add bass layer for that reggaeton feel
    const bassOsc = ctx.createOscillator()
    const bassGain = ctx.createGain()
    bassOsc.connect(bassGain)
    bassGain.connect(ctx.destination)
    bassOsc.frequency.value = (noteFrequencies[note] || 440) / 2
    bassOsc.type = 'sine'
    bassGain.gain.setValueAtTime(0.08, ctx.currentTime)
    bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    bassOsc.start()
    bassOsc.stop(ctx.currentTime + 0.1)
  }
  
  // Check proximity for showing prompt
  useFrame(() => {
    if (!groupRef.current) return
    const pianoWorldPos = new THREE.Vector3(0, deskHeight - 0.12, -1.6 + slidePosition.current)
    const dist = camera.position.distanceTo(pianoWorldPos)
    setShowPrompt(dist < 2)
  })
  
  // Animate slide - slides OUT towards player (positive Z)
  useFrame(() => {
    targetSlide.current = isExtended ? 0.8 : 0
    slidePosition.current += (targetSlide.current - slidePosition.current) * 0.06
    if (groupRef.current) {
      groupRef.current.position.z = 0.15 + slidePosition.current
    }
  })
  
  // Play random reggaeton melody loop
  const playReggaetonLoop = () => {
    // Pick a random melody
    const melodyIndex = Math.floor(Math.random() * reggaetonMelodies.length)
    setCurrentMelody(melodyIndex)
    const melody = reggaetonMelodies[melodyIndex]
    
    setIsPlaying(true)
    
    melody.forEach(({ note, time }) => {
      const keyIndex = Object.entries(keyToNote).find(([, n]) => n === note)?.[0]
      const timeout = setTimeout(() => {
        playNote(note, keyIndex ? parseInt(keyIndex) + 20 : 24) // Center of keyboard
      }, time * 500)
      playingTimeouts.current.push(timeout)
    })
    
    // Loop after melody ends
    loopRef.current = setTimeout(() => {
      playingTimeouts.current = []
      if (isExtended) playReggaetonLoop()
    }, 550)
  }
  
  // Stop playing
  const stopPlaying = () => {
    setIsPlaying(false)
    playingTimeouts.current.forEach(clearTimeout)
    playingTimeouts.current = []
    if (loopRef.current) {
      clearTimeout(loopRef.current)
      loopRef.current = null
    }
    setActiveKeys([])
  }
  
  // Handle clicking on piano keys
  const handleKeyClick = (keyIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isExtended) return
    
    // Map key position to note (simplified)
    const noteIndex = keyIndex % 8
    const note = keyToNote[noteIndex] || 'E4'
    playNote(note, keyIndex)
    
    // Start random loop if not already playing
    if (!isPlaying) {
      setTimeout(playReggaetonLoop, 200)
    }
  }
  
  // Handle E key for piano extension
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && showPrompt) {
        if (!isExtended) {
          setIsExtended(true)
        } else {
          setIsExtended(false)
          stopPlaying()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      stopPlaying()
    }
  }, [showPrompt, isExtended])

  // Stop music when piano closes
  useEffect(() => {
    if (!isExtended) {
      stopPlaying()
    }
  }, [isExtended])
  
  return (
    <group
      ref={groupRef}
      position={[0, deskHeight - 0.12, 0.15]}
      onPointerEnter={() => { setHovered(true); onHover("piano") }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
    >
      {/* Piano body - wider for easier clicking */}
      <RoundedBox args={[pianoWidth, pianoHeight, pianoDepth]} radius={0.01} smoothness={4} castShadow>
        <meshStandardMaterial 
          color={hovered ? "#2a2a2a" : "#1a1a1a"} 
          roughness={0.6} 
          metalness={0.1}
          emissive={isPlaying ? "#221100" : "#000000"}
        />
      </RoundedBox>
      
      {/* Control panel on left */}
      <mesh position={[-pianoWidth/2 + 0.08, 0.045, 0]}>
        <boxGeometry args={[0.12, 0.008, 0.2]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* LED indicators */}
      <mesh position={[-pianoWidth/2 + 0.06, 0.052, 0.05]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshStandardMaterial color={isPlaying ? "#00ff00" : "#004400"} emissive={isPlaying ? "#00ff00" : "#000000"} emissiveIntensity={isPlaying ? 0.5 : 0} />
      </mesh>
      <mesh position={[-pianoWidth/2 + 0.06, 0.052, -0.05]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshStandardMaterial color={isExtended ? "#ff6600" : "#440000"} emissive={isExtended ? "#ff6600" : "#000000"} emissiveIntensity={isExtended ? 0.3 : 0} />
      </mesh>
      
      {/* White keys - clickable */}
      {Array.from({ length: numWhiteKeys }).map((_, i) => {
        const isActive = activeKeys.includes(i)
        return (
          <mesh 
            key={`white-${i}`} 
            position={[-pianoWidth / 2 + 0.12 + i * 0.035, isActive ? 0.042 : 0.045, 0.05]} 
            castShadow
            onClick={(e) => handleKeyClick(i, e as unknown as React.MouseEvent)}
            onPointerOver={() => isExtended && (document.body.style.cursor = 'pointer')}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <boxGeometry args={[0.03, 0.012, 0.14]} />
            <meshStandardMaterial 
              color={isActive ? "#ffffaa" : "#f8f8f5"}
              roughness={0.3}
              emissive={isActive ? "#ffff44" : "#000000"}
              emissiveIntensity={isActive ? 0.6 : 0}
            />
          </mesh>
        )
      })}
      
      {/* Black keys - clickable */}
      {Array.from({ length: numWhiteKeys }).map((_, i) => {
        const keyInOctave = i % 7
        if (keyInOctave === 2 || keyInOctave === 6) return null
        const blackKeyIndex = i + 100 // Offset to differentiate from white keys
        const isActive = activeKeys.includes(blackKeyIndex)
        return (
          <mesh 
            key={`black-${i}`} 
            position={[-pianoWidth / 2 + 0.135 + i * 0.035, isActive ? 0.052 : 0.055, -0.01]} 
            castShadow
            onClick={(e) => handleKeyClick(blackKeyIndex, e as unknown as React.MouseEvent)}
            onPointerOver={() => isExtended && (document.body.style.cursor = 'pointer')}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <boxGeometry args={[0.02, 0.02, 0.09]} />
            <meshStandardMaterial 
              color={isActive ? "#333333" : "#0a0a0a"} 
              roughness={0.5}
              emissive={isActive ? "#ff8800" : "#000000"}
              emissiveIntensity={isActive ? 0.4 : 0}
            />
          </mesh>
        )
      })}
      
      {/* Interaction prompt */}
      {showPrompt && !isExtended && (
        <Html position={[0, 0.2, 0.1]} center>
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap backdrop-blur-sm border border-white/20">
            Press [E] to slide out piano
          </div>
        </Html>
      )}
      
      {isExtended && (
        <Html position={[0, 0.2, 0.1]} center>
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap backdrop-blur-sm border border-white/20 flex flex-col items-center gap-1">
            <span>{isPlaying ? `Playing melody ${currentMelody + 1}/4` : "Click keys to play"}</span>
            <span className="text-xs text-white/60">[E] to close</span>
          </div>
        </Html>
      )}
    </group>
  )
}

function TV({ onHover, onClick }: Omit<InteractiveProps, 'deskHeight'>) {
  const [hovered, setHovered] = useState(false)
  const screenRef = useRef<THREE.MeshStandardMaterial>(null)
  
  useFrame((state) => {
    if (screenRef.current) {
      const hue = (state.clock.elapsedTime * 0.02) % 1
      screenRef.current.emissive.setHSL(0.05 + hue * 0.1, 0.6, 0.15)
    }
  })
  
  // TV is now bigger (1.6 x 0.9) and lower (1.7 instead of 2.0)
  return (
    <group
      position={[0, 1.7, -0.45]}
      onPointerEnter={() => { setHovered(true); onHover("tv") }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={() => onClick("tv")}
    >
      {/* TV Frame - Bigger */}
      <RoundedBox args={[1.6, 0.9, 0.05]} radius={0.015} smoothness={4} castShadow>
        <meshStandardMaterial 
          color={hovered ? "#2a2a2a" : "#1a1a1a"} 
          roughness={0.7} 
          metalness={0.2}
        />
      </RoundedBox>
      
      {/* Screen - Bigger */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[1.5, 0.82]} />
        <meshStandardMaterial 
          ref={screenRef}
          color="#1a1a1a"
          emissive="#cc6633"
          emissiveIntensity={hovered ? 0.5 : 0.3}
          roughness={0.1}
        />
      </mesh>
      
      {/* TV bezel details */}
      <mesh position={[0, -0.42, 0.026]}>
        <boxGeometry args={[0.25, 0.015, 0.01]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
      </mesh>
      
      {/* LED indicator */}
      <mesh position={[0.7, -0.42, 0.03]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Wall mount */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[0.2, 0.2, 0.12]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
    </group>
  )
}

function DrawingTablet({ deskHeight = 0.75, onHover, onClick }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  const screenRef = useRef<THREE.MeshStandardMaterial>(null)
  
  useFrame((state) => {
    if (screenRef.current) {
      screenRef.current.emissiveIntensity = hovered ? 0.4 : 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })
  
  // Better modeled drawing tablet
  return (
    <group
      position={[-0.5, deskHeight + 0.1, 0]}
      rotation={[-0.35, 0, 0]}
      onPointerEnter={() => { setHovered(true); onHover("tablet") }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={() => onClick("tablet")}
    >
      {/* Main tablet body - with bezels */}
      <RoundedBox args={[0.6, 0.38, 0.025]} radius={0.015} smoothness={4} castShadow>
        <meshStandardMaterial 
          color={hovered ? "#3a3a3a" : "#2a2a2a"} 
          roughness={0.6} 
          metalness={0.1}
        />
      </RoundedBox>
      
      {/* Screen */}
      <mesh position={[0.02, 0, 0.013]}>
        <planeGeometry args={[0.52, 0.32]} />
        <meshStandardMaterial 
          ref={screenRef}
          color="#1a1a1a"
          emissive="#4488cc"
          emissiveIntensity={0.2}
          roughness={0.05}
        />
      </mesh>
      
      {/* Left side buttons */}
      {[-0.12, -0.08, -0.04, 0, 0.04, 0.08].map((y, i) => (
        <mesh key={i} position={[-0.27, y, 0.015]}>
          <boxGeometry args={[0.025, 0.03, 0.008]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
      ))}
      
      {/* Scroll wheel */}
      <mesh position={[-0.27, 0.14, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Stand */}
      <group position={[0, -0.12, -0.06]}>
        {/* Stand back plate */}
        <mesh rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.35, 0.22, 0.015]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Hinge */}
        <mesh position={[0, 0.08, 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>
      
      {/* Stylus */}
      <group position={[0.35, -0.1, 0.02]} rotation={[0, 0, 0.3]}>
        <mesh>
          <cylinderGeometry args={[0.006, 0.004, 0.15, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Stylus tip */}
        <mesh position={[0, -0.08, 0]}>
          <coneGeometry args={[0.004, 0.015, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
        </mesh>
        {/* Stylus button */}
        <mesh position={[0.007, 0.02, 0]}>
          <boxGeometry args={[0.003, 0.025, 0.012]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function Laptop({ deskHeight = 0.75, onHover, onClick }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group
      position={[0.75, deskHeight + 0.04, 0]}
      rotation={[0, -0.15, 0]}
      onPointerEnter={() => { setHovered(true); onHover("laptop") }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={() => onClick("laptop")}
    >
      {/* Laptop base */}
      <RoundedBox args={[0.32, 0.015, 0.22]} radius={0.005} smoothness={4} castShadow>
        <meshStandardMaterial 
          color={hovered ? "#5a5a5a" : "#4a4a4a"} 
          roughness={0.3} 
          metalness={0.6}
        />
      </RoundedBox>
      
      {/* Laptop screen (closed/docked position) */}
      <group position={[0, 0.008, -0.08]} rotation={[1.4, 0, 0]}>
        <RoundedBox args={[0.32, 0.22, 0.008]} radius={0.005} smoothness={4} castShadow>
          <meshStandardMaterial 
            color={hovered ? "#5a5a5a" : "#4a4a4a"} 
            roughness={0.3} 
            metalness={0.6}
          />
        </RoundedBox>
        
        {/* Apple logo hint */}
        <mesh position={[0, 0, 0.005]}>
          <circleGeometry args={[0.015, 16]} />
          <meshStandardMaterial color="#6a6a6a" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

function Keyboard({ deskHeight = 0.75 }: { deskHeight: number }) {
  return (
    <group position={[-0.15, deskHeight + 0.02, 0.2]}>
      {/* Keyboard body */}
      <RoundedBox args={[0.35, 0.015, 0.12]} radius={0.008} smoothness={4} castShadow>
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.1} />
      </RoundedBox>
      
      {/* Key rows */}
      {Array.from({ length: 4 }).map((_, row) => (
        <group key={row} position={[0, 0.01, -0.04 + row * 0.025]}>
          {Array.from({ length: 12 }).map((_, col) => (
            <mesh key={col} position={[-0.14 + col * 0.025, 0, 0]}>
              <boxGeometry args={[0.02, 0.004, 0.02]} />
              <meshStandardMaterial color="#3a3a3a" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Mouse({ deskHeight = 0.75 }: { deskHeight: number }) {
  return (
    <group position={[0.35, deskHeight + 0.02, 0.2]}>
      <RoundedBox args={[0.06, 0.025, 0.1]} radius={0.015} smoothness={8} castShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.1} />
      </RoundedBox>
    </group>
  )
}

function Mug({ deskHeight = 0.75, onHover, onClick }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group
      position={[0.3, deskHeight + 0.07, 0.05]}
      onPointerEnter={() => { setHovered(true); onHover("mug") }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={() => onClick("mug")}
    >
      {/* Mug body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#e03030" : "#cc2020"} 
          roughness={0.3} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Handle */}
      <mesh position={[0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.025, 0.008, 8, 16, Math.PI]} />
        <meshStandardMaterial color={hovered ? "#e03030" : "#cc2020"} roughness={0.3} />
      </mesh>
    </group>
  )
}

function Phone({ deskHeight = 0.75, onHover, onClick }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group
      position={[-0.9, deskHeight + 0.025, 0.15]}
      rotation={[0, 0.3, 0]}
      onPointerEnter={() => { setHovered(true); onHover("phone") }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={() => onClick("phone")}
    >
      <RoundedBox args={[0.075, 0.01, 0.15]} radius={0.01} smoothness={8} castShadow>
        <meshStandardMaterial 
          color={hovered ? "#2a2a2a" : "#1a1a1a"} 
          roughness={0.2} 
          metalness={0.3}
        />
      </RoundedBox>
      
      {/* Screen */}
      <mesh position={[0, 0.006, 0]}>
        <planeGeometry args={[0.065, 0.14]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.05} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Microphone({ deskHeight = 0.75, onHover, onClick }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  
  // Much better modeled microphone with boom arm
  return (
    <group
      position={[-1.1, deskHeight, -0.1]}
      onPointerEnter={() => { setHovered(true); onHover("microphone") }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={() => onClick("microphone")}
    >
      {/* Desk clamp */}
      <group position={[0, 0, 0.32]}>
        <RoundedBox args={[0.06, 0.08, 0.04]} radius={0.005} smoothness={4} castShadow>
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
        </RoundedBox>
        {/* Clamp screw */}
        <mesh position={[0.035, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
      
      {/* First arm joint */}
      <mesh position={[0, 0.08, 0.32]} castShadow>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
      </mesh>
      
      {/* First arm segment */}
      <mesh position={[-0.08, 0.28, 0.22]} rotation={[0.5, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.45, 8]} />
        <meshStandardMaterial color={hovered ? "#2a2a2a" : "#1a1a1a"} roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Cable along arm 1 */}
      <mesh position={[-0.06, 0.28, 0.24]} rotation={[0.5, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.45, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      
      {/* Second arm joint */}
      <mesh position={[-0.15, 0.5, 0.05]} castShadow>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
      </mesh>
      
      {/* Second arm segment */}
      <mesh position={[-0.02, 0.55, -0.12]} rotation={[-0.8, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.38, 8]} />
        <meshStandardMaterial color={hovered ? "#2a2a2a" : "#1a1a1a"} roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Pop filter holder arm */}
      <mesh position={[0.08, 0.52, -0.22]} rotation={[0, 0.5, 0.2]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.18, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      
      {/* Pop filter ring */}
      <group position={[0.16, 0.55, -0.25]} rotation={[0, 0.8, 0]}>
        <mesh>
          <torusGeometry args={[0.055, 0.006, 8, 24]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Pop filter mesh */}
        <mesh>
          <circleGeometry args={[0.052, 24]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.9} 
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      
      {/* Microphone shock mount */}
      <group position={[0.1, 0.6, -0.28]}>
        {/* Outer ring */}
        <mesh rotation={[0, 0.5, Math.PI / 2]}>
          <torusGeometry args={[0.04, 0.008, 8, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Elastic bands suggestion */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, Math.sin(i * Math.PI / 2) * 0.025, Math.cos(i * Math.PI / 2) * 0.025]} rotation={[i * Math.PI / 2, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.003, 0.003, 0.025, 4]} />
            <meshStandardMaterial color="#333333" roughness={0.8} />
          </mesh>
        ))}
      </group>
      
      {/* Microphone body */}
      <group position={[0.1, 0.6, -0.28]} rotation={[0, 0.5, Math.PI / 2]}>
        {/* Main body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.14, 16]} />
          <meshStandardMaterial color={hovered ? "#3a3a3a" : "#2a2a2a"} roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Grille */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.022, 0.04, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Top cap */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.025, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Logo ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.023, 0.002, 8, 16]} />
          <meshStandardMaterial color="#cc2222" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function RingLight() {
  return (
    <group position={[1.3, 0.1, 0.2]}>
      {/* Tripod legs */}
      {[0, 1, 2].map((i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin((i * Math.PI * 2) / 3) * 0.15,
            0.5,
            Math.cos((i * Math.PI * 2) / 3) * 0.15
          ]}
          rotation={[Math.sin((i * Math.PI * 2) / 3) * 0.2, 0, Math.cos((i * Math.PI * 2) / 3) * 0.2]}
          castShadow
        >
          <cylinderGeometry args={[0.01, 0.012, 1.0, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} />
        </mesh>
      ))}
      
      {/* Center pole */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} />
      </mesh>
      
      {/* Ring light */}
      <group position={[0, 1.65, -0.05]} rotation={[0.2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.15, 0.02, 8, 32]} />
          <meshStandardMaterial 
            color="#f5f5f0" 
            emissive="#fffaf0"
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Inner ring */}
        <mesh>
          <torusGeometry args={[0.15, 0.008, 8, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function Webcam({ deskHeight = 0.75 }: { deskHeight: number }) {
  return (
    <group position={[0.95, deskHeight + 0.07, 0.05]}>
      {/* Webcam body */}
      <RoundedBox args={[0.06, 0.04, 0.03]} radius={0.008} smoothness={4} castShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.2} />
      </RoundedBox>
      
      {/* Lens */}
      <mesh position={[0, 0, 0.016]}>
        <circleGeometry args={[0.012, 16]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Mini tripod */}
      <mesh position={[0, -0.035, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.012, 0.05, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Plant({ deskHeight = 0.75, onHover, onClick }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group
      position={[1.0, deskHeight + 0.06, -0.1]}
      onPointerEnter={() => { setHovered(true); onHover("plant") }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={() => onClick("plant")}
    >
      {/* Pot */}
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.08, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#a85d3a" : "#8b4513"} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Soil */}
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.01, 16]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      
      {/* Leaves */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.sin((i * Math.PI * 2) / 5) * 0.03,
            0.08 + i * 0.015,
            Math.cos((i * Math.PI * 2) / 5) * 0.03
          ]}
          rotation={[
            Math.sin(i) * 0.3,
            (i * Math.PI * 2) / 5,
            0.5 + Math.cos(i) * 0.2
          ]}
        >
          <planeGeometry args={[0.04, 0.06]} />
          <meshStandardMaterial 
            color={hovered ? "#3d8b3d" : "#2d6b2d"} 
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function Dock({ deskHeight = 0.75 }: { deskHeight: number }) {
  return (
    <group position={[0.55, deskHeight + 0.02, -0.05]}>
      {/* Dock body */}
      <RoundedBox args={[0.1, 0.03, 0.06]} radius={0.005} smoothness={4} castShadow>
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
      </RoundedBox>
      
      {/* Port indicators */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.03 + i * 0.03, 0.016, 0]}>
          <boxGeometry args={[0.015, 0.002, 0.025]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function OfficeChair() {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0.8])
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const { camera, raycaster, mouse, gl } = useThree()
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  
  // Handle dragging
  useFrame(() => {
    if (isDragging) {
      raycaster.setFromCamera(mouse, camera)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(floorPlane, intersection)
      
      // Clamp to room bounds (smaller room now)
      const clampedX = Math.max(-2, Math.min(2, intersection.x))
      const clampedZ = Math.max(-1.5, Math.min(1.5, intersection.z))
      
      setPosition([clampedX, 0, clampedZ])
    }
  })
  
  // Mouse events for dragging
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        gl.domElement.style.cursor = 'auto'
      }
    }
    
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isDragging, gl])
  
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation()
    setIsDragging(true)
    gl.domElement.style.cursor = 'grabbing'
  }
  
  return (
    <group 
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerEnter={() => { setHovered(true); gl.domElement.style.cursor = 'grab' }}
      onPointerLeave={() => { if (!isDragging) { setHovered(false); gl.domElement.style.cursor = 'auto' } }}
    >
      {/* Seat */}
      <RoundedBox args={[0.5, 0.08, 0.45]} position={[0, 0.5, 0]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={hovered || isDragging ? "#2a2a2a" : "#1a1a1a"} roughness={0.8} />
      </RoundedBox>
      
      {/* Backrest */}
      <RoundedBox args={[0.48, 0.55, 0.06]} position={[0, 0.85, -0.2]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={hovered || isDragging ? "#2a2a2a" : "#1a1a1a"} roughness={0.8} />
      </RoundedBox>
      
      {/* Headrest */}
      <RoundedBox args={[0.25, 0.15, 0.05]} position={[0, 1.2, -0.22]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={hovered || isDragging ? "#2a2a2a" : "#1a1a1a"} roughness={0.8} />
      </RoundedBox>
      
      {/* Armrests */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={i} position={[x, 0.65, 0.05]}>
          <RoundedBox args={[0.06, 0.04, 0.25]} radius={0.01} smoothness={4} castShadow>
            <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
          </RoundedBox>
        </group>
      ))}
      
      {/* Center pole */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Base star */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.sin((i * Math.PI * 2) / 5) * 0.25,
            0.05,
            Math.cos((i * Math.PI * 2) / 5) * 0.25
          ]}
          rotation={[Math.PI / 2, 0, (i * Math.PI * 2) / 5]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
      
      {/* Wheels */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.sin((i * Math.PI * 2) / 5) * 0.28,
            0.03,
            Math.cos((i * Math.PI * 2) / 5) * 0.28
          ]}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Drag hint */}
      {hovered && !isDragging && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-black/70 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-white/20">
            Click and drag to move
          </div>
        </Html>
      )}
    </group>
  )
}

function Plushie({ deskHeight = 0.75 }: { deskHeight: number }) {
  return (
    <group position={[-0.85, deskHeight + 0.07, 0.2]}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#e64a19" roughness={0.8} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.035, 0.02]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#e64a19" roughness={0.8} />
      </mesh>
      
      {/* Eyes */}
      {[-0.008, 0.008].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0.04]}>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      
      {/* Horns/ears */}
      {[-0.015, 0.015].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0.01]} rotation={[0.3, 0, x > 0 ? 0.3 : -0.3]}>
          <coneGeometry args={[0.008, 0.02, 8]} />
          <meshStandardMaterial color="#ff7043" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function SheetMusic() {
  return (
    <group position={[0, 1.55, -0.49]}>
      {/* Multiple sheet music pages */}
      {[-0.5, -0.25, 0, 0.25].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh>
            <planeGeometry args={[0.2, 0.28]} />
            <meshStandardMaterial 
              color="#f5f5f0" 
              roughness={0.9}
            />
          </mesh>
          {/* Staff lines */}
          {[-0.08, -0.04, 0, 0.04, 0.08].map((y, j) => (
            <mesh key={j} position={[0, y, 0.001]}>
              <planeGeometry args={[0.18, 0.002]} />
              <meshStandardMaterial color="#333333" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
