"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"

// Room dimensions - smaller for 44m2 apartment
const ROOM_WIDTH = 5
const ROOM_BACK_EXTENT = 2
const ROOM_FRONT_EXTENT = 4.2
const ROOM_DEPTH = ROOM_BACK_EXTENT + ROOM_FRONT_EXTENT
const ROOM_HEIGHT = 3.05
const ROOM_CENTER_Z = (ROOM_FRONT_EXTENT - ROOM_BACK_EXTENT) / 2
type FanLightMode = "normal" | "streamer" | "passion"

// Export for use in other components
export { ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT, ROOM_BACK_EXTENT, ROOM_FRONT_EXTENT }

export function Room() {
  return (
    <group>
      {/* Floor - Warm medium-tone herringbone parquet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ROOM_CENTER_Z]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH, 32, 32]} />
        <meshStandardMaterial 
          color="#8b6b4a"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
      
      {/* Herringbone pattern overlay */}
      <HerringbonePattern />

      {/* Back Wall (behind desk) */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_BACK_EXTENT]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_FRONT_EXTENT]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, ROOM_CENTER_Z]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, ROOM_CENTER_Z]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, ROOM_HEIGHT, ROOM_CENTER_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#fafafa" roughness={0.95} />
      </mesh>

      <CeilingFan />

      {/* Baseboard trim */}
      <Baseboard />
      
      {/* Door to bathroom - on the right wall, next to the desk area */}
      <Door position={[ROOM_WIDTH / 2 - 0.02, 0, -1.0]} rotation={[0, -Math.PI / 2, 0]} label="🚿" />
      
      {/* Door to bedroom - on the right wall, about two door widths away from the bathroom */}
      <Door position={[ROOM_WIDTH / 2 - 0.02, 0, 0.95]} rotation={[0, -Math.PI / 2, 0]} label="🛏️" />
    </group>
  )
}

