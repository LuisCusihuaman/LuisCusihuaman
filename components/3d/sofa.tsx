"use client"

import { useRef, useState, useEffect } from "react"
import { RoundedBox, Html, useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { ROOM_FRONT_EXTENT, ROOM_WIDTH } from "./room"

interface SofaProps {
  onBurritoMode?: (active: boolean) => void
}

export const SOFA_POSITION = new THREE.Vector3(-ROOM_WIDTH / 2 + 0.52, 0, 1.3)
const SOFA_INTERACTION_POINT = new THREE.Vector3(-ROOM_WIDTH / 2 + 0.72, 0.5, 1.3)
const BURRITO_CAMERA_POSITION = new THREE.Vector3(-ROOM_WIDTH / 2 + 0.74, 0.58, 1.33)
const BURRITO_CAMERA_ROTATION = new THREE.Euler(-0.42, Math.PI / 2, -0.18, "YXZ")

export function Sofa({ onBurritoMode }: SofaProps) {
  const [isBurritoMode, setIsBurritoMode] = useState(false)
  const [isNearSofa, setIsNearSofa] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const { camera } = useThree()
  const sofaRef = useRef<THREE.Group>(null)
  const originalCameraPos = useRef<THREE.Vector3>(new THREE.Vector3())
  const originalCameraQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion())
  const isNearSofaRef = useRef(false)
  const isLookingAtSofaRef = useRef(false)
  const cameraForward = useRef(new THREE.Vector3())
  const toSofa = useRef(new THREE.Vector3())
  
  // Only allow cozy mode when the sofa is both close and centered in the view.
  useFrame(() => {
    if (!sofaRef.current) return

    const dist = camera.position.distanceTo(SOFA_INTERACTION_POINT)
    const near = dist < 1.8
    const looking =
      near &&
      camera
        .getWorldDirection(cameraForward.current)
        .dot(toSofa.current.copy(SOFA_INTERACTION_POINT).sub(camera.position).normalize()) > 0.72

    if (near !== isNearSofaRef.current) {
      isNearSofaRef.current = near
      setIsNearSofa(near)
    }

    isLookingAtSofaRef.current = looking

    const shouldShowPrompt = looking && !isBurritoMode
    setShowPrompt((current) => (current === shouldShowPrompt ? current : shouldShowPrompt))
  })
  
  // Handle E key for burrito mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "KeyE" || e.repeat) return

      if (isBurritoMode) {
        // Exit burrito mode from anywhere, even after looking around.
        setIsBurritoMode(false)
        onBurritoMode?.(false)
        camera.position.copy(originalCameraPos.current)
        camera.quaternion.copy(originalCameraQuaternion.current)
        return
      }

      if (isNearSofaRef.current && isLookingAtSofaRef.current) {
        // Enter burrito mode
        originalCameraPos.current.copy(camera.position)
        originalCameraQuaternion.current.copy(camera.quaternion)
        setIsBurritoMode(true)
        onBurritoMode?.(true)
        
        // Move camera into a reclined POV so it feels like lying on the sofa.
        camera.position.copy(BURRITO_CAMERA_POSITION)
        camera.quaternion.setFromEuler(BURRITO_CAMERA_ROTATION)
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isBurritoMode, camera, onBurritoMode])
  
  return (
    <group ref={sofaRef} position={SOFA_POSITION} rotation={[0, Math.PI / 2, 0]}>
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
  const [cabifyTexture, fiubaTexture, geopagosTexture, insiteTexture] = useTexture([
    "/work-logos/logo-cabify.webp",
    "/work-logos/logo-fiuba.webp",
    "/work-logos/logo-geopagos.webp",
    "/work-logos/logo-insitela.webp",
  ])

  ;[cabifyTexture, fiubaTexture, geopagosTexture, insiteTexture].forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
  })

  return (
    <>
      <WorkLogoFrame
        texture={cabifyTexture}
        position={[-ROOM_WIDTH / 2 + 0.05, 1.78, 0.9]}
        rotation={[0, Math.PI / 2, 0]}
        artSize={[0.6, 0.6]}
        roleLabel="Site Reliability Engineer - 2024"
      />

      <WorkLogoFrame
        texture={fiubaTexture}
        position={[-ROOM_WIDTH / 2 + 0.05, 1.78, 1.8]}
        rotation={[0, Math.PI / 2, 0]}
        artSize={[0.6, 0.6]}
        roleLabel="Teacher (Software Engineering II) - 2024"
      />

      <WorkLogoFrame
        texture={insiteTexture}
        position={[0.74, 1.86, ROOM_FRONT_EXTENT - 0.035]}
        rotation={[0, Math.PI, 0]}
        artSize={[0.55, 0.55]}
        roleLabel="Sysadmin - 2019"
      />

      <WorkLogoFrame
        texture={geopagosTexture}
        position={[-0.78, 1.86, ROOM_FRONT_EXTENT - 0.035]}
        rotation={[0, Math.PI, 0]}
        artSize={[0.55, 0.55]}
        roleLabel="DevOps Engineer - 2021"
      />
    </>
  )
}

function WorkLogoFrame({
  texture,
  position,
  rotation,
  artSize,
  roleLabel,
}: {
  texture: THREE.Texture
  position: [number, number, number]
  rotation: [number, number, number]
  artSize: [number, number]
  roleLabel: string
}) {
  const [width, height] = artSize

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[width + 0.04, height + 0.04, 0.045]} radius={0.012} smoothness={4} castShadow>
        <meshStandardMaterial color="#d8ccb8" roughness={0.92} />
      </RoundedBox>

      <mesh position={[0, 0, 0.024]} castShadow>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>

      <Html position={[0, -height / 2 - 0.1, 0.03]} center transform scale={0.08}>
        <div 
          className="px-3 py-1.5 text-white text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap"
          style={{
            backgroundColor: "#a8744f",
            border: "2px solid #6b4226",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255,255,255,0.15)"
          }}
        >
          {roleLabel}
        </div>
      </Html>
    </group>
  )
}
