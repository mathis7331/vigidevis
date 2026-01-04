import * as THREE from 'three';

// Fragment shader for soft star sprites
export const StarSpriteFragmentShader = `
uniform float uTime;

varying vec3 vColor;
varying float vSize;

void main() {
  // Create soft circular gradient (sprite effect)
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Soft falloff - no hard edges
  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  
  // Add slight pulsing
  float pulse = sin(uTime * 2.0 + vSize * 10.0) * 0.1 + 0.9;
  alpha *= pulse;
  
  // Color with slight variation
  vec3 starColor = vColor;
  starColor += vec3(0.1, 0.1, 0.15) * sin(uTime + vSize * 5.0);
  
  gl_FragColor = vec4(starColor, alpha);
}
`;

export const StarSpriteVertexShader = `
attribute vec3 color;
attribute float size;

varying vec3 vColor;
varying float vSize;

void main() {
  vColor = color;
  vSize = size;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

