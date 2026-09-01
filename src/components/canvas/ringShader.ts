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
  uniform vec3 uAccent;      // this event's own ground colour
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    /*
      The planes are double-sided so they stay visible once the camera moves
      inside the ring. Sampling the raw uv from behind would mirror every
      poster, so the horizontal coordinate is flipped for back faces.
    */
    vec2 uv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);

    /*
      A hint of channel separation, not a smear.

      At the previous strength the split was wide enough to make a spinning
      poster's title unreadable, which defeats the point of showing titles.
    */
    float amt = clamp(abs(uVelocity) * 0.005, 0.0, 0.012);
    float r = texture2D(uTex, uv + vec2(amt, 0.0)).r;
    float g = texture2D(uTex, uv).g;
    float b = texture2D(uTex, uv - vec2(amt, 0.0)).b;
    vec3 col = vec3(r, g, b);

    float d = clamp(uDistance, 0.0, 1.0);
    float grey = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(grey), d * 0.72);
    col *= mix(0.5, 1.0, 1.0 - d);

    // The focused poster is rimmed in its own accent rather than a fixed hue.
    float edge = pow(1.0 - abs(uv.x - 0.5) * 2.0, 4.0);
    col += uAccent * edge * uFocus * 0.45;

    // And every plane keeps a hairline border, so a dark poster still reads
    // as a card in space rather than dissolving into the background.
    float bx = min(uv.x, 1.0 - uv.x);
    float by = min(uv.y, 1.0 - uv.y);
    float border = 1.0 - smoothstep(0.0, 0.006, min(bx, by));
    col = mix(col, vec3(0.95, 0.94, 0.90), border * 0.5);

    col += (hash(uv * 900.0) - 0.5) * 0.04;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/*
  The world the ring turns inside.

  A large inverted cylinder ruled with vertical lines. Its lines slide with the
  ring's accumulated rotation, so the surroundings visibly move rather than the
  posters appearing to drift through a static void — which is what made the
  earlier version feel like nothing was happening.
*/
export const worldVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const worldFragment = /* glsl */ `
  uniform float uOffset;    // accumulated rotation, in turns
  uniform float uInside;    // 0 outside the ring, 1 at its centre
  uniform vec3 uBase;
  uniform vec3 uLine;
  varying vec2 vUv;

  void main() {
    /*
      Vertical rules only, travelling with the rotation.

      There used to be a second set of horizontal bands crossing them, which
      read as a stray straight line laid over the moving ones rather than as
      part of the same world.
    */
    float x = fract(vUv.x * 60.0 + uOffset * 60.0);
    float rule = smoothstep(0.0, 0.03, x) * smoothstep(0.06, 0.03, x);

    // Rules brighten once the visitor is inside and surrounded by them.
    float strength = mix(0.16, 0.42, uInside);
    vec3 col = mix(uBase, uLine, clamp(rule, 0.0, 1.0) * strength);

    // Fade toward the poles so the cylinder does not read as a hard tube.
    float fade = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
    col = mix(uBase, col, fade);

    gl_FragColor = vec4(col, 1.0);
  }
`;
