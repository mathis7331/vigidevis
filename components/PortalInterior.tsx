"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PortalInteriorProps {
  visible?: boolean;
}

export function PortalInterior({ visible = true }: PortalInteriorProps) {
  const ringsRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);
  const silhouetteRef = useRef<THREE.Group>(null);

  // Create rings geometry
  const ringsGeometry = useMemo(() => {
    const geometries: THREE.RingGeometry[] = [];
    for (let i = 0; i < 3; i++) {
      const innerRadius = 0.8 + i * 0.3;
      const outerRadius = innerRadius + 0.15;
      geometries.push(new THREE.RingGeometry(innerRadius, outerRadius, 64));
    }
    return geometries;
  }, []);

  // Create stars
  const [starPositions, starSizes] = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    const sizes = new Float32Array(2000);

    for (let i = 0; i < 2000; i++) {
      const radius = 1.5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.5;

      positions[i * 3] = Math.cos(theta) * Math.cos(phi) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * radius;
      positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius;

      sizes[i] = Math.random() * 0.02 + 0.005;
    }

    return [positions, sizes];
  }, []);

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();

    // Rotate rings
    if (ringsRef.current) {
      ringsRef.current.rotation.z = elapsedTime * 0.1;
    }

    // Move stars towards camera
    if (starsRef.current) {
      const positions = starsRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const z = positions.getZ(i);
        positions.setZ(i, z - elapsedTime * 0.01);
        if (z < -4) {
          positions.setZ(i, 3);
        }
      }
      positions.needsUpdate = true;
    }
  });

  // Simple silhouette geometries
  const silhouetteGeometries = useMemo(() => {
    return {
      head: new THREE.SphereGeometry(0.15, 16, 16),
      torso: new THREE.BoxGeometry(0.3, 0.5, 0.2),
      leg1: new THREE.BoxGeometry(0.15, 0.4, 0.15),
      leg2: new THREE.BoxGeometry(0.15, 0.4, 0.15),
    };
  }, []);

  if (!visible) return null;

  return (
    <group>
      {/* Rings */}
      <group ref={ringsRef} position={[0, 0, -2]}>
        {ringsGeometry.map((geometry, i) => (
          <mesh key={i} geometry={geometry} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color={new THREE.Color(0x888888)}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[starSizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          sizeAttenuation={true}
          color="#ffffff"
          transparent
          opacity={0.8}
        />
      </points>

      {/* Silhouette */}
      <group ref={silhouetteRef} position={[0, -0.5, -1.5]}>
        {/* Head */}
        <mesh geometry={silhouetteGeometries.head} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Torso */}
        <mesh geometry={silhouetteGeometries.torso} position={[0, 0.05, 0]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Leg 1 */}
        <mesh geometry={silhouetteGeometries.leg1} position={[-0.15, -0.25, 0.1]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Leg 2 */}
        <mesh geometry={silhouetteGeometries.leg2} position={[0.15, -0.25, 0.1]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>

      {/* Rim light on silhouette */}
      <mesh position={[0, -0.5, -1.5]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={new THREE.Color(0xff6b35)}
          emissive={new THREE.Color(0xff6b35)}
          emissiveIntensity={0.3}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
