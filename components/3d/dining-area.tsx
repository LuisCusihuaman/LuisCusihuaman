"use client"

import { Html, RoundedBox } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { ROOM_FRONT_EXTENT, ROOM_WIDTH } from "./room"

export const TABLE_POSITION: [number, number, number] = [ROOM_WIDTH / 2 - 0.36, 0, ROOM_FRONT_EXTENT - 1.45]
const TABLE_ROTATION: [number, number, number] = [0, -Math.PI / 2, 0]
const DINING_CHAIR_INTERACTION_DISTANCE = 1.8
const TABLE_SPOT_INTERACTION_DISTANCE = 1.95

export function DiningArea({
  onDiningMode,
}: {
  onDiningMode?: (active: boolean) => void
}) {
  const [activeSeatId, setActiveSeatId] = useState<string | null>(null)

  const handleDiningModeChange = (seatId: string, active: boolean) => {
    setActiveSeatId(active ? seatId : null)
    onDiningMode?.(active)
  }

  return (
    <group position={TABLE_POSITION} rotation={TABLE_ROTATION}>
      <DiningTable activeSeatId={activeSeatId} />

      <DiningChair
        seatId="left-chair"
        position={[-0.98, 0, 0.1]}
        rotation={[0, Math.PI / 2, 0]}
        activeSeatId={activeSeatId}
        onDiningMode={handleDiningModeChange}
      />
      <DiningChair
        seatId="right-chair"
        position={[0.42, 0, 0.3]}
        rotation={[0, Math.PI, 0]}
        activeSeatId={activeSeatId}
        onDiningMode={handleDiningModeChange}
      />
    </group>
  )
}

function DiningTable({ activeSeatId }: { activeSeatId: string | null }) {
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

      <MilanesaPlate position={[-0.52, 0.79, 0.04]} interactionsEnabled={activeSeatId === "left-chair"} />
      <MateSnackSetup position={[0.36, 0.79, 0.08]} interactionsEnabled={activeSeatId === "right-chair"} />
    </group>
  )
}

function MilanesaPlate({ position, interactionsEnabled = false }: { position: [number, number, number]; interactionsEnabled?: boolean }) {
  return (
    <group position={position}>
      <InteractiveTableSpot
        position={[0, 0.1, 0]}
        label="to eat"
        sound="eat"
        enabled={interactionsEnabled}
      />

      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 24]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.9} />
      </mesh>

      <mesh position={[-0.015, 0.018, 0]} rotation={[-0.08, 0.12, -0.25]} castShadow>
        <boxGeometry args={[0.16, 0.025, 0.09]} />
        <meshStandardMaterial color="#8d5b2b" roughness={0.95} />
      </mesh>
      <mesh position={[0.035, 0.022, 0.01]} rotation={[0.04, -0.18, 0.18]} castShadow>
        <boxGeometry args={[0.14, 0.023, 0.085]} />
        <meshStandardMaterial color="#9c6830" roughness={0.95} />
      </mesh>

      {[[-0.05, 0.018, -0.055], [-0.01, 0.018, -0.075], [0.03, 0.018, -0.05]].map((potato, index) => (
        <mesh key={index} position={potato as [number, number, number]} castShadow>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshStandardMaterial color="#f0d7a5" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function MateSnackSetup({ position, interactionsEnabled = false }: { position: [number, number, number]; interactionsEnabled?: boolean }) {
  return (
    <group position={position}>
      <InteractiveTableSpot
        position={[0.11, 0.12, 0]}
        label="to drink mate"
        sound="drink"
        enabled={interactionsEnabled}
      />

      <DonSaturPack position={[-0.02, 0.015, 0.03]} />

      <group position={[0.11, 0.01, -0.01]} rotation={[0, 0.18, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.09, 18]} />
          <meshStandardMaterial color="#5d3c24" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.008, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.07, 16]} />
          <meshStandardMaterial color="#5f8f3e" roughness={1} />
        </mesh>
        <mesh position={[0, 0.046, 0.002]} rotation={[-0.08, 0.2, 0.04]} castShadow>
          <cylinderGeometry args={[0.031, 0.027, 0.018, 16]} />
          <meshStandardMaterial color="#6f9a43" roughness={1} />
        </mesh>
        {[
          [-0.012, 0.052, 0.008],
          [0.01, 0.054, -0.005],
          [0.004, 0.056, 0.012],
          [-0.006, 0.057, -0.012],
          [0.013, 0.051, 0.004],
          [-0.014, 0.054, -0.003],
        ].map((leaf, index) => (
          <mesh key={index} position={leaf as [number, number, number]} castShadow>
            <sphereGeometry args={[0.0045, 6, 6]} />
            <meshStandardMaterial color="#84aa4f" roughness={1} />
          </mesh>
        ))}
        <mesh position={[0.028, 0.08, 0.01]} rotation={[0.3, 0, -0.28]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.14, 10]} />
          <meshStandardMaterial color="#c8c8c8" roughness={0.25} metalness={0.85} />
        </mesh>
      </group>

      <group position={[0.22, 0.012, 0.015]} rotation={[0, -0.12, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.1, 18]} />
          <meshStandardMaterial color="#d3efe1" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.055, 16]} />
          <meshStandardMaterial color="#6e9b47" roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