function CeilingFan() {
  const bladesRef = useRef<THREE.Group>(null)
  const fanPosition: [number, number, number] = [0.15, ROOM_HEIGHT - 0.02, ROOM_CENTER_Z + 0.35]
  const { camera } = useThree()
  const [lightMode, setLightMode] = useState<FanLightMode>("normal")
  const [showPrompt, setShowPrompt] = useState(false)
  const isInteractableRef = useRef(false)
  const cameraForward = useRef(new THREE.Vector3())
  const toFan = useRef(new THREE.Vector3())

  const lightModes = {
    normal: {
      bulbColor: "#fff6e5",
      emissive: "#ffd29a",
      emissiveIntensity: 0.45,
      pointColor: "#fff1d6",
      pointIntensity: 0.42,
      pointDistance: 6.8,
      ambientColor: "#fff1dd",
      ambientIntensity: 0.04,
      label: "Normal",
    },
    streamer: {
      bulbColor: "#d8cbff",
      emissive: "#8f84ff",
      emissiveIntensity: 0.56,
      pointColor: "#8b92ff",
      pointIntensity: 0.58,
      pointDistance: 7.2,
      ambientColor: "#7d84ff",
      ambientIntensity: 0.1,
      accentColor: "#ffb07a",
      label: "Streamer",
    },
    passion: {
      bulbColor: "#ffc6c6",
      emissive: "#ff6a6a",
      emissiveIntensity: 0.5,
      pointColor: "#ff6e6e",
      pointIntensity: 0.56,
      pointDistance: 7,
      ambientColor: "#ff7272",
      ambientIntensity: 0.1,
      label: "Passion",
    },
  } as const

  const activeLightMode = lightModes[lightMode]

  useFrame((state) => {
    if (!bladesRef.current) return
    bladesRef.current.rotation.y = state.clock.elapsedTime * 2.6

    const fanInteractionPoint = new THREE.Vector3(fanPosition[0], fanPosition[1] - 0.2, fanPosition[2])
    const horizontalDistance = Math.hypot(
      camera.position.x - fanInteractionPoint.x,
      camera.position.z - fanInteractionPoint.z,
    )
    const looking =
      horizontalDistance < 2.8 &&
      camera
        .getWorldDirection(cameraForward.current)
        .dot(toFan.current.copy(fanInteractionPoint).sub(camera.position).normalize()) > 0.88

    isInteractableRef.current = looking
    setShowPrompt((current) => (current === looking ? current : looking))
  })

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("fan-light-mode-change", { detail: lightMode }))
  }, [lightMode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || event.repeat || !isInteractableRef.current) return
      setLightMode((current) =>
        current === "normal" ? "streamer" : current === "streamer" ? "passion" : "normal",
      )
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <group position={fanPosition}>
      {/* Ceiling canopy */}
      <mesh position={[0, -0.035, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.07, 24]} />
        <meshStandardMaterial color="#ece7df" roughness={0.75} />
      </mesh>

      {/* Downrod */}
      <mesh position={[0, -0.22, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.34, 16]} />
        <meshStandardMaterial color="#8b6b4d" roughness={0.45} metalness={0.25} />
      </mesh>

      {/* Motor housing */}
      <mesh position={[0, -0.44, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.19, 0.22, 24]} />
        <meshStandardMaterial color="#f2efe9" roughness={0.62} />
      </mesh>

      {/* Lower housing accent */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.08, 20]} />
        <meshStandardMaterial color="#b38d64" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Blade assembly */}
      <group ref={bladesRef} position={[0, -0.38, 0]}>
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, index) => (
          <group key={index} rotation={[0, angle, -0.05]}>
            <mesh position={[0.62, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.08, 0.025, 0.17]} />
              <meshStandardMaterial color="#7f5f3f" roughness={0.55} />
            </mesh>
            <mesh position={[0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.16, 0.03, 0.12]} />
              <meshStandardMaterial color="#a8835d" roughness={0.4} metalness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Light kit */}
      <group position={[0, -0.62, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.1, 18]} />
          <meshStandardMaterial color="#f4f0e8" roughness={0.5} />
        </mesh>

        {[
          [0, -0.04, 0.18],
          [-0.16, -0.04, -0.08],
          [0.16, -0.04, -0.08],
        ].map((position, index) => (
          <group key={index} position={position as [number, number, number]}>
            <mesh castShadow>
              <sphereGeometry args={[0.08, 18, 18]} />
              <meshStandardMaterial
                color={index === 0 && lightMode === "streamer" ? "#ffd1a6" : activeLightMode.bulbColor}
                emissive={index === 0 && lightMode === "streamer" ? activeLightMode.accentColor ?? activeLightMode.emissive : activeLightMode.emissive}
                emissiveIntensity={lightMode === "streamer" && index === 0 ? 0.65 : activeLightMode.emissiveIntensity}
                roughness={0.25}
                transparent
                opacity={0.92}
              />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.08, 10]} />
              <meshStandardMaterial color="#a8835d" roughness={0.35} metalness={0.25} />
            </mesh>
          </group>
        ))}

        <pointLight
          position={[0, -0.02, 0]}
          intensity={activeLightMode.pointIntensity}
          distance={activeLightMode.pointDistance}
          color={activeLightMode.pointColor}
        />
        <pointLight
          position={[0, 0.1, 0]}
          intensity={activeLightMode.ambientIntensity}
          distance={11}
          color={activeLightMode.ambientColor}
        />
      </group>

      {showPrompt && (
        <Html position={[0, -1.0, 0]} center>
          <div className="bg-black/75 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-white/15">
            Press [E] to change fan light: {activeLightMode.label}
          </div>
        </Html>
      )}
    </group>
  )
}

