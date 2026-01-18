import * as THREE from 'three';

// Simplex Noise 3D implementation
const simplexNoise3D = `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ));
}
`;

export const MoltenMetalVertexShader = `
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;
varying vec3 vPosition;

uniform float uTime;
uniform float uFlowSpeed;
uniform float uDisplacementStrength;

${simplexNoise3D}

void main() {
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  
  // Create ORGANIC, FLOWING displacement - like molten lava
  vec3 pos = position;
  
  // Multi-octave noise for deep, slow, organic flow
  // Different scales create depth and complexity
  float noise1 = snoise(pos * 0.25 + vec3(uTime * uFlowSpeed * 0.3, uTime * uFlowSpeed * 0.4, uTime * uFlowSpeed * 0.2));
  float noise2 = snoise(pos * 0.5 + vec3(uTime * uFlowSpeed * 0.5, uTime * uFlowSpeed * 0.6, uTime * uFlowSpeed * 0.3)) * 0.6;
  float noise3 = snoise(pos * 1.0 + vec3(uTime * uFlowSpeed * 0.4, 0.0, uTime * uFlowSpeed * 0.5)) * 0.3;
  float noise4 = snoise(pos * 2.0 + vec3(0.0, uTime * uFlowSpeed * 0.2, uTime * uFlowSpeed * 0.4)) * 0.15;
  
  // Combine for organic, flowing pattern
  float noise = (noise1 + noise2 + noise3 + noise4) / 2.05;
  
  // Add slower, larger-scale turbulence for bulging effect
  float turbulence = snoise(pos * 0.15 + vec3(uTime * uFlowSpeed * 0.2, uTime * uFlowSpeed * 0.25, uTime * uFlowSpeed * 0.15));
  noise = noise * 0.75 + turbulence * 0.25;
  
  vNoise = noise;
  
  // ORGANIC displacement - bulges and curves, no straight lines
  float displacement = noise * uDisplacementStrength;
  
  // Extra bulge on surface for thickness perception
  float bulge = abs(noise) * uDisplacementStrength * 0.6;
  displacement += bulge;
  
  // Displace along normals with some organic variation
  vec3 displacementDir = normalize(normal + vec3(noise * 0.2, noise * 0.15, noise * 0.25));
  pos += displacementDir * displacement;
  
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const MoltenMetalFragmentShader = `
uniform vec3 uColorBase;
uniform vec3 uColorCopper;
uniform vec3 uColorGold;
uniform vec3 uColorHot;
uniform float uTime;
uniform float uFlowSpeed;
uniform float uFresnelPower;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;
varying vec3 vPosition;

${simplexNoise3D}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // INTENSE Fresnel effect - edges are white hot
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);
  fresnel = smoothstep(0.0, 1.0, fresnel);
  
  // Additional noise for surface variation (slower)
  vec3 flowNoise = vec3(
    snoise(vWorldPosition * 0.18 + vec3(uTime * uFlowSpeed * 0.25, 0.0, 0.0)),
    snoise(vWorldPosition * 0.18 + vec3(0.0, uTime * uFlowSpeed * 0.3, 0.0)),
    snoise(vWorldPosition * 0.18 + vec3(0.0, 0.0, uTime * uFlowSpeed * 0.28))
  );
  
  // COLOR PALETTE: Dark Bronze -> Copper -> Gold -> White Hot
  // Base: Very dark chocolate brown (almost black)
  vec3 darkBase = vec3(0.08, 0.06, 0.04); // Dark chocolate
  
  // Mid-tone: Dark bronze
  vec3 darkBronze = vec3(0.18, 0.12, 0.08);
  
  // Copper: Burnt orange
  vec3 copper = vec3(0.7, 0.35, 0.15); // Burnt orange
  
  // Gold: Warm yellow
  vec3 gold = vec3(0.95, 0.75, 0.35); // Warm gold
  
  // Hot: Blinding white/yellow
  vec3 hot = vec3(1.0, 0.95, 0.85); // White hot
  
  // Mix based on noise and fresnel
  float noiseMix = (vNoise + 1.0) * 0.5;
  noiseMix = pow(noiseMix, 1.3); // Keep darker in recesses
  
  // Start from very dark base
  vec3 baseColor = mix(darkBase, darkBronze, noiseMix * 0.4);
  baseColor = mix(baseColor, copper, noiseMix * 0.3);
  
  // Add subtle flow variation
  baseColor += flowNoise * 0.08;
  
  // FRESNEL GRADIENT: Dark center -> Gold edges -> White hot extreme edges
  float fresnelMix = fresnel;
  
  // At edges: transition to gold
  vec3 edgeColor = mix(baseColor, gold, fresnelMix * 0.8);
  
  // At extreme edges: white hot
  float extremeFresnel = pow(fresnel, 2.5);
  edgeColor = mix(edgeColor, hot, extremeFresnel * 0.9);
  
  // Final color - very dark center, bright edges
  float intensity = mix(0.15, 1.0, fresnel); // Center is VERY dark
  vec3 finalColor = edgeColor * intensity;
  
  // EMISSIVE GLOW on edges (for that molten metal look)
  vec3 emissive = vec3(1.0, 0.85, 0.5) * pow(fresnel, 3.0) * 0.4; // Warm glow
  finalColor += emissive;
  
  // Ensure minimum darkness in center (never pure black)
  finalColor = max(finalColor, vec3(0.05, 0.04, 0.03));
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const MoltenMetalUniforms = {
  uTime: { value: 0 },
  uColorBase: { value: new THREE.Color(0x140a05) }, // Very dark chocolate
  uColorCopper: { value: new THREE.Color(0xb35926) }, // Burnt orange/copper
  uColorGold: { value: new THREE.Color(0xf2bf5e) }, // Warm gold
  uColorHot: { value: new THREE.Color(0xfff4d9) }, // White hot
  uFlowSpeed: { value: 0.2 }, // Slow, organic flow
  uDisplacementStrength: { value: 0.5 }, // Strong organic deformation
  uFresnelPower: { value: 1.5 }, // Smooth but intense fresnel
};
