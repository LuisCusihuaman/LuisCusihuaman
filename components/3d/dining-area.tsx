"use client"

import { RoundedBox } from "@react-three/drei"
import { ROOM_FRONT_EXTENT, ROOM_WIDTH } from "./room"

const TABLE_POSITION: [number, number, number] = [ROOM_WIDTH / 2 - 0.36, 0, ROOM_FRONT_EXTENT - 1.45]
const TABLE_ROTATION: [number, number, number] = [0, -Math.PI / 2, 0]

export function DiningArea() {
  return (
    <group position={TABLE_POSITION} rotation={TABLE_ROTATION}>
      <DiningTable />

      <DiningChair position={[-0.98, 0, 0.1]} rotation={[0, Math.PI / 2, 0]} />
      <DiningChair position={[0.42, 0, 0.3]} rotation={[0, Math.PI, 0]} />
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
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        args={[0.5, 0.09, 0.46]}
        position={[0, 0.5, 0]}
        radius={0.03}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color="#d2c3ad" roughness={0.9} />
      </RoundedBox>

      <RoundedBox
        args={[0.46, 0.62, 0.1]}
        position={[0, 0.9, -0.17]}
        radius={0.03}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color="#cec0aa" roughness={0.92} />
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
    </group>
  )
}
