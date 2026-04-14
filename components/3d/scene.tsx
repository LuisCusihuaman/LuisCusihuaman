"use client"

import { useRef, useState, useCallback, useEffect, Suspense } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { Preload } from "@react-three/drei"
import * as THREE from "three"

import { Room, Lighting } from "./room"
import { DeskSetup } from "./desk-setup"
import { Sofa, WallArt } from "./sofa"
import { FirstPersonControls } from "./first-person-controls"
import { PortfolioPanel, HoverIndicator, ControlsHint, Crosshair } from "./portfolio-panels"
import { LoadingScreen } from "./loading-screen"
import { AmbientAudio } from "./ambient-audio"

function Scene({ 
  onHover, 
  onClick,
  onBurritoMode
}: { 
  onHover: (obj: string | null) => void
  onClick: (obj: string) => void
  onBurritoMode: (active: boolean) => void
}) {
  return (
    <>
      <Lighting />
      <Room />
      <DeskSetup onObjectHover={onHover} onObjectClick={onClick} />
      <Sofa onBurritoMode={onBurritoMode} />
      <WallArt />
      <FirstPersonControls />
    </>
  )
}

function PointerLockTracker({ setIsLocked }: { setIsLocked: (locked: boolean) => void }) {
  const { gl } = useThree()
  
  useEffect(() => {
    const onPointerlockChange = () => {
      setIsLocked(document.pointerLockElement === gl.domElement)
    }
    
    document.addEventListener("pointerlockchange", onPointerlockChange)
    return () => document.removeEventListener("pointerlockchange", onPointerlockChange)
  }, [gl, setIsLocked])
  
  return null
}

export function PortfolioScene() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [hoveredObject, setHoveredObject] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [isBurritoMode, setIsBurritoMode] = useState(false)
  
  const handleObjectClick = useCallback((object: string) => {
    // Exit pointer lock when opening panel
    document.exitPointerLock()
    setActivePanel(object)
  }, [])
  
  const handleClosePanel = useCallback(() => {
    setActivePanel(null)
  }, [])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activePanel) {
        handleClosePanel()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activePanel, handleClosePanel])

  return (
    <div className="w-full h-screen bg-neutral-950 overflow-hidden">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      
      <Canvas
        shadows
        camera={{ fov: 70, near: 0.1, far: 100 }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ cursor: isLocked ? "none" : "pointer" }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 8, 20]} />
        
        <Suspense fallback={null}>
          <Scene 
            onHover={setHoveredObject} 
            onClick={handleObjectClick}
            onBurritoMode={setIsBurritoMode}
          />
          <PointerLockTracker setIsLocked={setIsLocked} />
          <Preload all />
        </Suspense>
      </Canvas>
      
      {/* UI Overlays - hidden in burrito mode */}
      {!isBurritoMode && <ControlsHint isLocked={isLocked} />}
      {!isBurritoMode && <Crosshair isLocked={isLocked} />}
      {!isBurritoMode && <HoverIndicator hoveredObject={hoveredObject} />}
      {!isBurritoMode && <PortfolioPanel activePanel={activePanel} onClose={handleClosePanel} />}
      
      {/* Navigation hint */}
      {isLocked && !activePanel && !isBurritoMode && (
        <div className="fixed bottom-4 right-4 z-20">
          <div className="px-3 py-1.5 bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-neutral-800">
            <p className="text-xs text-neutral-400">
              <span className="text-white">WASD</span> Move
              <span className="mx-2">|</span>
              <span className="text-white">E</span> / <span className="text-white">Click</span> Interact
              <span className="mx-2">|</span>
              <span className="text-white">ESC</span> Exit
            </p>
          </div>
        </div>
      )}
      
      {/* Brand watermark */}
      <div className="fixed top-4 left-4 z-20">
        <p className="text-xs text-neutral-600 tracking-widest">PORTFOLIO</p>
      </div>
      
      {/* Ambient audio control */}
      <AmbientAudio />
    </div>
  )
}
