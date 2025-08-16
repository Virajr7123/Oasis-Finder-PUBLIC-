"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { Suspense, useRef } from "react"
import type { Group } from "three"

// A stylized 3D character reading a book, built from primitives to avoid external asset loading issues.
function ReaderPrimitive(props: any) {
  const ref = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = Math.sin(t / 2) * 0.2
      ref.current.position.y = Math.sin(t * 1.2) * 0.06
    }
  })

  const skin = "#E2E8F0" // soft neutral
  const shirt = "#4FD1C5" // brand teal
  const pants = "#2D3748" // charcoal
  const bookCover = "#68D391" // leaf green
  const bookPages = "#FFFFFF"

  return (
    <group ref={ref} {...props}>
      {/* Seat */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[1.6, 0.2, 1.1]} />
        <meshStandardMaterial color={"#FFFFFF"} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.35]} />
        <meshStandardMaterial color={shirt} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.7, 0.02]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.18, -0.25, 0.2]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 24]} />
        <meshStandardMaterial color={pants} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.18, -0.25, 0.2]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 24]} />
        <meshStandardMaterial color={pants} />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.34, 0.25, 0.12]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 20]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.34, 0.25, 0.12]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 20]} />
        <meshStandardMaterial color={shirt} />
      </mesh>

      {/* Book */}
      <group position={[0, 0.2, 0.35]} rotation={[-0.1, 0, 0]}>
        {/* Cover */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.35, 0.03]} />
          <meshStandardMaterial color={bookCover} />
        </mesh>
        {/* Pages */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[0.58, 0.33, 0.02]} />
          <meshStandardMaterial color={bookPages} />
        </mesh>
      </group>
    </group>
  )
}

export default function ReaderScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [1.8, 1.2, 2.3], fov: 50 }}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 8, 3]} intensity={0.8} />
        <Suspense fallback={null}>
          <ReaderPrimitive />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  )
}
