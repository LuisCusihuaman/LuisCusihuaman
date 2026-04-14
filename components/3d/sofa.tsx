"use client"

import { useRef, useState, useEffect } from "react"
import { RoundedBox, Html } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

interface SofaProps {
  onBurritoMode?: (active: boolean) => void
}

export function Sofa({ onBurritoMode }: SofaProps) {
  const [isBurritoMode, setIsBurritoMode] = useState(false)
  const [isNearSofa, setIsNearSofa] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const { camera } = useThree()
  const sofaRef = useRef<THREE.Group>(null)
  const originalCameraPos = useRef<THREE.Vector3>(new THREE.Vector3())
  const originalCameraRot = useRef<THREE.Euler>(new THREE.Euler())
  
  // Check if player is near the sofa (adjusted for smaller room)
  useFrame(() => {
    if (!sofaRef.current) return
    const sofaPos = new THREE.Vector3(-1.8, 0.5, 0.3)
    const dist = camera.position.distanceTo(sofaPos)
    const near = dist < 1.8
    setIsNearSofa(near)
    setShowPrompt(near && !isBurritoMode)
  })
  
  // Handle E key for burrito mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && isNearSofa) {
        if (!isBurritoMode) {
          // Enter burrito mode
          originalCameraPos.current.copy(camera.position)
          originalCameraRot.current.copy(camera.rotation)
          setIsBurritoMode(true)
          onBurritoMode?.(true)
          
          // Move camera to inside the blanket
          camera.position.set(-3.2, 0.65, 0.5)
          camera.rotation.set(0, Math.PI / 2, 0)
        } else {
          // Exit burrito mode
          setIsBurritoMode(false)
          onBurritoMode?.(false)
          camera.position.copy(originalCameraPos.current)
          camera.rotation.copy(originalCameraRot.current)
        }
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isNearSofa, isBurritoMode, camera, onBurritoMode])
  
  return (
    <group ref={sofaRef} position={[-3.2, 0, 0.5]} rotation={[0, Math.PI / 2, 0]}>
      {/* Main sofa body - worn cream leather */}
      <SofaBase />
      
      {/* Backrest */}
      <SofaBackrest />
      
      {/* Left armrest */}
      <SofaArmrest position={[-0.8, 0.35, 0]} />
      
      {/* Right armrest (partial, futon style) */}
      <SofaArmrest position={[0.9, 0.35, 0]} scale={[1, 0.6, 1]} />
      
      {/* Bedding sheet */}
      <Bedding />
      
      {/* Neatly folded blanket */}
      <FoldedBlanket isBurritoMode={isBurritoMode} />
      
      {/* Pillows */}
      <Pillow position={[-0.5, 0.52, -0.15]} rotation={[0.2, 0.3, 0.1]} />
      <Pillow position={[0.5, 0.52, -0.12]} rotation={[-0.1, -0.2, 0.15]} />
      
      {/* Wear/damage marks */}
      <WearMarks />
      
      {/* Interaction prompt - more visible */}
      {showPrompt && (
        <Html position={[0, 1.4, 0.3]} center>
          <div className="bg-gradient-to-r from-indigo-900/90 to-blue-900/90 text-white px-6 py-3 rounded-xl text-base font-medium whitespace-nowrap backdrop-blur-md border border-white/30 shadow-lg shadow-blue-500/20 animate-pulse">
            Press [E] to get cozy in the blanket
          </div>
        </Html>
      )}
      
      {/* Burrito mode overlay */}
      {isBurritoMode && <BurritoOverlay />}
    </group>
  )
}

function BurritoOverlay() {
  return (
    <Html fullscreen>
      <div className="fixed inset-0 pointer-events-none">
        {/* Dark blue blanket edges surrounding the view */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 120% 120% at 50% 50%, 
              transparent 30%, 
              rgba(26, 58, 92, 0.3) 50%,
              rgba(26, 58, 92, 0.7) 70%,
              rgba(26, 58, 92, 0.95) 85%,
              rgb(20, 45, 70) 100%
            )
          `
        }} />
        
        {/* Blanket texture/pattern overlay */}
        <div className="absolute inset-0" style={{
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.03) 40px,
              rgba(255,255,255,0.03) 42px
            )
          `,
          mixBlendMode: 'overlay'
        }} />
        
        {/* Cozy vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
        
        {/* Exit prompt */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/10">
            Press [E] to get up
          </div>
        </div>
        
        {/* Cozy indicator */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="text-white/60 text-xs tracking-widest uppercase">
            Cozy Mode
          </div>
        </div>
      </div>
    </Html>
  )
}

