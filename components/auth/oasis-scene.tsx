"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float } from "@react-three/drei"
import { Suspense, useRef, useMemo } from "react"
import type { Group, Mesh } from "three"

// Floating particles for ambiance
function FloatingParticles() {
  const particlesRef = useRef<Group>(null)
  const particleCount = 20

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < particleCount; i++) {
      temp.push({
        position: [(Math.random() - 0.5) * 8, Math.random() * 4 + 1, (Math.random() - 0.5) * 8],
        scale: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.02 + 0.01,
      })
    }
    return temp
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const particle = particles[i]
        child.position.y += Math.sin(state.clock.elapsedTime * particle.speed + i) * 0.01
        child.rotation.z += 0.01
      })
    }
  })

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position as [number, number, number]} scale={particle.scale}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#68D391" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// Main oasis island
function OasisIsland() {
  const islandRef = useRef<Group>(null)
  const waterRef = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (islandRef.current) {
      islandRef.current.rotation.y = Math.sin(t * 0.3) * 0.1
      islandRef.current.position.y = Math.sin(t * 0.8) * 0.1
    }
    if (waterRef.current) {
      waterRef.current.position.y = Math.sin(t * 1.2) * 0.05 - 0.3
    }
  })

  return (
    <group ref={islandRef}>
      {/* Base island */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.6, 32]} />
        <meshStandardMaterial color="#D69E2E" />
      </mesh>

      {/* Water pool */}
      <mesh ref={waterRef} position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#4FD1C5" transparent opacity={0.8} />
      </mesh>

      {/* Palm tree trunk */}
      <mesh position={[-0.8, 0.3, 0.5]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Palm fronds */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
        <group position={[-0.7, 0.9, 0.6]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[Math.cos((i * Math.PI * 2) / 5) * 0.4, 0.1, Math.sin((i * Math.PI * 2) / 5) * 0.4]}
              rotation={[0, (i * Math.PI * 2) / 5, Math.PI / 6]}
            >
              <boxGeometry args={[0.6, 0.02, 0.15]} />
              <meshStandardMaterial color="#68D391" />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Small plants */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.1}>
        <mesh position={[0.6, -0.1, -0.3]}>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshStandardMaterial color="#48BB78" />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.15}>
        <mesh position={[0.3, -0.1, 0.8]}>
          <coneGeometry args={[0.12, 0.3, 8]} />
          <meshStandardMaterial color="#38A169" />
        </mesh>
      </Float>

      <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.12}>
        <mesh position={[-0.4, -0.1, -0.7]}>
          <coneGeometry args={[0.18, 0.35, 8]} />
          <meshStandardMaterial color="#68D391" />
        </mesh>
      </Float>

      {/* Decorative rocks */}
      <mesh position={[1.0, -0.2, 0.2]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#A0AEC0" />
      </mesh>
      <mesh position={[0.8, -0.25, -0.5]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#CBD5E0" />
      </mesh>
    </group>
  )
}

export default function OasisScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 3]} intensity={0.8} color="#FFF8DC" />
        <pointLight position={[0, 2, 0]} intensity={0.3} color="#4FD1C5" />

        <Suspense fallback={null}>
          <OasisIsland />
          <FloatingParticles />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  )
}
