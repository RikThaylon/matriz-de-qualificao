import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { OperatorData, useDigitalTwinStore } from '../../store/digitalTwinStore'

interface OperatorAvatar3DProps {
  operator: OperatorData
}

export function OperatorAvatar3D({ operator }: OperatorAvatar3DProps) {
  const avatarGroupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const headGroupRef = useRef<THREE.Group>(null)

  const selectedOperatorId = useDigitalTwinStore((s) => s.selectedOperatorId)
  const setSelectedOperator = useDigitalTwinStore((s) => s.setSelectedOperator)
  const updateOperatorPosition = useDigitalTwinStore((s) => s.updateOperatorPosition)

  const isSelected = selectedOperatorId === operator.id

  useFrame((_, delta) => {
    if (!avatarGroupRef.current) return

    const currentPos = avatarGroupRef.current.position
    const targetPos = new THREE.Vector3(...operator.targetPosition)

    // Calculate distance to target
    const distSq = currentPos.distanceToSquared(targetPos)

    if (distSq > 0.05) {
      // Operator is walking: interpolate towards target position
      const walkSpeed = 3.5 * delta
      currentPos.lerp(targetPos, Math.min(walkSpeed, 1.0))

      // Face direction of movement
      const dir = targetPos.clone().sub(currentPos).normalize()
      if (dir.lengthSq() > 0.001) {
        const targetAngle = Math.atan2(dir.x, dir.z)
        avatarGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          avatarGroupRef.current.rotation.y,
          targetAngle,
          0.15
        )
      }

      // Walking leg & arm swing animations
      const time = Date.now() * 0.008
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time) * 0.5
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(time) * 0.5
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(time) * 0.4
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time) * 0.4

      // Sync position back to store
      updateOperatorPosition(operator.id, [currentPos.x, currentPos.y, currentPos.z])
    } else {
      // Idle breathing / Operating micro animation
      const time = Date.now() * 0.003
      if (headGroupRef.current) {
        headGroupRef.current.position.y = 1.6 + Math.sin(time * 2) * 0.02
      }

      if (operator.status === 'operating') {
        // Operating working motion (moving hands)
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.6 + Math.sin(time * 4) * 0.15
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.5 + Math.cos(time * 4) * 0.15
      } else {
        // Idle pose reset
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      }
    }
  })

  return (
    <group
      ref={avatarGroupRef}
      position={operator.position}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedOperator(operator.id)
      }}
    >
      {/* Operator Selection Glow Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.7, isSelected ? 0.95 : 0.8, 32]} />
        <meshBasicMaterial
          color={operator.color}
          transparent
          opacity={isSelected ? 0.9 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Legs (Lower Body) */}
      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.2, 0.4, 0]} castShadow>
        <boxGeometry args={[0.18, 0.8, 0.2]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>
      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.2, 0.4, 0]} castShadow>
        <boxGeometry args={[0.18, 0.8, 0.2]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>

      {/* Torso (PPE Uniform Jacket) */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.65, 0.7, 0.35]} />
        <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* High-Visibility Safety Vest Stripes */}
      <mesh position={[0, 1.2, 0.18]}>
        <planeGeometry args={[0.55, 0.4]} />
        <meshStandardMaterial
          color={operator.color}
          emissive={operator.color}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.42, 1.15, 0]} castShadow>
        <boxGeometry args={[0.16, 0.65, 0.18]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.42, 1.15, 0]} castShadow>
        <boxGeometry args={[0.16, 0.65, 0.18]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>

      {/* Head & PPE Helmet Group */}
      <group ref={headGroupRef} position={[0, 1.6, 0]}>
        {/* Head Skin */}
        <mesh castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.7} />
        </mesh>
        {/* PPE Safety Helmet */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={operator.color} metalness={0.5} roughness={0.2} />
        </mesh>
        {/* Helmet Brim */}
        <mesh position={[0, 0.08, 0.06]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 16]} />
          <meshStandardMaterial color={operator.color} metalness={0.5} />
        </mesh>
        {/* Safety Visor */}
        <mesh position={[0, 0.02, 0.16]}>
          <boxGeometry args={[0.26, 0.08, 0.05]} />
          <meshPhysicalMaterial
            color="#00F3FF"
            transmission={0.9}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Holographic Name Tag Floating Above Operator */}
      <group position={[0, 2.3, 0]}>
        <mesh>
          <planeGeometry args={[1.6, 0.4]} />
          <meshBasicMaterial color="#0A0F17" transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}
