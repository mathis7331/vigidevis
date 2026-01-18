"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * Silhouette assise - Personnage contemplatif
 */
function SeatedSilhouette() {
  const groupRef = useRef<THREE.Group>(null);

  // Géométries pour la silhouette assise
  const geometries = useMemo(() => {
    return {
      head: new THREE.SphereGeometry(0.12, 16, 16),
      torso: new THREE.CylinderGeometry(0.12, 0.14, 0.45, 16),
      upperArm1: new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12),
      upperArm2: new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12),
      lowerArm1: new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12),
      lowerArm2: new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12),
      thigh1: new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12),
      thigh2: new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12),
      shin1: new THREE.CylinderGeometry(0.07, 0.07, 0.35, 12),
      shin2: new THREE.CylinderGeometry(0.07, 0.07, 0.35, 12),
    };
  }, []);

  return (
    <group ref={groupRef} position={[0, -0.8, 1.5]} rotation={[0, 0, 0]}>
      {/* Tête */}
      <mesh geometry={geometries.head} position={[0, 0.5, 0]}>
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Torse (incliné vers l'arrière légèrement) */}
      <mesh
        geometry={geometries.torso}
        position={[0, 0.15, 0]}
        rotation={[0.2, 0, 0]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Bras gauche */}
      <mesh
        geometry={geometries.upperArm1}
        position={[-0.15, 0.25, 0]}
        rotation={[0.3, 0, -0.5]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh
        geometry={geometries.lowerArm1}
        position={[-0.25, -0.1, 0.1]}
        rotation={[1.2, 0, -0.5]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Bras droit */}
      <mesh
        geometry={geometries.upperArm2}
        position={[0.15, 0.25, 0]}
        rotation={[0.3, 0, 0.5]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh
        geometry={geometries.lowerArm2}
        position={[0.25, -0.1, 0.1]}
        rotation={[1.2, 0, 0.5]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Cuisse gauche */}
      <mesh
        geometry={geometries.thigh1}
        position={[-0.1, -0.2, 0]}
        rotation={[0.3, 0, 0]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Tibia gauche */}
      <mesh
        geometry={geometries.shin1}
        position={[-0.1, -0.55, 0]}
        rotation={[0.5, 0, 0]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Cuisse droite */}
      <mesh
        geometry={geometries.thigh2}
        position={[0.1, -0.2, 0]}
        rotation={[0.3, 0, 0]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Tibia droit */}
      <mesh
        geometry={geometries.shin2}
        position={[0.1, -0.55, 0]}
        rotation={[0.5, 0, 0]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
}

/**
 * Fond cosmique - Grande sphère avec texture d'espace
 */
function CosmicBackground() {
  // Utilise la texture stars.jpg (Suspense gère le chargement)
  const starsTexture = useTexture("/stars.jpg");

  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial
        map={starsTexture}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/**
 * Galaxie/Nébuleuse centrale - Élément cosmique lumineux et rotatif
 */
function CentralNebula() {
  const nebulaRef = useRef<THREE.Mesh>(null);

  // Animation de rotation lente
  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.z += 0.001;
    }
  });

  // Créer une texture procédurale pour la nébuleuse
  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Gradient radial pour la nébuleuse
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, "rgba(255, 100, 150, 1)"); // Rose central
    gradient.addColorStop(0.3, "rgba(150, 50, 255, 0.8)"); // Violet
    gradient.addColorStop(0.6, "rgba(255, 150, 50, 0.6)"); // Orange
    gradient.addColorStop(1, "rgba(50, 100, 255, 0.3)"); // Bleu externe

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Ajouter des détails avec des cercles
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 50 + 10;
      const opacity = Math.random() * 0.5 + 0.2;
      ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, ${100 + Math.random() * 150}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <mesh ref={nebulaRef} position={[0, 0, -15]} scale={[8, 8, 0.5]}>
      <planeGeometry args={[4, 4, 32, 32]} />
      <meshBasicMaterial
        map={nebulaTexture}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Scène 3D principale
 */
function PortalSceneContent() {
  return (
    <>
      {/* Brouillard atmosphérique */}
      <fog attach="fog" args={["#0a0a0a", 20, 50]} />

      {/* Lumière ambiante faible */}
      <ambientLight intensity={0.2} />

      {/* Lumières directionnelles depuis la nébuleuse centrale */}
      <pointLight
        position={[0, 2, -12]}
        intensity={1.5}
        color="#ff6496" // Rose
        distance={30}
      />
      <pointLight
        position={[-3, 1, -14]}
        intensity={1}
        color="#9632ff" // Violet
        distance={30}
      />
      <pointLight
        position={[3, 1, -14]}
        intensity={1}
        color="#ff9632" // Orange
        distance={30}
      />
      <pointLight
        position={[0, -1, -16]}
        intensity={0.8}
        color="#6496ff" // Bleu
        distance={30}
      />

      {/* Fond cosmique */}
      <Suspense fallback={null}>
        <CosmicBackground />
      </Suspense>

      {/* Nébuleuse centrale */}
      <Suspense fallback={null}>
        <CentralNebula />
      </Suspense>

      {/* Silhouette assise */}
      <SeatedSilhouette />
    </>
  );
}

/**
 * Composant principal PortalScene
 */
export function PortalScene() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <PortalSceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
