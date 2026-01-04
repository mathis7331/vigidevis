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

uniform float uTime;
uniform float uFlowSpeed;
uniform float uDisplacementStrength;

${simplexNoise3D}

void main() {
  vNormal = normalize(normalMatrix * normal);
  
  // Create flowing displacement based on noise
  vec3 pos = position;
  vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  
  // Multi-octave noise for organic flow - MORE AGGRESSIVE
  float noise = snoise(pos * 0.3 + vec3(uTime * uFlowSpeed * 0.5, uTime * uFlowSpeed * 0.7, uTime * uFlowSpeed * 0.3));
  noise += snoise(pos * 0.6 + vec3(uTime * uFlowSpeed * 0.4, uTime * uFlowSpeed * 0.5, uTime * uFlowSpeed * 0.2)) * 0.7;
  noise += snoise(pos * 1.2 + vec3(uTime * uFlowSpeed * 0.3, 0.0, uTime * uFlowSpeed * 0.4)) * 0.4;
  noise += snoise(pos * 2.4 + vec3(0.0, uTime * uFlowSpeed * 0.2, uTime * uFlowSpeed * 0.3)) * 0.2;
  
  // Add turbulence for bubbling effect
  float turbulence = snoise(pos * 0.4 + vec3(uTime * uFlowSpeed * 0.6, uTime * uFlowSpeed * 0.8, uTime * uFlowSpeed * 0.5));
  noise = noise * 0.7 + turbulence * 0.3;
  
  vNoise = noise;
  
  // DRAMATIC displacement - make it bubble and bulge
  float displacement = noise * uDisplacementStrength;
  // Add extra bulge on edges
  displacement += abs(noise) * uDisplacementStrength * 0.5;
  
  // Displace along normals AND add some random direction
  vec3 displacementDir = normalize(normal + vec3(noise * 0.3, noise * 0.2, noise * 0.4));
  pos += displacementDir * displacement;
  
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const MoltenMetalFragmentShader = `
uniform vec3 uColorStart;
uniform vec3 uColorEnd;
uniform float uTime;
uniform float uFlowSpeed;
uniform float uFresnelPower;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

${simplexNoise3D}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // Enhanced Fresnel effect - VIOLENT rim light
  float fresnel = pow(1.0 - dot(viewDir, normal), uFresnelPower);
  fresnel = smoothstep(0.0, 1.0, fresnel);
  // Boost fresnel for intense edges
  fresnel = pow(fresnel, 0.7);
  
  // Additional noise for color variation (slower, more organic)
  vec3 flowNoise = vec3(
    snoise(vWorldPosition * 0.2 + vec3(uTime * uFlowSpeed * 0.3, 0.0, 0.0)),
    snoise(vWorldPosition * 0.2 + vec3(0.0, uTime * uFlowSpeed * 0.4, 0.0)),
    snoise(vWorldPosition * 0.2 + vec3(0.0, 0.0, uTime * uFlowSpeed * 0.35))
  );
  
  // BASE: Dark Bronze / Dark Brown (center is very dark)
  vec3 darkBase = vec3(0.15, 0.12, 0.08); // Dark bronze
  
  // MID-TONE: Copper / Orange Gold
  vec3 copperMid = vec3(0.8, 0.5, 0.2); // Copper/Orange gold
  
  // Mix based on noise - center stays dark, edges get copper
  float noiseMix = (vNoise + 1.0) * 0.5;
  noiseMix = pow(noiseMix, 1.5); // Keep it darker in center
  
  vec3 baseColor = mix(darkBase, copperMid, noiseMix * 0.6);
  baseColor += flowNoise * 0.15; // Subtle variation
  
  // Intensity: Very dark center, bright edges
  float intensity = mix(0.2, 1.0, fresnel); // Center is VERY dark (0.2)
  
  // HIGHLIGHT: White/Yellow intense at edges (Fresnel)
  vec3 highlightColor = mix(
    baseColor,
    vec3(1.0, 0.9, 0.6), // Warm white/yellow
    fresnel * 0.9
  );
  
  // EXTREME EDGES: Pure white hot
  highlightColor = mix(
    highlightColor,
    vec3(1.0, 1.0, 0.95), // White hot
    pow(fresnel, 2.5) * 0.7
  );
  
  // Final color with intensity
  vec3 finalColor = highlightColor * intensity;
  
  // Add slight emissive glow on edges
  finalColor += vec3(1.0, 0.8, 0.4) * pow(fresnel, 3.0) * 0.3;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const MoltenMetalUniforms = {
  uTime: { value: 0 },
  uColorStart: { value: new THREE.Color(0x261a0d) }, // Dark bronze (not used directly, but kept for compatibility)
  uColorEnd: { value: new THREE.Color(0xcc8033) },   // Copper/Orange gold
  uFlowSpeed: { value: 0.25 }, // Slower, more organic
  uDisplacementStrength: { value: 0.4 }, // DRAMATICALLY INCREASED for bubbling effect
  uFresnelPower: { value: 1.8 }, // Slightly lower for smoother transition
};
