// src/components/Brain.tsx
"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

export function Brain() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <Stars />
      <OrbitControls />
    </>
  )
}