function Door({ position, rotation, label }: { position: [number, number, number]; rotation: [number, number, number]; label: string }) {
  const doorWidth = 0.85
  const doorHeight = 2.1
  const doorDepth = 0.04
  const frameThickness = 0.06
  const frameDepth = doorDepth + 0.02
  const doorOffsetFromWall = frameDepth / 2 + 0.002
  const doorInset = 0.01
  
  return (
    <group position={position} rotation={rotation}>
      <group position={[0, 0, doorOffsetFromWall]}>
        {/* Door frame */}
        <mesh position={[-doorWidth / 2 - frameThickness / 2, doorHeight / 2, 0]} castShadow>
          <boxGeometry args={[frameThickness, doorHeight + frameThickness, frameDepth]} />
          <meshStandardMaterial color="#d4c4b0" roughness={0.7} />
        </mesh>
        <mesh position={[doorWidth / 2 + frameThickness / 2, doorHeight / 2, 0]} castShadow>
          <boxGeometry args={[frameThickness, doorHeight + frameThickness, frameDepth]} />
          <meshStandardMaterial color="#d4c4b0" roughness={0.7} />
        </mesh>
        <mesh position={[0, doorHeight + frameThickness / 2, 0]} castShadow>
          <boxGeometry args={[doorWidth + frameThickness * 2, frameThickness, frameDepth]} />
          <meshStandardMaterial color="#d4c4b0" roughness={0.7} />
        </mesh>
        
        {/* Door panel */}
        <mesh position={[0, doorHeight / 2, doorInset]} castShadow>
          <boxGeometry args={[doorWidth, doorHeight, doorDepth]} />
          <meshStandardMaterial color="#f0ebe3" roughness={0.6} />
        </mesh>
        
        {/* Door panels decoration - top panel */}
        <mesh position={[0, doorHeight * 0.72, doorInset + doorDepth / 2 - 0.006]}>
          <boxGeometry args={[doorWidth - 0.12, doorHeight * 0.35, 0.01]} />
          <meshStandardMaterial color="#e8e0d5" roughness={0.5} />
        </mesh>
        
        {/* Door panels decoration - bottom panel */}
        <mesh position={[0, doorHeight * 0.28, doorInset + doorDepth / 2 - 0.006]}>
          <boxGeometry args={[doorWidth - 0.12, doorHeight * 0.35, 0.01]} />
          <meshStandardMaterial color="#e8e0d5" roughness={0.5} />
        </mesh>
        
        {/* Door handle */}
        <group position={[doorWidth / 2 - 0.1, doorHeight / 2, doorInset + doorDepth / 2 + 0.015]}>
          {/* Handle base plate */}
          <mesh>
            <boxGeometry args={[0.03, 0.12, 0.01]} />
            <meshStandardMaterial color="#a08060" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Handle lever */}
          <mesh position={[0.025, 0, 0.015]}>
            <boxGeometry args={[0.04, 0.02, 0.02]} />
            <meshStandardMaterial color="#a08060" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
        
        {/* Label sign */}
        <group position={[0, doorHeight * 0.88, frameDepth / 2 + 0.01]}>
          {/* Sign background */}
          <mesh>
            <planeGeometry args={[0.18, 0.12]} />
            <meshStandardMaterial color="#f8f6ef" roughness={0.85} />
          </mesh>
          {/* Label text */}
          <Html position={[0, 0, 0.01]} center transform scale={0.08}>
            <div className="text-3xl leading-none whitespace-nowrap">
              {label}
            </div>
          </Html>
        </group>
      </group>
    </group>
  )
}

