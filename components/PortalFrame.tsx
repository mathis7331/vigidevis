"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshDistortMaterial } from '@react-three/drei';

interface PortalFrameProps {
  width?: number;
  height?: number;
  thickness?: number;
  radius?: number;
}

export function PortalFrame({ width = 4, height = 6, thickness = 0.3, radius = 0.5 }: PortalFrameProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Animation optionnelle si besoin
    if (meshRef.current) {
      // On peut ajouter une rotation subtile si nécessaire
    }
  });

  return (
    <mesh ref={meshRef} scale={[1.5, 1, 1]}>
      {/* TorusGeometry = donut épais et organique */}
      <torusGeometry args={[3, 1.5, 128, 128]} />
      
      {/* MeshDistortMaterial = or liquide qui ondule */}
      <MeshDistortMaterial
        color="#CC5500" // Orange brûlé / bronze
        roughness={0.1} // Très brillant (miroir)
        metalness={1} // C'est du métal pur
        distort={0.5} // Force de la déformation liquide
        speed={2} // Vitesse du mouvement organique
      />
    </mesh>
  );
}
