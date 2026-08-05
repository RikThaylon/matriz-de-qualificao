import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { heatmapEngine } from '../../engine/HeatmapEngine'
import { useDigitalTwinStore } from '../../store/digitalTwinStore'
import { Machine3D } from './Machine3D'
import { OperatorAvatar3D } from './OperatorAvatar3D'
import { SquadArea3D } from './SquadArea3D'

function CameraController() {
  const controlsRef = useRef<any>(null)
  const cameraMode = useDigitalTwinStore((s) => s.cameraMode)
  const cameraTarget = useDigitalTwinStore((s) => s.cameraTarget)

  useFrame((state) => {
    if (!controlsRef.current) return

    let targetVec = new THREE.Vector3(...cameraTarget)
    let desiredCamPos = new THREE.Vector3()

    if (cameraMode === 'focusMachine') {
      desiredCamPos.set(targetVec.x + 5, targetVec.y + 6, targetVec.z + 8)
    } else if (cameraMode === 'focusOperator') {
      desiredCamPos.set(targetVec.x + 3, targetVec.y + 3, targetVec.z + 5)
    } else {
      // Overview mode
      targetVec.set(0, 0, 2)
      desiredCamPos.set(0, 22, 28)
    }

    // Smooth camera transition
    state.camera.position.lerp(desiredCamPos, 0.05)
    controlsRef.current.target.lerp(targetVec, 0.05)
    controlsRef.current.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={4}
      maxDistance={60}
    />
  )
}

function FactoryFloor() {
  const heatmapMode = useDigitalTwinStore((s) => s.heatmapMode)
  const machines = useDigitalTwinStore((s) => s.machines)
  const operators = useDigitalTwinStore((s) => s.operators)

  // Generate heatmap texture data points
  const points = machines.map((m) => ({
    x: m.position[0],
    z: m.position[2],
    intensity: m.temperature > 50 ? 0.9 : 0.4,
  }))
  const heatmapTexture = heatmapEngine.generateHeatmapTexture(heatmapMode, points)

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Industrial Floor Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 50]} />
        <meshStandardMaterial color="#070C14" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Heatmap Overlay Texture Mesh */}
      {heatmapMode !== 'off' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <planeGeometry args={[60, 50]} />
          <meshBasicMaterial map={heatmapTexture} transparent opacity={0.85} />
        </mesh>
      )}

      {/* Grid Floor Overlay */}
      <gridHelper args={[60, 60, '#00F3FF', '#1E293B']} position={[0, 0.01, 0]} />

      {/* Walking Pathways Paint (Yellow Cyber Lines) */}
      {[
        { pos: [0, 0.03, 5], args: [40, 2] },
        { pos: [0, 0.03, -5], args: [40, 2] },
        { pos: [-10, 0.03, 0], args: [2, 20] },
        { pos: [0, 0.03, 0], args: [2, 20] },
        { pos: [10, 0.03, 0], args: [2, 20] },
      ].map((path, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={path.pos as [number, number, number]}>
          <planeGeometry args={path.args as [number, number]} />
          <meshBasicMaterial color="#FFB800" transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  )
}

export function FactoryCanvas() {
  const machines = useDigitalTwinStore((s) => s.machines)
  const operators = useDigitalTwinStore((s) => s.operators)
  const setSelectedMachine = useDigitalTwinStore((s) => s.setSelectedMachine)
  const setSelectedOperator = useDigitalTwinStore((s) => s.setSelectedOperator)

  return (
    <div
      className="absolute inset-0 w-full h-full bg-[#05070A]"
      onClick={() => {
        setSelectedMachine(null)
        setSelectedOperator(null)
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 22, 28], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#05070A']} />
        <fog attach="fog" args={['#05070A', 30, 70]} />

        {/* Industrial Ambient & Directional Lighting */}
        <ambientLight intensity={0.4} color="#7EE7FC" />
        <directionalLight
          position={[20, 30, 20]}
          intensity={1.2}
          color="#FFFFFF"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={80}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <pointLight position={[-15, 8, -10]} intensity={1.5} color="#00F3FF" distance={25} />
        <pointLight position={[15, 8, -10]} intensity={1.5} color="#FFB800" distance={25} />

        {/* Interactive Controls & Camera lerping */}
        <CameraController />

        {/* 3D Scene Components */}
        <FactoryFloor />
        <SquadArea3D />

        {machines.map((machine) => (
          <Machine3D key={machine.id} machine={machine} />
        ))}

        {operators.map((operator) => (
          <OperatorAvatar3D key={operator.id} operator={operator} />
        ))}
      </Canvas>
    </div>
  )
}
