"use client"

import { Canvas } from '@react-three/fiber'
import { Brain } from '@/components/Brain'

export default function MemoryPalacePage() {
  return (
    <div className="h-screen">
      <Canvas>
        <Brain />
      </Canvas>
    </div>
  )
}