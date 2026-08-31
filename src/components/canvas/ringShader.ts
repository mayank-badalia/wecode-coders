export const ringVertex = /* glsl */ `
  uniform float uCurve;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    // Barrel the plane about its own vertical axis so each poster reads as a
    // segment of the cylinder rather than a flat card floating on it.
    p.z -= p.x * p.x * uCurve;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const ringFragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uVelocity;   // rad/sec — drives the channel split
  uniform float uDistance;   // 0 at focus, 1 far away
  uniform float uFocus;      // 1 for the focused plane
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // The ring smears while it spins and resolves as it settles.
    float amt = clamp(abs(uVelocity) * 0.018, 0.0, 0.045);
    float r = texture2D(uTex, vUv + vec2(amt, 0.0)).r;
    float g = texture2D(uTex, vUv).g;
    float b = texture2D(uTex, vUv - vec2(amt, 0.0)).b;
    vec3 col = vec3(r, g, b);

    // Everything but the focused poster steps back toward grey.
    float grey = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(grey), clamp(uDistance, 0.0, 1.0) * 0.8);
    col *= mix(0.55, 1.0, 1.0 - clamp(uDistance, 0.0, 1.0));

    // Violet-to-pink rim on the focused plane only.
    float edge = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 4.0);
    vec3 rim = mix(vec3(0.294, 0.231, 0.941), vec3(0.961, 0.788, 0.816), vUv.y);
    col += rim * edge * uFocus * 0.4;

    col += (hash(vUv * 900.0) - 0.5) * 0.045;

    gl_FragColor = vec4(col, 1.0);
  }
`;
