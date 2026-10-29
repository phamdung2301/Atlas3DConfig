import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js'
import { STUDIOS, VIEWS } from '../data/config.js'
import { useConfig } from '../store/useConfig.js'
import Chair from './Chair.jsx'

/** Camera preset flights: damped toward the goal, cleared on user drag. */
function CameraRig() {
  const viewGoal = useConfig((s) => s.viewGoal)
  const clearViewGoal = useConfig((s) => s.clearViewGoal)
  const { camera, controls } = useThree()
  useFrame((_, delta) => {
    const goal = viewGoal ? VIEWS[viewGoal] : null
    if (!goal) return
    const target = new THREE.Vector3(...goal.pos)
    const look = new THREE.Vector3(...goal.tgt)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, 4, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, 4, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 4, delta)
    if (controls) {
      controls.target.x = THREE.MathUtils.damp(controls.target.x, look.x, 4, delta)
      controls.target.y = THREE.MathUtils.damp(controls.target.y, look.y, 4, delta)
      controls.target.z = THREE.MathUtils.damp(controls.target.z, look.z, 4, delta)
    }
    if (camera.position.distanceTo(target) < 0.01) clearViewGoal()
  })
  return null
}

/** Honest FPS meter: counts real frames, writes to the badge in the DOM. */
function FpsMeter() {
  const frames = useRef(0)
  const last = useRef(performance.now())
  useFrame(() => {
    frames.current += 1
    const now = performance.now()
    if (now - last.current >= 500) {
      const fps = Math.round((frames.current * 1000) / (now - last.current))
      const el = document.getElementById('fps-value')
      if (el) el.textContent = `${fps} FPS`
      frames.current = 0
      last.current = now
    }
  })
  return null
}

/**
 * GLB tester: loads a user-supplied GLB with the real Draco + KTX2
 * pipeline (decoders/transcoders from the standard public paths).
 * The model is centered and scaled to ~1.2 units tall. Load failures
 * throw into GlbErrorBoundary (see App.jsx), which reports them in
 * the panel instead of crashing the app.
 */
function GlbModel({ url }) {
  const gl = useThree((s) => s.gl)
  const gltf = useLoader(
    GLTFLoader,
    url,
    (loader) => {
      const draco = new DRACOLoader()
      draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/')
      loader.setDRACOLoader(draco)
      const ktx2 = new KTX2Loader()
      ktx2.setTranscoderPath('https://unpkg.com/three@0.186.0/examples/jsm/libs/basis/')
      ktx2.detectSupport(gl)
      loader.setKTX2Loader(ktx2)
    },
  )
  const norm = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = 1.2 / maxDim
    return {
      scale,
      position: [-center.x * scale, -box.min.y * scale, -center.z * scale],
    }
  }, [gltf.scene])
  return <primitive object={gltf.scene} scale={norm.scale} position={norm.position} />
}

export default function Scene() {
  const studio = useConfig((s) => s.studio)
  const autoRotate = useConfig((s) => s.autoRotate)
  const glbUrl = useConfig((s) => s.glbUrl)
  const showFps = useConfig((s) => s.showFps)
  const clearViewGoal = useConfig((s) => s.clearViewGoal)
  const studioDef = STUDIOS[studio]

  return (
    <Canvas
      id="atlas-stage"
      shadows
      dpr={[1, 2]}
      camera={{ position: [1.8, 1.2, 2.4], fov: 40 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <color attach="background" args={[studioDef.bg]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={studioDef.floor} roughness={0.9} />
      </mesh>
      <Suspense fallback={null}>
        {glbUrl ? <GlbModel key={glbUrl} url={glbUrl} /> : <Chair />}
      </Suspense>
      <CameraRig />
      {showFps && <FpsMeter />}
      <OrbitControls
        makeDefault
        enableDamping
        minDistance={1.2}
        maxDistance={6}
        maxPolarAngle={Math.PI / 2 - 0.02}
        target={[0, 0.55, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        onStart={clearViewGoal}
      />
    </Canvas>
  )
}
