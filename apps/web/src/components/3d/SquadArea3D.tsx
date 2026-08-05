import * as THREE from 'three'

export function SquadArea3D() {
  return (
    <group position={[0, 0, 16]}>
      {/* Squad Area Glowing Platform Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Cyber Glowing Perimeter Lines */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.04, 0]}>
        <ringGeometry args={[8.0, 8.1, 4]} />
        <meshBasicMaterial color="#00F3FF" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Corner Warning Pillars */}
      {[
        [-8, 0, -3],
        [8, 0, -3],
        [-8, 0, 3],
        [8, 0, 3],
      ].map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]}>
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2.0, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          <mesh position={[0, 2.0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#00F3FF" emissive="#00F3FF" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
