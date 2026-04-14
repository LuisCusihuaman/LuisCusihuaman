"use client"

import { useRef } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"

// Room dimensions - smaller for 44m2 apartment
const ROOM_WIDTH = 5
const ROOM_DEPTH = 4
const ROOM_HEIGHT = 2.8

// Export for use in other components
export { ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT }

export function Room() {
  return (
    <group>
      {/* Floor - Warm medium-tone herringbone parquet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
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
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, ROOM_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#fafafa" roughness={0.95} />
      </mesh>

      {/* Baseboard trim */}
      <Baseboard />
      
      {/* Door to bathroom - on left wall */}
      <Door position={[-ROOM_WIDTH / 2 + 0.02, 0, -0.5]} rotation={[0, Math.PI / 2, 0]} label="Baño" />
      
      {/* Door to bedroom - on front wall (in front of sofa) */}
      <Door position={[1.2, 0, ROOM_DEPTH / 2 - 0.02]} rotation={[0, Math.PI, 0]} label="Habitación" />
    </group>
  )
}

function Door({ position, rotation, label }: { position: [number, number, number]; rotation: [number, number, number]; label: string }) {
  const doorWidth = 0.85
  const doorHeight = 2.1
  const doorDepth = 0.04
  
  return (
    <group position={position} rotation={rotation}>
      {/* Door frame */}
      <mesh position={[0, doorHeight / 2, 0]}>
        <boxGeometry args={[doorWidth + 0.12, doorHeight + 0.06, doorDepth + 0.02]} />
        <meshStandardMaterial color="#d4c4b0" roughness={0.7} />
      </mesh>
      
      {/* Door panel */}
      <mesh position={[0, doorHeight / 2, 0.01]} castShadow>
        <boxGeometry args={[doorWidth, doorHeight, doorDepth]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.6} />
      </mesh>
      
      {/* Door panels decoration - top panel */}
      <mesh position={[0, doorHeight * 0.72, 0.025]}>
        <boxGeometry args={[doorWidth - 0.12, doorHeight * 0.35, 0.015]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.5} />
      </mesh>
      
      {/* Door panels decoration - bottom panel */}
      <mesh position={[0, doorHeight * 0.28, 0.025]}>
        <boxGeometry args={[doorWidth - 0.12, doorHeight * 0.35, 0.015]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.5} />
      </mesh>
      
      {/* Door handle */}
      <group position={[doorWidth / 2 - 0.1, doorHeight / 2, 0.035]}>
        {/* Handle base plate */}
        <mesh>
          <boxGeometry args={[0.03, 0.12, 0.01]} />
          <meshStandardMaterial color="#a08060" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Handle lever */}
        <mesh position={[0.025, 0, 0.015]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.02]} />
          <meshStandardMaterial color="#a08060" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
      
      {/* Label sign */}
      <group position={[0, doorHeight * 0.88, 0.04]}>
        {/* Sign background */}
        <mesh>
          <planeGeometry args={[0.22, 0.07]} />
          <meshStandardMaterial color="#3d3d3d" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Label text */}
        <Html position={[0, 0, 0.01]} center transform scale={0.05}>
          <div className="text-white text-lg font-semibold tracking-wide whitespace-nowrap">
            {label}
          </div>
        </Html>
      </group>
    </group>
  )
}

function HerringbonePattern() {
  // Create visual herringbone pattern with lighter planks
  const planks = []
  const plankWidth = 0.15
  const plankLength = 0.6
  
  for (let x = -ROOM_WIDTH/2; x < ROOM_WIDTH/2; x += plankLength * 1.4) {
    for (let z = -ROOM_DEPTH/2; z < ROOM_DEPTH/2; z += plankWidth * 2.2) {
      const isOffset = Math.floor((x + ROOM_WIDTH/2) / (plankLength * 1.4)) % 2 === 0
      // Left-leaning plank
      planks.push(
        <mesh 
          key={`plank-l-${x}-${z}`}
          position={[x, 0.001, z + (isOffset ? plankWidth : 0)]} 
          rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        >
          <planeGeometry args={[plankWidth, plankLength]} />
          <meshStandardMaterial 
            color="#9a7b5a" 
            roughness={0.4}
            transparent
            opacity={0.3}
          />
        </mesh>
      )
      // Right-leaning plank
      planks.push(
        <mesh 
          key={`plank-r-${x}-${z}`}
          position={[x + plankLength * 0.7, 0.001, z + (isOffset ? plankWidth : 0)]} 
          rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
        >
          <planeGeometry args={[plankWidth, plankLength]} />
          <meshStandardMaterial 
            color="#7a5b3a" 
            roughness={0.4}
            transparent
            opacity={0.25}
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
      <mesh position={[0, baseboardHeight / 2, -ROOM_DEPTH / 2 + baseboardDepth / 2]}>
        <boxGeometry args={[ROOM_WIDTH, baseboardHeight, baseboardDepth]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
      {/* Left baseboard */}
      <mesh position={[-ROOM_WIDTH / 2 + baseboardDepth / 2, baseboardHeight / 2, 0]}>
        <boxGeometry args={[baseboardDepth, baseboardHeight, ROOM_DEPTH]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
      {/* Right baseboard */}
      <mesh position={[ROOM_WIDTH / 2 - baseboardDepth / 2, baseboardHeight / 2, 0]}>
        <boxGeometry args={[baseboardDepth, baseboardHeight, ROOM_DEPTH]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
      {/* Front baseboard */}
      <mesh position={[0, baseboardHeight / 2, ROOM_DEPTH / 2 - baseboardDepth / 2]}>
        <boxGeometry args={[ROOM_WIDTH, baseboardHeight, baseboardDepth]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Lighting() {
  const ringLightRef = useRef<THREE.PointLight>(null)
  
  useFrame((state) => {
    if (ringLightRef.current) {
      // Subtle breathing effect for ring light
      ringLightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <>
      {/* Main ambient light - brighter for better visibility */}
      <ambientLight intensity={0.55} color="#fff8f2" />
      
      {/* Natural window light simulation (from left) */}
      <directionalLight
        position={[-5, 4, 2]}
        intensity={0.6}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
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
