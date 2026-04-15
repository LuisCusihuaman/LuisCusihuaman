"use client"

import { Html, RoundedBox } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { ROOM_FRONT_EXTENT, ROOM_WIDTH } from "./room"

export const TABLE_POSITION: [number, number, number] = [ROOM_WIDTH / 2 - 0.36, 0, ROOM_FRONT_EXTENT - 1.45]
const TABLE_ROTATION: [number, number, number] = [0, -Math.PI / 2, 0]
const DINING_CHAIR_INTERACTION_DISTANCE = 1.8

export function DiningArea({
  onDiningMode,
}: {
  onDiningMode?: (active: boolean) => void
}) {
  return (
    <group position={TABLE_POSITION} rotation={TABLE_ROTATION}>
      <DiningTable />

      <DiningChair
        position={[-0.98, 0, 0.1]}
        rotation={[0, Math.PI / 2, 0]}
        onDiningMode={onDiningMode}
      />
      <DiningChair
        position={[0.42, 0, 0.3]}
        rotation={[0, Math.PI, 0]}
        onDiningMode={onDiningMode}
      />
    </group>
  )
}

function DiningTable() {
  const tableWidth = 1.78
  const tableDepth = 0.58
  const legInsetX = tableWidth / 2 - 0.13
  const legInsetZ = tableDepth / 2 - 0.11

  return (
    <group>
      <RoundedBox
        args={[tableWidth, 0.05, tableDepth]}
        position={[0, 0.76, 0]}
        radius={0.015}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#b98c5b" roughness={0.55} metalness={0.08} />
      </RoundedBox>

      {[
        [-legInsetX, 0.38, -legInsetZ],
        [legInsetX, 0.38, -legInsetZ],
        [-legInsetX, 0.38, legInsetZ],
        [legInsetX, 0.38, legInsetZ],
      ].map((pos, i) => (
        <RoundedBox
          key={i}
          args={[0.12, 0.76, 0.12]}
          position={pos as [number, number, number]}
          radius={0.015}
          smoothness={4}
          castShadow
        >
          <meshStandardMaterial color="#f2efe8" roughness={0.8} />
        </RoundedBox>
      ))}

      <mesh position={[-0.25, 0.81, -0.08]} castShadow>
        <cylinderGeometry args={[0.03, 0.028, 0.11, 14]} />
        <meshStandardMaterial color="#6a7178" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0.18, 0.805, 0.06]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.03, 18]} />
        <meshStandardMaterial color="#c04836" roughness={0.45} />
      </mesh>
      <mesh position={[0.02, 0.79, -0.02]} castShadow>
        <boxGeometry args={[0.16, 0.01, 0.1]} />
        <meshStandardMaterial color="#d8d1c2" roughness={0.9} />
      </mesh>
    </group>
  )
}

function DiningChair({
  position,
  rotation = [0, 0, 0],
  onDiningMode,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  onDiningMode?: (active: boolean) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isNear, setIsNear] = useState(false)
  const [isSitting, setIsSitting] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const originalCameraPos = useRef(new THREE.Vector3())
  const originalCameraQuaternion = useRef(new THREE.Quaternion())
  const isNearRef = useRef(false)
  const isHoveredRef = useRef(false)
  const isSittingRef = useRef(false)

  useFrame(() => {
    if (!groupRef.current) return

    const interactionPoint = groupRef.current.localToWorld(new THREE.Vector3(0, 0.82, -0.04))
    const horizontalDistance = Math.hypot(
      camera.position.x - interactionPoint.x,
      camera.position.z - interactionPoint.z,
    )
    const near = horizontalDistance < DINING_CHAIR_INTERACTION_DISTANCE

    if (near !== isNearRef.current) {
      isNearRef.current = near
      setIsNear(near)
    }

    if (!near && isHoveredRef.current && !isSittingRef.current) {
      isHoveredRef.current = false
      setIsHovered(false)
    }
  })

  useEffect(() => {
    isSittingRef.current = isSitting
  }, [isSitting])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || event.repeat) return

      if (isSittingRef.current) {
        setIsSitting(false)
        onDiningMode?.(false)
        camera.position.copy(originalCameraPos.current)
        camera.quaternion.copy(originalCameraQuaternion.current)
        return
      }

      if (!isNearRef.current || !isHoveredRef.current || !groupRef.current) return

      originalCameraPos.current.copy(camera.position)
      originalCameraQuaternion.current.copy(camera.quaternion)

      const seatedCameraPosition = groupRef.current.localToWorld(new THREE.Vector3(0, 1.0, 0.02))
      const diningAreaGroup = groupRef.current.parent
      const seatedLookTarget = diningAreaGroup
        ? diningAreaGroup.localToWorld(new THREE.Vector3(0, 0.84, 0))
        : groupRef.current.localToWorld(new THREE.Vector3(0, 0.9, -0.62))

      setIsSitting(true)
      onDiningMode?.(true)
      camera.position.copy(seatedCameraPosition)
      camera.lookAt(seatedLookTarget)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [camera, onDiningMode])

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
    >
      <RoundedBox
        args={[0.5, 0.09, 0.46]}
        position={[0, 0.5, 0]}
        radius={0.03}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color={isHovered || isSitting ? "#ddd0bc" : "#d2c3ad"} roughness={0.9} />
      </RoundedBox>

      <RoundedBox
        args={[0.46, 0.62, 0.1]}
        position={[0, 0.9, -0.17]}
        radius={0.03}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color={isHovered || isSitting ? "#dacbb6" : "#cec0aa"} roughness={0.92} />
      </RoundedBox>

      {[
        [-0.16, 0.23, -0.14],
        [0.16, 0.23, -0.14],
        [-0.16, 0.23, 0.14],
        [0.16, 0.23, 0.14],
      ].map((leg, i) => (
        <mesh key={i} position={leg as [number, number, number]} castShadow>
          <boxGeometry args={[0.055, 0.46, 0.055]} />
          <meshStandardMaterial color="#b8844f" roughness={0.55} />
        </mesh>
      ))}

      <mesh
        position={[0, 0.96, -0.16]}
        onPointerEnter={(event) => {
          event.stopPropagation()
          if (!isNearRef.current || isSittingRef.current) return
          isHoveredRef.current = true
          setIsHovered(true)
        }}
        onPointerLeave={() => {
          if (isSittingRef.current) return
          isHoveredRef.current = false
          setIsHovered(false)
        }}
        visible={false}
      >
        <boxGeometry args={[1.02, 1.48, 1.08]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {isNear && isHovered && !isSitting && (
        <Html position={[0, 1.45, 0.04]} center>
          <div className="bg-gradient-to-r from-stone-900/90 to-zinc-900/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap backdrop-blur-md border border-white/20 shadow-lg">
            Press [E] to sit
          </div>
        </Html>
      )}

      {isSitting && (
        <Html position={[0, 1.58, 0.04]} center>
          <div className="bg-gradient-to-r from-stone-900/90 to-zinc-900/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap backdrop-blur-md border border-white/20 shadow-lg">
            Press [E] to get up
          </div>
        </Html>
      )}
    </group>
  )
}
