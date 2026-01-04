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
  
  // Multi-octave noise for organic flow
  float noise = snoise(pos * 0.5 + vec3(uTime * uFlowSpeed, uTime * uFlowSpeed * 0.7, 0.0));
  noise += snoise(pos * 1.0 + vec3(uTime * uFlowSpeed * 0.5, 0.0, 0.0)) * 0.5;
  noise += snoise(pos * 2.0 + vec3(0.0, uTime * uFlowSpeed * 0.3, 0.0)) * 0.25;
  
  vNoise = noise;
  
  // Displace along normals
  pos += normal * noise * uDisplacementStrength;
  
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
  
  // Fresnel effect (edges glow)
  float fresnel = pow(1.0 - dot(viewDir, normal), uFresnelPower);
  fresnel = smoothstep(0.0, 1.0, fresnel);
  
  // Additional noise for color variation
  vec3 flowNoise = vec3(
    snoise(vWorldPosition * 0.3 + vec3(uTime * uFlowSpeed, 0.0, 0.0)),
    snoise(vWorldPosition * 0.3 + vec3(0.0, uTime * uFlowSpeed * 0.8, 0.0)),
    snoise(vWorldPosition * 0.3 + vec3(0.0, 0.0, uTime * uFlowSpeed * 0.6))
  );
  
  // Mix colors based on noise
  vec3 color = mix(uColorStart, uColorEnd, (vNoise + 1.0) * 0.5);
  color += flowNoise * 0.2;
  
  // Intensity increases with fresnel (edges are brighter)
  float intensity = mix(0.3, 1.0, fresnel);
  
  // Add orange/white hot glow at edges
  vec3 glowColor = mix(
    color,
    vec3(1.0, 0.6, 0.2), // Orange hot
    fresnel * 0.8
  );
  
  // White hot at extreme edges
  glowColor = mix(
    glowColor,
    vec3(1.0, 0.95, 0.9), // White hot
    pow(fresnel, 3.0) * 0.5
  );
  
  gl_FragColor = vec4(glowColor * intensity, 1.0);
}
`;

export const MoltenMetalUniforms = {
  uTime: { value: 0 },
  uColorStart: { value: new THREE.Color(0xff6b35) }, // Orange
  uColorEnd: { value: new THREE.Color(0x8b5cf6) },   // Purple
  uFlowSpeed: { value: 0.3 },
  uDisplacementStrength: { value: 0.15 },
  uFresnelPower: { value: 2.0 },
};
