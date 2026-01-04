"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MoltenMetalVertexShader, MoltenMetalFragmentShader, MoltenMetalUniforms } from './shaders/MoltenMetalShader';

// Custom ShaderMaterial
class MoltenMetalMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: MoltenMetalVertexShader,
      fragmentShader: MoltenMetalFragmentShader,
      uniforms: { ...MoltenMetalUniforms },
    });
  }

  get time() {
    return this.uniforms.uTime.value;
  }

  set time(v) {
    this.uniforms.uTime.value = v;
  }
}

extend({ MoltenMetalMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      moltenMetalMaterial: any;
    }
  }
}

interface PortalFrameProps {
  width?: number;
  height?: number;
  thickness?: number;
  radius?: number;
}

export function PortalFrame({ width = 4, height = 6, thickness = 0.2, radius = 0.5 }: PortalFrameProps) {
  const materialRef = useRef<MoltenMetalMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Create rounded rectangular tube geometry
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = width / 2 - radius;
    const h = height / 2 - radius;

    // Create rounded rectangle shape
    shape.moveTo(-w, -h + radius);
    shape.lineTo(-w, h - radius);
    shape.quadraticCurveTo(-w, h, -w + radius, h);
    shape.lineTo(w - radius, h);
    shape.quadraticCurveTo(w, h, w, h - radius);
    shape.lineTo(w, -h + radius);
    shape.quadraticCurveTo(w, -h, w - radius, -h);
    shape.lineTo(-w + radius, -h);
    shape.quadraticCurveTo(-w, -h, -w, -h + radius);
    shape.closePath();

    // Create rounded rectangle hole (inner)
    const holeWidth = width - thickness * 2;
    const holeHeight = height - thickness * 2;
    const holeW = holeWidth / 2 - radius;
    const holeH = holeHeight / 2 - radius;

    const hole = new THREE.Path();
    hole.moveTo(-holeW, -holeH + radius);
    hole.lineTo(-holeW, holeH - radius);
    hole.quadraticCurveTo(-holeW, holeH, -holeW + radius, holeH);
    hole.lineTo(holeW - radius, holeH);
    hole.quadraticCurveTo(holeW, holeH, holeW, holeH - radius);
    hole.lineTo(holeW, -holeH + radius);
    hole.quadraticCurveTo(holeW, -holeH, holeW - radius, -holeH);
    hole.lineTo(-holeW + radius, -holeH);
    hole.quadraticCurveTo(-holeW, -holeH, -holeW, -holeH + radius);
    hole.closePath();

    shape.holes.push(hole);

    // Extrude along Z to create depth
    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 8,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [width, height, thickness, radius]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.time = time;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <moltenMetalMaterial ref={materialRef} />
    </mesh>
  );
}
