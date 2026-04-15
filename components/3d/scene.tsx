"use client"

import { useRef, useState, useCallback, useEffect, Suspense } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { Preload } from "@react-three/drei"
import * as THREE from "three"

import { Github } from "lucide-react"

import { Room, Lighting } from "./room"
import { DeskSetup } from "./desk-setup"
import { Sofa, WallArt } from "./sofa"
import { DiningArea } from "./dining-area"
import { FirstPersonControls } from "./first-person-controls"
import { PortfolioPanel, HoverIndicator, ControlsHint, Crosshair } from "./portfolio-panels"
import { LoadingScreen } from "./loading-screen"
import { AmbientAudio } from "./ambient-audio"

function Scene({ 
  onHover, 
  onClick,
  onBurritoMode,
  isBurritoMode,
  onWorkingMode,
  isWorkingMode,
}: { 
  onHover: (obj: string | null) => void
  onClick: (obj: string) => void
  onBurritoMode: (active: boolean) => void
  isBurritoMode: boolean
  onWorkingMode: (active: boolean) => void
  isWorkingMode: boolean
}) {
  return (
    <>
      <Lighting />
      <Room />
      <DeskSetup onObjectHover={onHover} onObjectClick={onClick} onWorkingMode={onWorkingMode} />
      <Sofa onBurritoMode={onBurritoMode} />
      <DiningArea onDiningMode={onWorkingMode} />
      <WallArt />
      <FirstPersonControls allowMovement={!isBurritoMode && !isWorkingMode} />
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
  const [isWorkingMode, setIsWorkingMode] = useState(false)
  const isImmersiveMode = isBurritoMode || isWorkingMode
  
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
        shadows="percentage"
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
            isBurritoMode={isBurritoMode}
            onWorkingMode={setIsWorkingMode}
            isWorkingMode={isWorkingMode}
          />
          <PointerLockTracker setIsLocked={setIsLocked} />
          <Preload all />
        </Suspense>
      </Canvas>
      
      {/* UI Overlays - hidden in burrito mode */}
      {!isImmersiveMode && <ControlsHint isLocked={isLocked} />}
      {!isImmersiveMode && <Crosshair isLocked={isLocked} />}
      {!isImmersiveMode && <HoverIndicator hoveredObject={hoveredObject} />}
      {!isImmersiveMode && <PortfolioPanel activePanel={activePanel} onClose={handleClosePanel} />}
      
      {/* Navigation hint */}
      {isLocked && !activePanel && !isImmersiveMode && (
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
      
      {/* GitHub Link */}
      {!isLocked && (
        <a
          href="https://github.com/LuisCusihuaman"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 left-16 z-20 p-2 bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors flex items-center justify-center"
          title="My GitHub"
        >
          <Github className="w-4 h-4 text-white" />
        </a>
      )}
    </div>
  )
}
