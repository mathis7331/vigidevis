"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Cloud } from '@react-three/drei';

interface PortalInteriorProps {
  visible?: boolean;
}

export function PortalInterior({ visible = true }: PortalInteriorProps) {
  const galaxyRef = useRef<THREE.Points>(null);

  // ==========================================
  // GÉOMÉTRIES DU PERSONNAGE ASSIS
  // ==========================================
  const characterGeometries = useMemo(() => {
    return {
      head: new THREE.SphereGeometry(0.12, 16, 16),
      torso: new THREE.CylinderGeometry(0.15, 0.18, 0.5, 16),
      thigh1: new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12),
      thigh2: new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12),
      shin1: new THREE.CylinderGeometry(0.07, 0.07, 0.35, 12),
      shin2: new THREE.CylinderGeometry(0.07, 0.07, 0.35, 12),
    };
  }, []);

  // ==========================================
  // GALAXIE SPIRALE LOGARITHMIQUE
  // ==========================================
  const galaxyConfig = useMemo(() => {
    const particleCount = 4000;
    const galaxyRadius = 3.5;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Couleurs du gradient radial
    const colorCenter = new THREE.Color(0xffaa33); // Orange/Jaune chaud
    const colorMid = new THREE.Color(0xff00cc);    // Violet/Rose
    const colorOuter = new THREE.Color(0x0055ff);  // Bleu froid profond
    
    for (let i = 0; i < particleCount; i++) {
      // Position radiale
      const radius = Math.random() * galaxyRadius;
      const normalizedRadius = radius / galaxyRadius; // 0 à 1
      
      // Spirale logarithmique (ALGORITHME IMPOSÉ)
      const spinAngle = radius * 5.0;
      const branchAngle = (i % 3) * ((2 * Math.PI) / 3); // 3 bras
      
      // Randomness contrôlé pour le volume
      const randomX = (Math.random() - 0.5) * 0.3;
      const randomY = (Math.random() - 0.5) * 0.2; // Légère hauteur
      const randomZ = (Math.random() - 0.5) * 0.3;
      
      // Position finale
      const angle = branchAngle + spinAngle;
      
      positions[i * 3] = Math.cos(angle) * radius + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(angle) * radius + randomZ;
      
      // Couleur basée sur le radius (GRADIENT RADIAL OBLIGATOIRE)
      let color: THREE.Color;
      if (normalizedRadius < 0.33) {
        // Centre → Orange
        color = colorCenter.clone().lerp(colorMid, normalizedRadius * 3);
      } else if (normalizedRadius < 0.66) {
        // Zone intermédiaire → Violet
        const t = (normalizedRadius - 0.33) * 3;
        color = colorMid.clone().lerp(colorOuter, t);
      } else {
        // Extérieur → Bleu
        color = colorOuter.clone();
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors, particleCount };
  }, []);

  // ==========================================
  // ANIMATION - Rotation lente sur axe Y
  // ==========================================
  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();

    // Rotation lente de toute la galaxie (axe Y prioritaire)
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y = elapsedTime * 0.05;
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* ========================================== */}
      {/* FOND NÉBULEUX MULTI-COUCHES */}
      {/* ========================================== */}
      
      {/* Couche 1 - Profondeur lointaine (violet très sombre) */}
      <Cloud
        position={[0, 0, -5]}
        speed={0.1}
        opacity={0.3}
        segments={20}
        bounds={[10, 8, 4]}
        color="#1a0a33"
      />
      
      {/* Couche 2 - Milieu-profondeur (violet sombre + bleu nuit) */}
      <Cloud
        position={[0, 0, -4]}
        speed={0.15}
        opacity={0.25}
        segments={16}
        bounds={[8, 6, 3]}
        color="#0d0a2a"
      />
      
      {/* Couche 3 - Proche-profondeur (bleu nuit profond) */}
      <Cloud
        position={[0, 0, -3]}
        speed={0.2}
        opacity={0.2}
        segments={12}
        bounds={[6, 5, 2]}
        color="#050011"
      />
      
      {/* Couche 4 - Couche subtile (bleu nuit très profond) */}
      <Cloud
        position={[0, 0, -2.5]}
        speed={0.25}
        opacity={0.15}
        segments={10}
        bounds={[5, 4, 1.5]}
        color="#030008"
      />

      {/* ========================================== */}
      {/* GALAXIE SPIRALE LOGARITHMIQUE */}
      {/* ========================================== */}
      <points ref={galaxyRef} position={[0, 0, -2]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[galaxyConfig.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[galaxyConfig.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          sizeAttenuation={true}
          vertexColors={true}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>

      {/* ========================================== */}
      {/* RIM LIGHT - Éclairage arrière pour silhouette */}
      {/* ========================================== */}
      <spotLight
        position={[0, -0.3, -2.8]}
        angle={Math.PI / 4}
        penumbra={0.6}
        intensity={2.5}
        color="#ff8c42"
        castShadow={false}
      />

      {/* ========================================== */}
      {/* PERSONNAGE ASSIS - SILHOUETTE NOIRE CONTEMPLATIVE */}
      {/* ========================================== */}
      <group position={[0, -0.8, -1.5]} rotation={[0, 0, -0.1]}>
        {/* Tête */}
        <mesh geometry={characterGeometries.head} position={[0, 0.5, 0]}>
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Torse (incliné vers l'arrière légèrement) */}
        <mesh
          geometry={characterGeometries.torso}
          position={[0, 0.15, 0]}
          rotation={[0.2, 0, 0]}
        >
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Cuisse 1 */}
        <mesh
          geometry={characterGeometries.thigh1}
          position={[-0.1, -0.2, 0]}
          rotation={[0.3, 0, 0]}
        >
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Cuisse 2 */}
        <mesh
          geometry={characterGeometries.thigh2}
          position={[0.1, -0.2, 0]}
          rotation={[0.3, 0, 0]}
        >
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Tibia 1 */}
        <mesh
          geometry={characterGeometries.shin1}
          position={[-0.1, -0.55, 0]}
          rotation={[0.5, 0, 0]}
        >
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Tibia 2 */}
        <mesh
          geometry={characterGeometries.shin2}
          position={[0.1, -0.55, 0]}
          rotation={[0.5, 0, 0]}
        >
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
    </group>
  );
}
