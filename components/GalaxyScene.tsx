"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function GalaxyScene() {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsRef2 = useRef<THREE.Points>(null);

  // Generate galaxy points
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    const colors = new Float32Array(5000 * 3);

    for (let i = 0; i < 5000; i++) {
      // Spiral galaxy formation
      const radius = Math.random() * 20 + 5;
      const angle = (i / 5000) * Math.PI * 4; // 2 full spirals
      const branchAngle = (i % 2) * Math.PI * 2;

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;

      positions[i * 3] = Math.cos(angle + branchAngle) * radius + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(angle + branchAngle) * radius + randomZ;

      // Color gradient from center to edges
      const mixedColor = new THREE.Color();
      mixedColor.setHSL(0.6 - radius * 0.02, 0.8, 0.6);

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    return [positions, colors];
  }, []);

  // Generate background stars
  const [starPositions] = useMemo(() => {
    const starPositions = new Float32Array(2000 * 3);

    for (let i = 0; i < 2000; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    return [starPositions];
  }, []);

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();

    if (pointsRef.current) {
      pointsRef.current.rotation.y = elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
    }

    if (pointsRef2.current) {
      pointsRef2.current.rotation.y = -elapsedTime * 0.03;
      pointsRef2.current.rotation.z = Math.cos(elapsedTime * 0.08) * 0.05;
    }
  });

  return (
    <>
      {/* Main galaxy */}
      <Points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          alphaTest={0.001}
          depthWrite={false}
        />
      </Points>

      {/* Secondary galaxy arm */}
      <Points ref={pointsRef2} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          alphaTest={0.001}
          depthWrite={false}
        />
      </Points>

      {/* Background stars */}
      <Points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.005}
          color="#ffffff"
          transparent={true}
          alphaTest={0.001}
          depthWrite={false}
        />
      </Points>

      {/* Central glowing core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#ff6b6b"
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* Glowing halo around core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ff4757"
          transparent={true}
          opacity={0.1}
        />
      </mesh>
    </>
  );
}