function HerringbonePattern() {
  const planks = []
  const plankWidth = 0.15
  const plankLength = 0.6
  
  for (let x = -ROOM_WIDTH / 2; x < ROOM_WIDTH / 2; x += plankLength * 1.4) {
    for (let z = -ROOM_BACK_EXTENT; z < ROOM_FRONT_EXTENT; z += plankWidth * 2.2) {
      const isOffset = Math.floor((x + ROOM_WIDTH / 2) / (plankLength * 1.4)) % 2 === 0

      planks.push(
        <mesh
          key={`plank-l-${x}-${z}`}
          position={[x, 0.004, z + (isOffset ? plankWidth : 0)]}
          rotation={[-Math.PI / 2, 0, Math.PI / 4]}
          receiveShadow
          renderOrder={1}
        >
          <planeGeometry args={[plankWidth, plankLength]} />
          <meshStandardMaterial
            color="#9a7b5a"
            roughness={0.42}
            transparent
            opacity={0.22}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
          />
        </mesh>
      )

      planks.push(
        <mesh
          key={`plank-r-${x}-${z}`}
          position={[x + plankLength * 0.7, 0.004, z + (isOffset ? plankWidth : 0)]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
          receiveShadow
          renderOrder={1}
        >
          <planeGeometry args={[plankWidth, plankLength]} />
          <meshStandardMaterial
            color="#7a5b3a"
            roughness={0.42}
            transparent
            opacity={0.18}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
          />
        </mesh>
      )
    }
  }

  return <group>{planks}</group>
}

function Baseboard() {
  const baseboardHeight = 0.08
  const baseboardDepth = 0.02
  
  return (
    <group>
      {/* Back baseboard */}
      <mesh position={[0, baseboardHeight / 2, -ROOM_BACK_EXTENT + baseboardDepth / 2]}>
        <boxGeometry args={[ROOM_WIDTH, baseboardHeight, baseboardDepth]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
      {/* Left baseboard */}
      <mesh position={[-ROOM_WIDTH / 2 + baseboardDepth / 2, baseboardHeight / 2, ROOM_CENTER_Z]}>
        <boxGeometry args={[baseboardDepth, baseboardHeight, ROOM_DEPTH]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
      {/* Right baseboard */}
      <mesh position={[ROOM_WIDTH / 2 - baseboardDepth / 2, baseboardHeight / 2, ROOM_CENTER_Z]}>
        <boxGeometry args={[baseboardDepth, baseboardHeight, ROOM_DEPTH]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
      {/* Front baseboard */}
      <mesh position={[0, baseboardHeight / 2, ROOM_FRONT_EXTENT - baseboardDepth / 2]}>
        <boxGeometry args={[ROOM_WIDTH, baseboardHeight, baseboardDepth]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Lighting() {
  const ringLightRef = useRef<THREE.PointLight>(null)
  const sunLightRef = useRef<THREE.DirectionalLight>(null)
  const sunTargetRef = useRef<THREE.Object3D>(null)
  const [fanLightMode, setFanLightMode] = useState<FanLightMode>("normal")

  const roomLightModes = {
    normal: {
      ambientIntensity: 0.55,
      ambientColor: "#fff8f2",
      directionalIntensity: 0.6,
      directionalColor: "#fff8f0",
    },
    streamer: {
      ambientIntensity: 0.12,
      ambientColor: "#717cff",
      directionalIntensity: 0.11,
      directionalColor: "#c7b4ff",
    },
    passion: {
      ambientIntensity: 0.12,
      ambientColor: "#ff7a7a",
      directionalIntensity: 0.1,
      directionalColor: "#ffb0b0",
    },
  } as const

  const activeRoomLightMode = roomLightModes[fanLightMode]

  useEffect(() => {
    if (!sunLightRef.current || !sunTargetRef.current) return
    sunLightRef.current.target = sunTargetRef.current
    sunTargetRef.current.updateMatrixWorld()
  }, [])

  useEffect(() => {
    const handleModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<FanLightMode>
      if (!customEvent.detail) return
      setFanLightMode(customEvent.detail)
    }

    window.addEventListener("fan-light-mode-change", handleModeChange as EventListener)
    return () => window.removeEventListener("fan-light-mode-change", handleModeChange as EventListener)
  }, [])
  
  useFrame((state) => {
    if (ringLightRef.current) {
      // Subtle breathing effect for ring light
      ringLightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <>
      {/* Main ambient light - brighter for better visibility */}
      <ambientLight intensity={activeRoomLightMode.ambientIntensity} color={activeRoomLightMode.ambientColor} />
      
      {/* Natural window light simulation (from left) */}
      <directionalLight
        ref={sunLightRef}
        position={[-5.2, 4.4, 0.4]}
        intensity={activeRoomLightMode.directionalIntensity}
        color={activeRoomLightMode.directionalColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <object3D ref={sunTargetRef} position={[ROOM_WIDTH / 2, 1.35, 0.95]} />
      
      {/* Monitor glow */}
      <pointLight
        position={[0, 1.8, -3.2]}
        intensity={0.3}
        color="#b4d4ff"
        distance={4}
      />
      
      {/* Ring light */}
      <pointLight
        ref={ringLightRef}
        position={[3.5, 1.5, -3]}
        intensity={0.8}
        color="#fffaf0"
        distance={3}
      />
      
      {/* Drawing tablet glow */}
      <pointLight
        position={[-1, 1.2, -3.2]}
        intensity={0.15}
        color="#e0f0ff"
        distance={2}
      />
    </>
  )
}
