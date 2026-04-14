"use client"

import { useRef, useEffect, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface FirstPersonControlsProps {
  speed?: number
  jumpForce?: number
  playerHeight?: number
  roomBounds?: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
  }
}

export function FirstPersonControls({
  speed = 4,
  jumpForce = 5,
  playerHeight = 1.7,
  roomBounds = { minX: -4.5, maxX: 4.5, minZ: -3.5, maxZ: 3.5 },
}: FirstPersonControlsProps) {
  const { camera, gl } = useThree()
  
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })
  
  const velocity = useRef(new THREE.Vector3())
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"))
  const isLocked = useRef(false)
  const verticalVelocity = useRef(0)
  const isGrounded = useRef(true)
  
  const PI_2 = Math.PI / 2
  const minPolarAngle = -PI_2 * 0.85
  const maxPolarAngle = PI_2 * 0.85

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (!isLocked.current) return

    const movementX = event.movementX || 0
    const movementY = event.movementY || 0

    euler.current.y -= movementX * 0.002
    euler.current.x -= movementY * 0.002
    euler.current.x = Math.max(minPolarAngle, Math.min(maxPolarAngle, euler.current.x))
    
    camera.quaternion.setFromEuler(euler.current)
  }, [camera, minPolarAngle, maxPolarAngle])

  const onPointerlockChange = useCallback(() => {
    isLocked.current = document.pointerLockElement === gl.domElement
  }, [gl])

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        moveState.current.forward = true
        break
      case "KeyS":
      case "ArrowDown":
        moveState.current.backward = true
        break
      case "KeyA":
      case "ArrowLeft":
        moveState.current.left = true
        break
      case "KeyD":
      case "ArrowRight":
        moveState.current.right = true
        break
      case "Space":
        if (isGrounded.current) {
          verticalVelocity.current = jumpForce
          isGrounded.current = false
        }
        break
    }
  }, [jumpForce])

  const onKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        moveState.current.forward = false
        break
      case "KeyS":
      case "ArrowDown":
        moveState.current.backward = false
        break
      case "KeyA":
      case "ArrowLeft":
        moveState.current.left = false
        break
      case "KeyD":
      case "ArrowRight":
        moveState.current.right = false
        break
    }
  }, [])

  const onClick = useCallback(() => {
    // Wrap in try-catch to handle SecurityError when clicking too quickly after exit
    try {
      gl.domElement.requestPointerLock()
    } catch {
      // Ignore pointer lock errors - they happen when clicking too quickly
    }
  }, [gl])

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("pointerlockchange", onPointerlockChange)
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)
    gl.domElement.addEventListener("click", onClick)

    // Set initial camera position and rotation
    camera.position.set(0, playerHeight, 3)
    euler.current.y = Math.PI // Face the desk

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("pointerlockchange", onPointerlockChange)
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("keyup", onKeyUp)
      gl.domElement.removeEventListener("click", onClick)
    }
  }, [camera, gl, onMouseMove, onPointerlockChange, onKeyDown, onKeyUp, onClick, playerHeight])

  useFrame((_, delta) => {
    if (!isLocked.current) return

    // Calculate movement direction
    const direction = new THREE.Vector3()
    const frontVector = new THREE.Vector3(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward))
    const sideVector = new THREE.Vector3(Number(moveState.current.left) - Number(moveState.current.right), 0, 0)
    
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(new THREE.Euler(0, euler.current.y, 0))

    // Apply smooth acceleration/deceleration (inertia)
    const targetVelocity = direction
    velocity.current.lerp(targetVelocity, delta * 10)

    // Apply gravity
    if (!isGrounded.current) {
      verticalVelocity.current -= 15 * delta
    }

    // Update position
    const newX = camera.position.x + velocity.current.x * delta
    const newZ = camera.position.z + velocity.current.z * delta
    let newY = camera.position.y + verticalVelocity.current * delta

    // Ground collision
    if (newY <= playerHeight) {
      newY = playerHeight
      verticalVelocity.current = 0
      isGrounded.current = true
    }

    // Room bounds collision
    camera.position.x = Math.max(roomBounds.minX, Math.min(roomBounds.maxX, newX))
    camera.position.z = Math.max(roomBounds.minZ, Math.min(roomBounds.maxZ, newZ))
    camera.position.y = newY
  })

  return null
}

export function usePointerLockState() {
  const { gl } = useThree()
  const isLocked = useRef(false)

  useEffect(() => {
    const onPointerlockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement
    }
    document.addEventListener("pointerlockchange", onPointerlockChange)
    return () => document.removeEventListener("pointerlockchange", onPointerlockChange)
  }, [gl])

  return isLocked
}
