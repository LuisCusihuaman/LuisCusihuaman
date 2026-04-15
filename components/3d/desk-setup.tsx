"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { RoundedBox, Html } from "@react-three/drei"

interface DeskSetupProps {
  onObjectHover: (object: string | null) => void
  onObjectClick: (object: string) => void
  onWorkingMode?: (active: boolean) => void
}

export const DESK_POSITION: [number, number, number] = [-1.1, 0, -1.6]

const DESK_WORLD_POSITION = new THREE.Vector3(...DESK_POSITION)
const PIANO_INTERACTION_DISTANCE = 2
const PIANO_EXTENDED_OFFSET = 0.24
const PIANO_ACCESS_MIN_X = DESK_POSITION[0] + 0.48
const PIANO_INTERACTION_POINT = new THREE.Vector3(
  DESK_POSITION[0] + 0.72,
  0.72,
  DESK_POSITION[2] + 0.34,
)
const TV_INTERACTION_DISTANCE = 2.25
const TV_LOCAL_POSITION = new THREE.Vector3(0, 1.7, -0.34)
const TV_WORLD_POSITION = new THREE.Vector3(
  DESK_POSITION[0] + TV_LOCAL_POSITION.x,
  TV_LOCAL_POSITION.y,
  DESK_POSITION[2] + TV_LOCAL_POSITION.z,
)
const TABLET_INTERACTION_DISTANCE = 1.9
const TABLET_LOCAL_POSITION = new THREE.Vector3(-0.48, 0, 0.06)
const CHAIR_INTERACTION_DISTANCE = 1.95
const CHAIR_INITIAL_POSITION: [number, number, number] = [-0.95, 0, 0.58]
const RING_LIGHT_INTERACTION_DISTANCE = 2.2
const RING_LIGHT_LOCAL_POSITION = new THREE.Vector3(1.72, 0, -0.02)
const DESK_CONTROL_PANEL_LOCAL_X = 1.14
const DESK_CONTROL_PANEL_LOCAL_Z = -0.24
const DESK_CONTROL_PANEL_LOCAL_Y_OFFSET = 0.03
const DESK_CONTROL_PANEL_INTERACTION_DISTANCE = 0.9

type DeskInteractionTarget = "chair" | "piano" | "tv" | "tablet"

function createMacDesktopTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 1600
  canvas.height = 900

  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  background.addColorStop(0, "#08111d")
  background.addColorStop(0.4, "#173a61")
  background.addColorStop(0.75, "#ff824d")
  background.addColorStop(1, "#ffd17f")
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const glow = ctx.createRadialGradient(canvas.width * 0.72, canvas.height * 0.3, 40, canvas.width * 0.72, canvas.height * 0.3, 520)
  glow.addColorStop(0, "rgba(255,255,255,0.55)")
  glow.addColorStop(0.3, "rgba(255,196,120,0.28)")
  glow.addColorStop(1, "rgba(255,196,120,0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "rgba(7,10,18,0.22)"
  ctx.beginPath()
  ctx.moveTo(0, canvas.height * 0.78)
  ctx.quadraticCurveTo(canvas.width * 0.22, canvas.height * 0.62, canvas.width * 0.42, canvas.height * 0.74)
  ctx.quadraticCurveTo(canvas.width * 0.7, canvas.height * 0.9, canvas.width, canvas.height * 0.68)
  ctx.lineTo(canvas.width, canvas.height)
  ctx.lineTo(0, canvas.height)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = "rgba(255,255,255,0.12)"
  ctx.fillRect(0, 0, canvas.width, 36)
  ctx.fillStyle = "#f5f7fb"
  ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Finder    File    Edit    View    Go    Window    Help", 26, 24)
  ctx.fillText("Tue 4:20 PM", canvas.width - 154, 24)

  drawWindow(ctx, 180, 132, 420, 272, "#eef3fb", "Portfolio")
  drawWindow(ctx, 680, 170, 520, 326, "#f4f7fc", "Now Playing")

  ctx.fillStyle = "#253247"
  ctx.font = "24px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Creative workspace", 214, 214)
  ctx.fillStyle = "#56657d"
  ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Next.js  •  React Three Fiber  •  TypeScript", 214, 252)

  ctx.fillStyle = "#1f4a7c"
  roundRect(ctx, 214, 288, 138, 42, 12)
  ctx.fill()
  ctx.fillStyle = "#ffffff"
  ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Open Panel", 246, 315)

  const panelGradient = ctx.createLinearGradient(712, 220, 1160, 452)
  panelGradient.addColorStop(0, "#1f2f4a")
  panelGradient.addColorStop(1, "#243b60")
  ctx.fillStyle = panelGradient
  roundRect(ctx, 712, 220, 456, 222, 18)
  ctx.fill()

  ctx.fillStyle = "#dbe7ff"
  ctx.font = "22px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Lo-fi coding session", 744, 268)
  ctx.fillStyle = "#adc0e3"
  ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Desk lights on, city lights outside.", 744, 304)
  ctx.fillText("Monitor wakes up when you get closer.", 744, 334)

  ctx.fillStyle = "rgba(255,255,255,0.16)"
  roundRect(ctx, 744, 374, 344, 12, 6)
  ctx.fill()
  ctx.fillStyle = "#f7a05c"
  roundRect(ctx, 744, 374, 232, 12, 6)
  ctx.fill()

  ctx.fillStyle = "rgba(22,25,35,0.34)"
  roundRect(ctx, canvas.width / 2 - 292, canvas.height - 88, 584, 62, 24)
  ctx.fill()

  const dockColors = ["#6aa9ff", "#f77f67", "#72d39b", "#f4c15d", "#ab8cff", "#95d7ff", "#ffffff"]
  dockColors.forEach((color, index) => {
    ctx.fillStyle = color
    roundRect(ctx, canvas.width / 2 - 240 + index * 72, canvas.height - 72, 48, 48, 14)
    ctx.fill()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true

  return texture
}

function createTabletWorkspaceTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  canvas.height = 800

  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.fillStyle = "#1d2027"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "#2a2f39"
  ctx.fillRect(0, 0, 74, canvas.height)
  ctx.fillStyle = "#232833"
  ctx.fillRect(74, 0, canvas.width - 74, 44)
  ctx.fillStyle = "#252a35"
  ctx.fillRect(canvas.width - 188, 44, 188, canvas.height - 44)

  ;["#ff5f57", "#febc2e", "#28c840"].forEach((dot, i) => {
    ctx.fillStyle = dot
    ctx.beginPath()
    ctx.arc(24 + i * 18, 22, 6, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = "#dfe6f2"
  ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Photoshop", 96, 28)
  ctx.fillText("dog-sketch.psd @ 66.7%", 238, 28)

  ctx.fillStyle = "#3a404d"
  ;[[20, 82], [20, 132], [20, 182], [20, 232], [20, 282], [20, 332]].forEach(([x, y], i) => {
    roundRect(ctx, x, y, 34, 34, 8)
    ctx.fill()
    ctx.fillStyle = i % 2 === 0 ? "#d7dce8" : "#9ad0ff"
    ctx.fillRect(x + 10, y + 10, 14, 14)
    ctx.fillStyle = "#3a404d"
  })

  const artX = 116
  const artY = 84
  const artW = 760
  const artH = 594

  ctx.fillStyle = "#10131a"
  roundRect(ctx, artX - 12, artY - 12, artW + 24, artH + 24, 20)
  ctx.fill()

  const artGradient = ctx.createLinearGradient(artX, artY, artX + artW, artY + artH)
  artGradient.addColorStop(0, "#f9eee5")
  artGradient.addColorStop(1, "#f3dbc5")
  ctx.fillStyle = artGradient
  roundRect(ctx, artX, artY, artW, artH, 18)
  ctx.fill()

  ctx.fillStyle = "rgba(255,255,255,0.38)"
  ctx.beginPath()
  ctx.ellipse(artX + 510, artY + 168, 190, 110, -0.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#f8e7d3"
  ctx.beginPath()
  ctx.ellipse(artX + 364, artY + 376, 170, 138, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#d89c64"
  ctx.beginPath()
  ctx.ellipse(artX + 366, artY + 328, 116, 106, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(artX + 284, artY + 224)
  ctx.lineTo(artX + 232, artY + 146)
  ctx.lineTo(artX + 322, artY + 178)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(artX + 446, artY + 216)
  ctx.lineTo(artX + 512, artY + 154)
  ctx.lineTo(artX + 406, artY + 174)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = "#fff8f0"
  ctx.beginPath()
  ctx.ellipse(artX + 330, artY + 348, 18, 24, 0, 0, Math.PI * 2)
  ctx.ellipse(artX + 404, artY + 348, 18, 24, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#2c221d"
  ctx.beginPath()
  ctx.ellipse(artX + 332, artY + 350, 8, 12, 0, 0, Math.PI * 2)
  ctx.ellipse(artX + 402, artY + 350, 8, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = "#2c221d"
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(artX + 348, artY + 410)
  ctx.quadraticCurveTo(artX + 366, artY + 425, artX + 384, artY + 410)
  ctx.stroke()

  ctx.fillStyle = "#2c221d"
  ctx.beginPath()
  ctx.moveTo(artX + 366, artY + 374)
  ctx.lineTo(artX + 348, artY + 396)
  ctx.lineTo(artX + 384, artY + 396)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = "rgba(44,34,29,0.7)"
  ctx.lineWidth = 3
  ;[-1, 1].forEach((side) => {
    ctx.beginPath()
    ctx.moveTo(artX + 364 + side * 34, artY + 392)
    ctx.lineTo(artX + 364 + side * 74, artY + 382)
    ctx.moveTo(artX + 364 + side * 34, artY + 404)
    ctx.lineTo(artX + 364 + side * 82, artY + 404)
    ctx.moveTo(artX + 364 + side * 34, artY + 416)
    ctx.lineTo(artX + 364 + side * 72, artY + 428)
    ctx.stroke()
  })

  ctx.fillStyle = "#4a5161"
  ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Golden retriever study", artX + 24, artY + artH - 28)

  ctx.fillStyle = "#2b303b"
  roundRect(ctx, canvas.width - 168, 68, 142, 180, 12)
  ctx.fill()
  ctx.fillStyle = "#d6dde8"
  ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText("Layers", canvas.width - 132, 92)

  ;[
    ["Lineart", "#f4f7fb"],
    ["Color", "#ffcf92"],
    ["Background", "#d4e3ff"],
  ].forEach(([label, color], i) => {
    ctx.fillStyle = "#3b4250"
    roundRect(ctx, canvas.width - 156, 112 + i * 42, 118, 30, 8)
    ctx.fill()
    ctx.fillStyle = color
    ctx.fillRect(canvas.width - 146, 120 + i * 42, 18, 14)
    ctx.fillStyle = "#dfe5f0"
    ctx.fillText(label, canvas.width - 118, 133 + i * 42)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true

  return texture
}

function drawWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  title: string,
) {
  ctx.fillStyle = "rgba(255,255,255,0.3)"
  roundRect(ctx, x, y, width, height, 20)
  ctx.fill()

  ctx.fillStyle = color
  roundRect(ctx, x, y + 12, width, height - 12, 18)
  ctx.fill()

  ctx.fillStyle = "rgba(230,235,244,0.95)"
  roundRect(ctx, x, y, width, 34, 18)
  ctx.fill()

  ;["#ff5f57", "#febc2e", "#28c840"].forEach((dot, i) => {
    ctx.fillStyle = dot
    ctx.beginPath()
    ctx.arc(x + 24 + i * 18, y + 18, 6, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = "#415066"
  ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif"
  ctx.fillText(title, x + 90, y + 23)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export function DeskSetup({ onObjectHover, onObjectClick, onWorkingMode }: DeskSetupProps) {
  const [deskHeight, setDeskHeight] = useState(0.75) // Default sitting height
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [chairPosition, setChairPosition] = useState<[number, number, number]>(CHAIR_INITIAL_POSITION)
  const [activeInteractionTarget, setActiveInteractionTarget] = useState<DeskInteractionTarget | null>(null)
  const targetHeight = useRef(0.75)
  const activeInteractionTargetRef = useRef<DeskInteractionTarget | null>(null)
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const isDeskMoving = Math.abs(deskHeight - targetHeight.current) > 0.01
  
  // Smooth desk height animation
  useFrame(() => {
    if (Math.abs(deskHeight - targetHeight.current) > 0.001) {
      setDeskHeight(prev => prev + (targetHeight.current - prev) * 0.1)
    }
  })
  
  // Check proximity for desk adjustment
  useFrame(() => {
    if (!groupRef.current) return
    const controlPanelWorldX = DESK_POSITION[0] + DESK_CONTROL_PANEL_LOCAL_X
    const controlPanelWorldZ = DESK_POSITION[2] + DESK_CONTROL_PANEL_LOCAL_Z
    const horizontalDistToPanel = Math.hypot(
      camera.position.x - controlPanelWorldX,
      camera.position.z - controlPanelWorldZ,
    )
    const isNearControlPanel = horizontalDistToPanel < DESK_CONTROL_PANEL_INTERACTION_DISTANCE
    setIsAdjusting(isNearControlPanel)

    const chairInteractionPoint = new THREE.Vector3(
      DESK_POSITION[0] + chairPosition[0],
      0.82,
      DESK_POSITION[2] + chairPosition[2] - 0.08,
    )
    const tabletWorldPos = new THREE.Vector3(
      DESK_POSITION[0] + TABLET_LOCAL_POSITION.x,
      deskHeight + 0.16,
      DESK_POSITION[2] + TABLET_LOCAL_POSITION.z,
    )

    const nextTarget =
      [
        { id: "chair" as const, dist: camera.position.distanceTo(chairInteractionPoint), threshold: CHAIR_INTERACTION_DISTANCE },
        {
          id: "piano" as const,
          dist: camera.position.distanceTo(PIANO_INTERACTION_POINT),
          threshold: !isNearControlPanel && camera.position.x >= PIANO_ACCESS_MIN_X ? PIANO_INTERACTION_DISTANCE : 0,
        },
        { id: "tv" as const, dist: camera.position.distanceTo(TV_WORLD_POSITION), threshold: TV_INTERACTION_DISTANCE },
        { id: "tablet" as const, dist: camera.position.distanceTo(tabletWorldPos), threshold: TABLET_INTERACTION_DISTANCE },
      ]
        .filter(({ dist, threshold }) => dist < threshold)
        .sort((a, b) => {
          const aScore = a.dist / a.threshold + (a.id === activeInteractionTargetRef.current ? -0.05 : 0)
          const bScore = b.dist / b.threshold + (b.id === activeInteractionTargetRef.current ? -0.05 : 0)
          return aScore - bScore
        })[0]?.id ?? null

    if (nextTarget !== activeInteractionTargetRef.current) {
      activeInteractionTargetRef.current = nextTarget
      setActiveInteractionTarget(nextTarget)
    }
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
    <group ref={groupRef} position={DESK_POSITION}>
      {/* Main Desk - Standing desk with adjustable height */}
      <StandingDesk height={deskHeight} isAdjusting={isAdjusting} isMoving={isDeskMoving} />
      
      {/* Piano keyboard under desk - slides out */}
      <Piano
        deskHeight={deskHeight}
        onHover={onObjectHover}
        onClick={onObjectClick}
        interactionActive={activeInteractionTarget === "piano"}
      />
      
      {/* Wall-mounted TV - Bigger and lower */}
      <TV
        onHover={onObjectHover}
        onClick={onObjectClick}
        interactionActive={activeInteractionTarget === "tv"}
      />
      
      {/* Drawing Tablet - Better model */}
      <DrawingTablet
        deskHeight={deskHeight}
        onHover={onObjectHover}
        onClick={onObjectClick}
        interactionActive={activeInteractionTarget === "tablet"}
      />
      
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
      <RingLight onHover={onObjectHover} />
      
      {/* Webcam */}
      <Webcam deskHeight={deskHeight} />
      
      {/* Plant */}
      <Plant deskHeight={deskHeight} onHover={onObjectHover} onClick={onObjectClick} />
      
      {/* Dock */}
      <Dock deskHeight={deskHeight} />
      
      {/* Office Chair */}
      <OfficeChair
        deskHeight={deskHeight}
        position={chairPosition}
        onPositionChange={setChairPosition}
        interactionActive={activeInteractionTarget === "chair"}
        onWorkingMode={onWorkingMode}
      />
      
      {/* Orange Plushie */}
      <Plushie deskHeight={deskHeight} />
      
      {/* Sheet music on wall */}
      <SheetMusic />
    </group>
  )
}

function StandingDesk({ height, isAdjusting, isMoving }: { height: number; isAdjusting: boolean; isMoving: boolean }) {
  const deskWidth = 2.4
  const deskDepth = 0.65
  const legHeight = height - 0.03
  const legWidth = 0.06
  const displayValue = Math.round(height * 100)
  
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
      <group
        position={[DESK_CONTROL_PANEL_LOCAL_X, height + DESK_CONTROL_PANEL_LOCAL_Y_OFFSET, DESK_CONTROL_PANEL_LOCAL_Z]}
        rotation={[0, 0, 0]}
      >
        <RoundedBox args={[0.11, 0.032, 0.22]} radius={0.008} smoothness={4} castShadow>
          <meshStandardMaterial color="#141414" roughness={0.35} metalness={0.3} />
        </RoundedBox>

        {/* Display housing */}
        <mesh position={[0, 0.017, -0.05]} castShadow>
          <boxGeometry args={[0.048, 0.01, 0.09]} />
          <meshStandardMaterial color="#0a120a" roughness={0.3} metalness={0.15} />
        </mesh>

        {/* Display */}
        <mesh position={[0, 0.024, -0.05]}>
          <planeGeometry args={[0.035, 0.082]} />
          <meshStandardMaterial
            color={isAdjusting ? "#0f2b18" : "#08150c"}
            emissive={isAdjusting ? "#49ff8f" : "#12381f"}
            emissiveIntensity={isAdjusting ? 1.15 : 0.45}
          />
        </mesh>
        <Html position={[0, 0.026, -0.05]} transform sprite scale={0.032} center>
          <div className="font-mono text-[18px] tracking-[0.2em] text-emerald-300">
            {displayValue}
          </div>
        </Html>

        {/* Buttons */}
        {[
          { z: 0.035, active: isAdjusting, label: "Q" },
          { z: 0.08, active: isAdjusting, label: "Z" },
        ].map(({ z, active, label }) => (
          <group key={label} position={[0.028, 0.018, z]}>
            <mesh>
              <cylinderGeometry args={[0.014, 0.014, 0.01, 14]} />
              <meshStandardMaterial
                color={active ? "#505050" : "#2d2d2d"}
                roughness={0.35}
                metalness={0.18}
              />
            </mesh>
            <Html position={[0, 0.01, 0.01]} transform sprite scale={0.02} center>
              <div className="font-mono text-[14px] text-neutral-200">
                {label}
              </div>
            </Html>
          </group>
        ))}

        {/* Status LEDs */}
        {[
          { z: -0.095, color: isAdjusting ? "#49ff8f" : "#163c22", intensity: isAdjusting ? 2.1 : 0.15 },
          { z: -0.072, color: isMoving ? "#ffb54a" : "#47320e", intensity: isMoving ? 1.8 : 0.12 },
        ].map(({ z, color, intensity }, index) => (
          <mesh key={index} position={[0, 0.023, z]}>
            <sphereGeometry args={[0.006, 10, 10]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
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
        <Html position={[DESK_CONTROL_PANEL_LOCAL_X + 0.02, height + 0.24, DESK_CONTROL_PANEL_LOCAL_Z - 0.02]} center>
          <div className="bg-black/75 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-white/15">
            Standing Desk Controls: [Q] Up / [Z] Down
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
  interactionActive?: boolean
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

function Piano({ deskHeight = 0.75, onHover, onClick, interactionActive = true }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  const [isExtended, setIsExtended] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeKeys, setActiveKeys] = useState<number[]>([])
  const [showPrompt, setShowPrompt] = useState(false)
  const [promptPosition, setPromptPosition] = useState<[number, number, number]>([0.72, 0.17, 0.19])
  const [currentMelody, setCurrentMelody] = useState(0)
  const [isHandleHovered, setIsHandleHovered] = useState(false)
  const isNearRef = useRef(false)
  const isHandleHoveredRef = useRef(false)
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

  const updatePromptPositionFromEvent = (event: { point: THREE.Vector3 }) => {
    if (!groupRef.current) return

    const localPoint = groupRef.current.worldToLocal(event.point.clone())
    setPromptPosition([
      Math.max(0.55, Math.min(0.98, localPoint.x)),
      Math.max(0.12, localPoint.y + 0.14),
      Math.max(pianoDepth / 2 + 0.015, localPoint.z + 0.06),
    ])
  }

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
    const canAccessFromHere = camera.position.x >= PIANO_ACCESS_MIN_X
    const pianoWorldPos = new THREE.Vector3(
      DESK_POSITION[0],
      deskHeight - 0.12,
      DESK_POSITION[2] + slidePosition.current,
    )
    const dist = camera.position.distanceTo(pianoWorldPos)
    isNearRef.current = dist < PIANO_INTERACTION_DISTANCE && canAccessFromHere

    if ((!isNearRef.current || !interactionActive) && isHandleHoveredRef.current && !isExtended) {
      isHandleHoveredRef.current = false
      setIsHandleHovered(false)
      setHovered(false)
      onHover(null)
      document.body.style.cursor = "auto"
    }

    setShowPrompt(isNearRef.current && interactionActive && isHandleHoveredRef.current && !isExtended)
  })
  
  // Animate slide - slides OUT towards player (positive Z)
  useFrame(() => {
    targetSlide.current = isExtended ? PIANO_EXTENDED_OFFSET : 0
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
      if (e.code !== "KeyE" || e.repeat) return
      if (!isExtended && (!interactionActive || !isNearRef.current || !isHandleHoveredRef.current)) return

      if (!isExtended) {
        setIsExtended(true)
      } else {
        setIsExtended(false)
        stopPlaying()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      stopPlaying()
    }
  }, [interactionActive, isExtended])

  // Stop music when piano closes
  useEffect(() => {
    if (!isExtended) {
      stopPlaying()
    }
  }, [isExtended])
  
  return (
    <group ref={groupRef} position={[0, deskHeight - 0.12, 0.15]}>
      {/* Piano body - wider for easier clicking */}
      <RoundedBox args={[pianoWidth, pianoHeight, pianoDepth]} radius={0.01} smoothness={4} castShadow>
        <meshStandardMaterial 
          color={hovered ? "#2a2a2a" : "#1a1a1a"} 
          roughness={0.6} 
          metalness={0.1}
          emissive={isPlaying ? "#221100" : "#000000"}
        />
      </RoundedBox>

      {/* Front-right tray lip: visual edge plus a larger invisible hit area */}
      <mesh
        position={[0.68, 0.02, pianoDepth / 2 + 0.03]}
        onPointerEnter={() => {
          if (!interactionActive || !isNearRef.current || isExtended) return
          isHandleHoveredRef.current = true
          setIsHandleHovered(true)
          setHovered(true)
          onHover("piano")
          document.body.style.cursor = "pointer"
        }}
        onPointerMove={(event) => {
          if (!interactionActive || !isNearRef.current || isExtended) return
          updatePromptPositionFromEvent(event)
        }}
        onPointerLeave={() => {
          if (isExtended) return
          isHandleHoveredRef.current = false
          setIsHandleHovered(false)
          setHovered(false)
          onHover(null)
          document.body.style.cursor = "auto"
        }}
      >
        <boxGeometry args={[0.56, 0.12, 0.16]} />
        <meshStandardMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>

      <mesh
        position={[0.74, -0.005, pianoDepth / 2 + 0.012]}
        castShadow
        onPointerEnter={() => {
          if (!interactionActive || !isNearRef.current || isExtended) return
          isHandleHoveredRef.current = true
          setIsHandleHovered(true)
          setHovered(true)
          onHover("piano")
          document.body.style.cursor = "pointer"
        }}
        onPointerLeave={() => {
          if (isExtended) return
          isHandleHoveredRef.current = false
          setIsHandleHovered(false)
          setHovered(false)
          onHover(null)
          document.body.style.cursor = "auto"
        }}
      >
        <boxGeometry args={[0.3, 0.035, 0.055]} />
        <meshStandardMaterial
          color={isHandleHovered ? "#474747" : "#2f2f2f"}
          roughness={0.5}
          metalness={0.12}
        />
      </mesh>
      
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
        <Html position={promptPosition} center>
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap backdrop-blur-sm border border-white/20">
            Press [E] to pull out piano tray
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

function TV({ onHover, onClick, interactionActive = true }: Omit<InteractiveProps, "deskHeight">) {
  const [hovered, setHovered] = useState(false)
  const isNearRef = useRef(false)
  const screenPower = useRef(0)
  const screenRef = useRef<THREE.MeshStandardMaterial>(null)
  const { camera } = useThree()
  const desktopTexture = useMemo(() => createMacDesktopTexture(), [])

  useEffect(() => {
    return () => {
      desktopTexture?.dispose()
    }
  }, [desktopTexture])
  
  useFrame(() => {
    const near = camera.position.distanceTo(TV_WORLD_POSITION) < TV_INTERACTION_DISTANCE
    screenPower.current += ((near ? 1 : 0) - screenPower.current) * 0.12

    if (screenRef.current) {
      const glow = 0.18 + screenPower.current * (hovered ? 0.92 : 0.75)
      const base = 0.03 + screenPower.current * 0.97

      screenRef.current.color.setScalar(base)
      screenRef.current.emissive.setScalar(screenPower.current > 0.02 ? 1 : 0)
      screenRef.current.emissiveIntensity = glow * screenPower.current
    }

    if ((!near || !interactionActive) && isNearRef.current) {
      setHovered(false)
      onHover(null)
    }

    isNearRef.current = near
  })
  
  // TV is now bigger (1.6 x 0.9) and lower (1.7 instead of 2.0)
  return (
    <group
      position={TV_LOCAL_POSITION}
      onPointerEnter={() => {
        if (!isNearRef.current || !interactionActive) return
        setHovered(true)
        onHover("tv")
      }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={(event) => {
        event.stopPropagation()
        if (!isNearRef.current || !interactionActive) return
        onClick("tv")
      }}
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
          color="#050607"
          map={desktopTexture ?? undefined}
          emissiveMap={desktopTexture ?? undefined}
          emissive="#ffffff"
          emissiveIntensity={0}
          roughness={0.08}
          metalness={0.02}
          toneMapped={false}
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

function DrawingTablet({ deskHeight = 0.75, onHover, onClick, interactionActive = true }: InteractiveProps) {
  const [hovered, setHovered] = useState(false)
  const isNearRef = useRef(false)
  const screenPower = useRef(0)
  const screenRef = useRef<THREE.MeshStandardMaterial>(null)
  const { camera } = useThree()
  const tabletTexture = useMemo(() => createTabletWorkspaceTexture(), [])

  useEffect(() => {
    return () => {
      tabletTexture?.dispose()
    }
  }, [tabletTexture])
  
  useFrame(() => {
    const tabletWorldPos = new THREE.Vector3(
      DESK_POSITION[0] + TABLET_LOCAL_POSITION.x,
      deskHeight + 0.16,
      DESK_POSITION[2] + TABLET_LOCAL_POSITION.z,
    )
    const near = camera.position.distanceTo(tabletWorldPos) < TABLET_INTERACTION_DISTANCE
    screenPower.current += ((near ? 1 : 0) - screenPower.current) * 0.12

    if (screenRef.current) {
      const glow = 0.14 + screenPower.current * (hovered ? 0.78 : 0.62)
      const base = 0.03 + screenPower.current * 0.97

      screenRef.current.color.setScalar(base)
      screenRef.current.emissive.setScalar(screenPower.current > 0.02 ? 1 : 0)
      screenRef.current.emissiveIntensity = glow * screenPower.current
    }

    if ((!near || !interactionActive) && isNearRef.current) {
      setHovered(false)
      onHover(null)
    }

    isNearRef.current = near
  })
  
  // Better modeled drawing tablet
  return (
    <group
      position={[TABLET_LOCAL_POSITION.x, deskHeight + 0.16, TABLET_LOCAL_POSITION.z]}
      rotation={[-0.52, 0.04, 0]}
      onPointerEnter={() => {
        if (!isNearRef.current || !interactionActive) return
        setHovered(true)
        onHover("tablet")
      }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={(event) => {
        event.stopPropagation()
        if (!isNearRef.current || !interactionActive) return
        onClick("tablet")
      }}
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
          color="#050607"
          map={tabletTexture ?? undefined}
          emissiveMap={tabletTexture ?? undefined}
          emissive="#ffffff"
          emissiveIntensity={0}
          roughness={0.05}
          metalness={0.02}
          toneMapped={false}
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

function RingLight({ onHover }: { onHover: (object: string | null) => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const isNearRef = useRef(false)
  const ringMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const glowLightRef = useRef<THREE.PointLight>(null)
  const { camera } = useThree()
  const cycleColors = useMemo(
    () => ["#fffaf0", "#ff4d4d", "#45e07d", "#4f7dff", "#fffaf0"].map((color) => new THREE.Color(color)),
    [],
  )

  useFrame(({ clock }) => {
    if (!ringMaterialRef.current || !glowLightRef.current) return

    const ringWorldPos = new THREE.Vector3(
      DESK_POSITION[0] + RING_LIGHT_LOCAL_POSITION.x,
      1.8,
      DESK_POSITION[2] + RING_LIGHT_LOCAL_POSITION.z + 0.2,
    )
    const near = camera.position.distanceTo(ringWorldPos) < RING_LIGHT_INTERACTION_DISTANCE

    if (!near && isNearRef.current) {
      setIsHovered(false)
      onHover(null)
    }

    isNearRef.current = near

    const targetColor = new THREE.Color("#fffaf0")
    if (isActive) {
      const phase = (clock.getElapsedTime() * 1.5) % cycleColors.length
      const currentIndex = Math.floor(phase)
      const nextIndex = (currentIndex + 1) % cycleColors.length
      const blend = phase - currentIndex
      targetColor.copy(cycleColors[currentIndex]).lerp(cycleColors[nextIndex], blend)
    }

    ringMaterialRef.current.emissive.lerp(targetColor, 0.18)
    ringMaterialRef.current.color.lerp(targetColor, 0.12)
    glowLightRef.current.color.lerp(targetColor, 0.18)
    glowLightRef.current.intensity = THREE.MathUtils.lerp(
      glowLightRef.current.intensity,
      isActive ? 0.65 : 0.3,
      0.14,
    )
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== "KeyE" || !isNearRef.current || !isHovered) return
      setIsActive((current) => !current)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isHovered])

  return (
    <group position={[RING_LIGHT_LOCAL_POSITION.x, RING_LIGHT_LOCAL_POSITION.y, RING_LIGHT_LOCAL_POSITION.z]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Floor base */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.06, 18]} />
        <meshStandardMaterial color="#151515" roughness={0.8} metalness={0.12} />
      </mesh>

      {/* Stand pole */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 1.72, 12]} />
        <meshStandardMaterial color="#242424" roughness={0.52} metalness={0.28} />
      </mesh>

      {/* Neck arm */}
      <mesh position={[0, 1.66, 0.08]} rotation={[0.35, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.24, 10]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.56} metalness={0.22} />
      </mesh>

      {/* Ring light */}
      <group position={[0, 1.8, 0.2]} rotation={[0, 0, 0]}>
        <mesh
          castShadow
          onPointerOver={(event) => {
            event.stopPropagation()
            if (!isNearRef.current) return
            setIsHovered(true)
            onHover("ring light")
          }}
          onPointerOut={() => {
            setIsHovered(false)
            onHover(null)
          }}
        >
          <torusGeometry args={[0.22, 0.022, 10, 36]} />
          <meshStandardMaterial
            ref={ringMaterialRef}
            color="#f5f5f0"
            emissive="#fffaf0"
            emissiveIntensity={1.0}
            roughness={0.24}
          />
        </mesh>
        <mesh
          onPointerOver={(event) => {
            event.stopPropagation()
            if (!isNearRef.current) return
            setIsHovered(true)
            onHover("ring light")
          }}
          onPointerOut={() => {
            setIsHovered(false)
            onHover(null)
          }}
          visible={false}
        >
          <sphereGeometry args={[0.38, 18, 18]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {/* Inner ring */}
        <mesh>
          <torusGeometry args={[0.22, 0.008, 8, 36]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <pointLight ref={glowLightRef} position={[0, 0, 0]} intensity={0.3} distance={4} color="#fff7ea" />
        {isHovered && isNearRef.current && (
          <Html position={[0, -0.34, 0]} center>
            <div className="bg-black/75 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-white/15">
              {isActive ? "Press [E] to turn off RGB ring" : "Press [E] to turn on RGB ring"}
            </div>
          </Html>
        )}
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

function OfficeChair({
  deskHeight,
  position,
  onPositionChange,
  interactionActive = true,
  onWorkingMode,
}: {
  deskHeight: number
  position: [number, number, number]
  onPositionChange: (position: [number, number, number]) => void
  interactionActive?: boolean
  onWorkingMode?: (active: boolean) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [isNearChair, setIsNearChair] = useState(false)
  const [isWorkingMode, setIsWorkingMode] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const originalCameraPos = useRef(new THREE.Vector3())
  const originalCameraQuaternion = useRef(new THREE.Quaternion())
  const isNearChairRef = useRef(false)
  const isWorkingModeRef = useRef(false)
  
  useFrame(() => {
    if (groupRef.current) {
      const interactionPoint = groupRef.current.localToWorld(new THREE.Vector3(0, 0.82, -0.08))
      const near = camera.position.distanceTo(interactionPoint) < CHAIR_INTERACTION_DISTANCE
      const nextIsNearChair = near && interactionActive

      if (nextIsNearChair !== isNearChairRef.current) {
        isNearChairRef.current = nextIsNearChair
        setIsNearChair(nextIsNearChair)
      }
    }
  })
  
  useEffect(() => {
    isWorkingModeRef.current = isWorkingMode
  }, [isWorkingMode])

  useEffect(() => {
    if (interactionActive || isWorkingMode) return
    setHovered(false)
    gl.domElement.style.cursor = "auto"
  }, [gl, interactionActive, isWorkingMode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || event.repeat) return

      if (isWorkingModeRef.current) {
        setIsWorkingMode(false)
        onWorkingMode?.(false)
        camera.position.copy(originalCameraPos.current)
        camera.quaternion.copy(originalCameraQuaternion.current)
        return
      }

      if (!interactionActive || !isNearChairRef.current || !groupRef.current) return

      originalCameraPos.current.copy(camera.position)
      originalCameraQuaternion.current.copy(camera.quaternion)

      const workingCameraPosition = groupRef.current.localToWorld(new THREE.Vector3(0, 1, -0.02))
      const workingLookTarget = groupRef.current.localToWorld(
        new THREE.Vector3(0, Math.max(0.95, deskHeight + 0.18), 1.25),
      )

      setIsWorkingMode(true)
      onWorkingMode?.(true)
      camera.position.copy(workingCameraPosition)
      camera.lookAt(workingLookTarget)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [camera, deskHeight, interactionActive, onWorkingMode])
  
  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={[0, Math.PI, 0]}
    >
      {/* Seat */}
      <RoundedBox args={[0.5, 0.08, 0.45]} position={[0, 0.5, 0]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={hovered ? "#2a2a2a" : "#1a1a1a"} roughness={0.8} />
      </RoundedBox>
      
      {/* Backrest */}
      <RoundedBox args={[0.48, 0.55, 0.06]} position={[0, 0.85, -0.2]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={hovered ? "#2a2a2a" : "#1a1a1a"} roughness={0.8} />
      </RoundedBox>
      
      {/* Headrest */}
      <RoundedBox args={[0.25, 0.15, 0.05]} position={[0, 1.2, -0.22]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={hovered ? "#2a2a2a" : "#1a1a1a"} roughness={0.8} />
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

      <mesh
        position={[0, 0.72, -0.02]}
        onPointerEnter={(event) => {
          if (isWorkingMode || !interactionActive) return
          event.stopPropagation()
          setHovered(true)
          gl.domElement.style.cursor = "auto"
        }}
        onPointerLeave={() => {
          if (isWorkingMode || !interactionActive) return
          setHovered(false)
          gl.domElement.style.cursor = "auto"
        }}
        visible={false}
      >
        <boxGeometry args={[0.92, 1.25, 0.88]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {isNearChair && !isWorkingMode && (
        <Html position={[0, 1.18, 0.18]} center>
          <div className="bg-gradient-to-r from-slate-900/90 to-zinc-900/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap backdrop-blur-md border border-white/20 shadow-lg">
            Press [E] to sit and work
          </div>
        </Html>
      )}

      {isWorkingMode && <WorkingModeOverlay />}
    </group>
  )
}

function WorkingModeOverlay() {
  return (
    <Html fullscreen>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/20" />

        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div className="text-white/65 text-xs tracking-[0.35em] uppercase">
            Working Mode
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/10">
            Press [E] to get up
          </div>
        </div>
      </div>
    </Html>
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
