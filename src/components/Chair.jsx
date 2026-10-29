import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { COLORS, MATERIALS, SIZES } from '../data/config.js'
import { useConfig } from '../store/useConfig.js'

/**
 * Lounge chair built procedurally from primitives + PBR materials — no
 * external model files, so the demo always loads. Parts (for the
 * exploded view + per-part rules):
 *  - seat cushion, back (frame + cushion), armrests (optional),
 *    base frame, legs (wood / steel / sled).
 * The upholstery material + color apply to all cushions at once; the
 * base frame follows the leg finish (walnut frame with walnut legs,
 * black steel frame otherwise).
 */
export default function Chair() {
  const material = useConfig((s) => s.material)
  const color = useConfig((s) => s.color)
  const legs = useConfig((s) => s.legs)
  const arms = useConfig((s) => s.arms)
  const size = useConfig((s) => s.size)
  const exploded = useConfig((s) => s.exploded)

  const f = useRef(0)
  const seatRef = useRef(null)
  const backRef = useRef(null)
  const armLRef = useRef(null)
  const armRRef = useRef(null)
  const legsRef = useRef(null)

  const mat = MATERIALS[material]
  const hex = COLORS.find((c) => c.id === color)?.hex ?? '#E8E0D0'
  const scale = SIZES[size]?.scale ?? 1
  const frameIsWood = legs === 'wood'

  const upholstery = useMemo(
    () => ({
      color: hex,
      roughness: mat.roughness,
      sheen: mat.sheen,
      sheenRoughness: 0.5,
      sheenColor: '#ffffff',
      clearcoat: mat.clearcoat ?? 0,
      clearcoatRoughness: 0.4,
    }),
    [hex, mat],
  )

  useFrame((_, delta) => {
    f.current = THREE.MathUtils.damp(f.current, exploded ? 1 : 0, 6, delta)
    const e = f.current
    if (seatRef.current) seatRef.current.position.y = 0.5 + e * 0.28
    if (backRef.current) {
      backRef.current.position.y = 0.58 + e * 0.5
      backRef.current.position.z = -0.3 - e * 0.18
    }
    if (armLRef.current) armLRef.current.position.x = -0.4 - e * 0.28
    if (armRRef.current) armRRef.current.position.x = 0.4 + e * 0.28
    if (legsRef.current) legsRef.current.position.y = -e * 0.22
  })

  return (
    <group scale={scale}>
      {/* Base frame — stays put in the exploded view. */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.1, 0.62]} />
        {frameIsWood ? (
          <meshStandardMaterial color="#6b4a2f" roughness={0.55} />
        ) : (
          <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.4} />
        )}
      </mesh>

      {/* Seat cushion */}
      <group ref={seatRef} position={[0, 0.5, 0]}>
        <RoundedBox args={[0.72, 0.16, 0.66]} radius={0.06} smoothness={4} castShadow>
          <meshPhysicalMaterial {...upholstery} />
        </RoundedBox>
      </group>

      {/* Back: frame + cushion, reclined slightly */}
      <group ref={backRef} position={[0, 0.58, -0.3]} rotation={[-0.12, 0, 0]}>
        <mesh position={[0, 0.31, 0]} castShadow>
          <boxGeometry args={[0.72, 0.62, 0.1]} />
          {frameIsWood ? (
            <meshStandardMaterial color="#6b4a2f" roughness={0.55} />
          ) : (
            <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.4} />
          )}
        </mesh>
        <RoundedBox args={[0.68, 0.56, 0.16]} radius={0.06} smoothness={4} position={[0, 0.31, 0.08]} castShadow>
          <meshPhysicalMaterial {...upholstery} />
        </RoundedBox>
      </group>

      {/* Armrests (optional) */}
      {arms && (
        <>
          <group ref={armLRef} position={[-0.4, 0, 0]}>
            <mesh position={[0, 0.63, 0]} castShadow>
              <boxGeometry args={[0.08, 0.3, 0.52]} />
              {frameIsWood ? (
                <meshStandardMaterial color="#6b4a2f" roughness={0.55} />
              ) : (
                <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.4} />
              )}
            </mesh>
            <RoundedBox args={[0.14, 0.09, 0.56]} radius={0.04} smoothness={4} position={[0, 0.82, 0]} castShadow>
              <meshPhysicalMaterial {...upholstery} />
            </RoundedBox>
          </group>
          <group ref={armRRef} position={[0.4, 0, 0]}>
            <mesh position={[0, 0.63, 0]} castShadow>
              <boxGeometry args={[0.08, 0.3, 0.52]} />
              {frameIsWood ? (
                <meshStandardMaterial color="#6b4a2f" roughness={0.55} />
              ) : (
                <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.4} />
              )}
            </mesh>
            <RoundedBox args={[0.14, 0.09, 0.56]} radius={0.04} smoothness={4} position={[0, 0.82, 0]} castShadow>
              <meshPhysicalMaterial {...upholstery} />
            </RoundedBox>
          </group>
        </>
      )}

      {/* Legs */}
      <group ref={legsRef}>
        {legs === 'sled' ? (
          <>
            {[-0.32, 0.32].map((x) => (
              <group key={x} position={[x, 0, 0]}>
                <mesh position={[0, 0.025, 0]} castShadow>
                  <boxGeometry args={[0.05, 0.05, 0.6]} />
                  <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.4} />
                </mesh>
                {[-0.26, 0.26].map((z) => (
                  <mesh key={z} position={[0, 0.2, z]} castShadow>
                    <boxGeometry args={[0.05, 0.36, 0.05]} />
                    <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.4} />
                  </mesh>
                ))}
              </group>
            ))}
            {[-0.26, 0.26].map((z) => (
              <mesh key={`bar-${z}`} position={[0, 0.025, z]} castShadow>
                <boxGeometry args={[0.64, 0.05, 0.05]} />
                <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.4} />
              </mesh>
            ))}
          </>
        ) : (
          <>
            {[
              [-0.3, -0.26],
              [0.3, -0.26],
              [-0.3, 0.26],
              [0.3, 0.26],
            ].map(([x, z]) => (
              <mesh key={`${x}-${z}`} position={[x, 0.18, z]} castShadow>
                <cylinderGeometry
                  args={legs === 'wood' ? [0.038, 0.024, 0.36, 12] : [0.025, 0.025, 0.36, 12]}
                />
                {legs === 'wood' ? (
                  <meshStandardMaterial color="#6b4a2f" roughness={0.55} />
                ) : (
                  <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.4} />
                )}
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  )
}