function FoldedBlanket({ isBurritoMode }: { isBurritoMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing animation when in burrito mode
      if (isBurritoMode) {
        groupRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      } else {
        groupRef.current.scale.y = 1
      }
    }
  })
  
  return (
    <group ref={groupRef} position={[0.1, 0.48, 0.1]}>
      {/* Main folded blanket - neatly stacked */}
      {/* Bottom fold */}
      <RoundedBox
        args={[0.9, 0.04, 0.6]}
        position={[0, 0, 0]}
        radius={0.01}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#1a3a5c"
          roughness={0.9}
          metalness={0}
        />
      </RoundedBox>
      
      {/* Middle fold */}
      <RoundedBox
        args={[0.85, 0.04, 0.55]}
        position={[0.02, 0.045, 0]}
        radius={0.01}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#1e4060"
          roughness={0.9}
          metalness={0}
        />
      </RoundedBox>
      
      {/* Top fold */}
      <RoundedBox
        args={[0.8, 0.04, 0.5]}
        position={[0.04, 0.09, 0]}
        radius={0.01}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#224466"
          roughness={0.9}
          metalness={0}
        />
      </RoundedBox>
      
      {/* Pattern stripes on blanket */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 0.55]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={0.15} />
          </mesh>
          <mesh position={[x, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 0.5]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={0.12} />
          </mesh>
          <mesh position={[x, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 0.45]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Small decorative feather/leaf patterns */}
      {[
        [-0.2, 0.115, 0.15],
        [0.15, 0.115, -0.1],
        [-0.1, 0.115, -0.18],
        [0.25, 0.115, 0.12],
      ].map((pos, i) => (
        <mesh key={`pattern-${i}`} position={pos as [number, number, number]} rotation={[0, i * 0.5, 0]}>
          <circleGeometry args={[0.03, 6]} />
          <meshStandardMaterial color="#3a6090" roughness={0.9} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function SofaBase() {
  return (
    <group>
      {/* Main seat cushion */}
      <RoundedBox
        args={[1.8, 0.25, 0.9]}
        position={[0, 0.32, 0]}
        radius={0.03}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#d4c4a8"
          roughness={0.85}
          metalness={0}
        />
      </RoundedBox>
      
      {/* Base/legs area */}
      <RoundedBox
        args={[1.85, 0.18, 0.95]}
        position={[0, 0.12, 0]}
        radius={0.02}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#c8b898"
          roughness={0.9}
          metalness={0}
        />
      </RoundedBox>
      
      {/* Small feet */}
      {[
        [-0.85, 0.03, 0.35],
        [-0.85, 0.03, -0.35],
        [0.85, 0.03, 0.35],
        [0.85, 0.03, -0.35],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.06, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function SofaBackrest() {
  return (
    <RoundedBox
      args={[1.8, 0.6, 0.2]}
      position={[0, 0.65, -0.4]}
      radius={0.04}
      smoothness={4}
      castShadow
    >
      <meshStandardMaterial
        color="#d8c8ac"
        roughness={0.85}
        metalness={0}
      />
    </RoundedBox>
  )
}

function SofaArmrest({ position, scale = [1, 1, 1] }: { position: [number, number, number]; scale?: [number, number, number] }) {
  return (
    <RoundedBox
      args={[0.15, 0.4, 0.85]}
      position={position}
      scale={scale}
      radius={0.03}
      smoothness={4}
      castShadow
    >
      <meshStandardMaterial
        color="#ccc0a8"
        roughness={0.85}
        metalness={0}
      />
    </RoundedBox>
  )
}

function Bedding() {
  return (
    <group position={[0.1, 0.44, 0]}>
      {/* White/light gray sheet underneath */}
      <mesh receiveShadow>
        <boxGeometry args={[1.5, 0.03, 0.75]} />
        <meshStandardMaterial
          color="#e8e8e8"
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

function Pillow({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <RoundedBox
      args={[0.35, 0.12, 0.25]}
      position={position}
      rotation={rotation}
      radius={0.04}
      smoothness={4}
      castShadow
    >
      <meshStandardMaterial
        color="#1e4568"
        roughness={0.85}
        metalness={0}
      />
    </RoundedBox>
  )
}

function WearMarks() {
  // Subtle darker patches to show wear
  return (
    <group>
      {/* Left armrest wear */}
      <mesh position={[-0.78, 0.45, 0.2]} rotation={[0, 0.2, 0]}>
        <planeGeometry args={[0.08, 0.15]} />
        <meshStandardMaterial
          color="#a89878"
          roughness={0.95}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Seat edge wear */}
      <mesh position={[0, 0.35, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.05]} />
        <meshStandardMaterial
          color="#b8a888"
          roughness={0.95}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Small tear/damage spot */}
      <mesh position={[-0.4, 0.38, 0.35]} rotation={[0.5, 0, 0.2]}>
        <circleGeometry args={[0.03, 8]} />
        <meshStandardMaterial
          color="#8a7a5a"
          roughness={1}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Another damage spot on armrest */}
      <mesh position={[-0.75, 0.25, 0.15]} rotation={[0.2, 0.5, 0]}>
        <circleGeometry args={[0.025, 6]} />
        <meshStandardMaterial
          color="#7a6a4a"
          roughness={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

export function WallArt() {
  return (
    <group position={[-4.45, 1.8, 0.5]}>
      {/* Small framed artwork on wall */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.25, 0.35]} />
        <meshStandardMaterial
          color="#f0f0e8"
          roughness={0.8}
        />
      </mesh>
      
      {/* Simple sketch/drawing impression */}
      <mesh position={[0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.2, 0.3]} />
        <meshStandardMaterial
          color="#e8e4dc"
          roughness={0.9}
        />
      </mesh>
      
      {/* Line art suggestion */}
      {[0.05, 0, -0.05].map((y, i) => (
        <mesh key={i} position={[0.002, y, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.12, 0.003]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
