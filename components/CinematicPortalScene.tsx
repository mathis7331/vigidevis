"use client";

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OrbitControls, MeshReflectorMaterial, Environment } from '@react-three/drei';
import { PortalFrame } from './PortalFrame';
import { PortalInterior } from './PortalInterior';
import * as THREE from 'three';

function PortalScene() {
  return (
    <>
      {/* Ambient light (very minimal) */}
      <ambientLight intensity={0.1} />

      {/* Portal frame (the glowing liquid gold border) */}
      <PortalFrame width={4} height={6} thickness={0.2} radius={0.5} />

      {/* Interior scene (visible through portal) */}
      <PortalInterior visible={true} />

      {/* Reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={0.3}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#010103"
          metalness={0.5}
          mirror={0.8}
        />
      </mesh>

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={1}
          luminanceSmoothing={0.9}
          radius={0.7}
          levels={9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function CinematicPortalScene() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#010103' }}
      >
        <Suspense fallback={null}>
          <PortalScene />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
            minDistance={5}
            maxDistance={8}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