function DonSaturPack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0.04, -0.25, 0.08]}>
      <RoundedBox args={[0.18, 0.03, 0.12]} radius={0.01} smoothness={4} castShadow>
        <meshStandardMaterial color="#f5e9ca" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.016, 0]}>
        <boxGeometry args={[0.165, 0.002, 0.1]} />
        <meshStandardMaterial color="#c94933" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.018, 0]}>
        <boxGeometry args={[0.07, 0.003, 0.03]} />
        <meshStandardMaterial color="#f6e9d5" roughness={0.95} />
      </mesh>
      {[-0.05, -0.015, 0.02, 0.055].map((x, index) => (
        <mesh key={index} position={[x, 0.03, -0.01 + (index % 2) * 0.02]} castShadow>
          <boxGeometry args={[0.028, 0.012, 0.022]} />
          <meshStandardMaterial color="#d7ad74" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function InteractiveTableSpot({
  position,
  label,
  sound,
  enabled = false,
}: {
  position: [number, number, number]
  label: string
  sound: "eat" | "drink"
  enabled?: boolean
}) {
  const [showPrompt, setShowPrompt] = useState(false)
  const { camera } = useThree()
  const isNearRef = useRef(false)
  const groupRef = useRef<THREE.Group>(null)
  const isLookingRef = useRef(false)
  const cameraForward = useRef(new THREE.Vector3())
  const toSpot = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!groupRef.current) return
    const spotWorld = groupRef.current.localToWorld(new THREE.Vector3(0, 0, 0))
    const near = enabled && camera.position.distanceTo(spotWorld) < TABLE_SPOT_INTERACTION_DISTANCE
    const looking =
      near &&
      camera
        .getWorldDirection(cameraForward.current)
        .dot(toSpot.current.copy(spotWorld).sub(camera.position).normalize()) > 0.94

    isNearRef.current = near
    isLookingRef.current = looking
    setShowPrompt((current) => (current === looking ? current : looking))
  })

  const playSound = () => {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return

    const ctx = new AudioCtor()
    const now = ctx.currentTime

    if (sound === "eat") {
      ;[
        { freq: 540, time: 0, gain: 0.09 },
        { freq: 430, time: 0.07, gain: 0.07 },
        { freq: 360, time: 0.14, gain: 0.05 },
      ].forEach(({ freq, time, gain }) => {
        const osc = ctx.createOscillator()
        const amp = ctx.createGain()
        osc.type = "triangle"
        osc.frequency.setValueAtTime(freq, now + time)
        osc.connect(amp)
        amp.connect(ctx.destination)
        amp.gain.setValueAtTime(0.0001, now + time)
        amp.gain.exponentialRampToValueAtTime(gain, now + time + 0.01)
        amp.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.11)
        osc.start(now + time)
        osc.stop(now + time + 0.12)
      })
    } else {
      const osc = ctx.createOscillator()
      const amp = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(620, now)
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.18)
      osc.connect(amp)
      amp.connect(ctx.destination)
      amp.gain.setValueAtTime(0.0001, now)
      amp.gain.exponentialRampToValueAtTime(0.06, now + 0.02)
      amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
      osc.start(now)
      osc.stop(now + 0.24)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || event.repeat) return
      if (!enabled) return
      if (!isNearRef.current || !isLookingRef.current) return
      playSound()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled])

  return (
    <group ref={groupRef} position={position}>
      <mesh visible={false}>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 18]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {showPrompt && isNearRef.current && (
        <Html position={[0, 0.06, 0]} center>
          <div className="bg-black/75 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-white/15">
            Press [E] {label}
          </div>
        </Html>
      )}
    </group>
  )
}

function DiningChair({
  seatId,
  position,
  rotation = [0, 0, 0],
  activeSeatId,
  onDiningMode,
}: {
  seatId: string
  position: [number, number, number]
  rotation?: [number, number, number]
  activeSeatId: string | null
  onDiningMode?: (seatId: string, active: boolean) => void
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
      if (event.repeat) return

      if (event.code === "KeyQ" && isSittingRef.current && activeSeatId === seatId) {
        setIsSitting(false)
        onDiningMode?.(seatId, false)
        camera.position.copy(originalCameraPos.current)
        camera.quaternion.copy(originalCameraQuaternion.current)
        return
      }

      if (event.code !== "KeyE") return

      if (activeSeatId && activeSeatId !== seatId) return
      if (!isNearRef.current || !isHoveredRef.current || !groupRef.current) return

      originalCameraPos.current.copy(camera.position)
      originalCameraQuaternion.current.copy(camera.quaternion)

      const seatedCameraPosition = groupRef.current.localToWorld(new THREE.Vector3(0, 1.0, 0.02))
      const diningAreaGroup = groupRef.current.parent
      const seatedLookTarget = diningAreaGroup
        ? diningAreaGroup.localToWorld(new THREE.Vector3(0, 0.84, 0))
        : groupRef.current.localToWorld(new THREE.Vector3(0, 0.9, -0.62))

      setIsSitting(true)
      onDiningMode?.(seatId, true)
      camera.position.copy(seatedCameraPosition)
      camera.lookAt(seatedLookTarget)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeSeatId, camera, onDiningMode, seatId])

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
            Press [Q] to get up
          </div>
        </Html>
      )}
    </group>
  )
}
