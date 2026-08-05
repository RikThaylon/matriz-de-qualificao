import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MachineData, useDigitalTwinStore } from '../../store/digitalTwinStore'

interface Machine3DProps {
  machine: MachineData
}

// Pre-allocated static shared geometries for zero GC overhead during 60 FPS rendering
const BASE_BOX_GEO = new THREE.BoxGeometry(3.2, 0.8, 2.4)
const RING_GEO = new THREE.RingGeometry(2.2, 2.5, 32)
const CYLINDER_GEO = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16)
const TOWER_CYLINDER_GEO = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16)
const TOWER_LIGHT_GEO = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16)

export function Machine3D({ machine }: Machine3DProps) {
  const meshRef = useRef<THREE.Group>(null)
  const rotorRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const selectedMachineId = useDigitalTwinStore((s) => s.selectedMachineId)
  const draggedOperatorId = useDigitalTwinStore((s) => s.draggedOperatorId)
  const hoveredMachineId = useDigitalTwinStore((s) => s.hoveredMachineId)
  const operators = useDigitalTwinStore((s) => s.operators)
  const setSelectedMachine = useDigitalTwinStore((s) => s.setSelectedMachine)

  const isSelected = selectedMachineId === machine.id
  const isHovered = hoveredMachineId === machine.id

  // Drag compatibility status calculation
  const dragHoverColor = useMemo(() => {
    if (draggedOperatorId && isHovered) {
      const op = operators.find((o) => o.id === draggedOperatorId)
      if (op) {
        const hasSkill = op.skills.some((s) =>
          machine.requiredSkills.some((req) => s.name.includes(req.split(' ')[0]))
        )
        const hasExpired = op.skills.some((s) => s.expired)
        if (hasSkill && !hasExpired) return '#00FF9D'
        if (hasSkill || !hasExpired) return '#FFB800'
        return '#FF2A6D'
      }
    }
    return null
  }, [draggedOperatorId, isHovered, operators, machine.requiredSkills])

  const stateColors: Record<string, string> = {
    apto: '#00FF9D',
    atencao: '#FFB800',
    bloqueado: '#FF2A6D',
    parada: '#FF2A6D',
    vazio: '#64748B',
  }
  const currentColor = dragHoverColor || stateColors[machine.state] || '#00F3FF'

  // Operational animation loop
  useFrame((_, delta) => {
    if (rotorRef.current && machine.state === 'apto' && machine.operatorId) {
      rotorRef.current.rotation.y += delta * 3.5
    }
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        isSelected || dragHoverColor ? 3.0 : 1.2,
        0.1
      )
    }
  })

  return (
    <group
      ref={meshRef}
      position={machine.position}
      rotation={[0, machine.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedMachine(machine.id)
      }}
    >
      {/* Selection / Drag Hover Ring */}
      <mesh geometry={RING_GEO} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <meshBasicMaterial
          color={currentColor}
          transparent
          opacity={isSelected ? 0.9 : isHovered ? 0.7 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Machine Base Platform */}
      <mesh geometry={BASE_BOX_GEO} position={[0, 0.4, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Machine Body Structure */}
      {machine.type === 'Usinagem' && (
        <group position={[0, 1.4, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.6, 1.2, 1.8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0.91]}>
            <planeGeometry args={[1.8, 0.8]} />
            <meshPhysicalMaterial
              color="#00F3FF"
              transmission={0.85}
              opacity={1}
              transparent
              roughness={0.1}
              ior={1.5}
            />
          </mesh>
          <mesh ref={rotorRef} geometry={CYLINDER_GEO} position={[0, 0.2, 0]}>
            <meshStandardMaterial color={currentColor} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}

      {machine.type === 'Conformação' && (
        <group position={[0, 1.8, 0]}>
          {[-1, 1].map((x) =>
            [-0.6, 0.6].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0, z]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 2.0, 16]} />
                <meshStandardMaterial color="#475569" metalness={0.9} />
              </mesh>
            ))
          )}
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[2.8, 0.6, 1.8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>
          <mesh ref={rotorRef} position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 1.0, 32]} />
            <meshStandardMaterial color={currentColor} metalness={0.9} />
          </mesh>
        </group>
      )}

      {machine.type === 'Robotica' && (
        <group position={[0, 0.8, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.8, 0.8, 32]} />
            <meshStandardMaterial color="#0F172A" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.1, 0]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 1.0, 0.3]} />
            <meshStandardMaterial color="#FFB800" metalness={0.7} />
          </mesh>
          <mesh ref={rotorRef} position={[0, 1.6, 0.4]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={currentColor} emissive={currentColor} emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {machine.type === 'Expedição' && (
        <group position={[0, 1.0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.0, 0.4, 1.6]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          {[-1.0, -0.5, 0, 0.5, 1.0].map((x, i) => (
            <mesh key={i} position={[x, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} />
            </mesh>
          ))}
        </group>
      )}

      {machine.type === 'Inspeção' && (
        <group position={[0, 1.2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.6, 1.8]} />
            <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <torusGeometry args={[0.9, 0.08, 16, 32, Math.PI]} />
            <meshStandardMaterial color="#00F3FF" metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* Industrial Status Tower */}
      <group position={[1.4, 2.6, 0.8]}>
        <mesh geometry={TOWER_CYLINDER_GEO}>
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        <mesh geometry={TOWER_LIGHT_GEO} position={[0, 0.6, 0]}>
          <meshStandardMaterial
            color={currentColor}
            emissive={currentColor}
            emissiveIntensity={machine.state === 'parada' ? 2.5 : 1.2}
          />
        </mesh>
        <pointLight ref={lightRef} position={[0, 0.6, 0]} color={currentColor} distance={6} />
      </group>
    </group>
  )
}
