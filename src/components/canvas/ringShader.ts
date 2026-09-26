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

  void main() {
    /*
      The planes are double-sided so they stay visible once the camera moves
      inside the ring. Sampling the raw uv from behind would mirror every
      poster, so the horizontal coordinate is flipped for back faces.
    */
    vec2 uv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);

    /*
      A hint of channel separation while the ring is actually turning, and an
      untouched sample the moment it stops.

      The split used to run at every speed including zero, so a poster at rest
      was permanently sampled three times at three offsets — a standing colour
      fringe on every edge in the artwork. Branching on movement means a still
      poster is the texture, exactly.
    */
    float amt = clamp(abs(uVelocity) * 0.004, 0.0, 0.008);
    vec3 col;
    if (amt > 0.0002) {
      col = vec3(
        texture2D(uTex, uv + vec2(amt, 0.0)).r,
        texture2D(uTex, uv).g,
        texture2D(uTex, uv - vec2(amt, 0.0)).b
      );
    } else {
      col = texture2D(uTex, uv).rgb;
    }

    float d = clamp(uDistance, 0.0, 1.0);

    /*
      Depth is carried by light, not by hue.

      These are someone's finished posters and the colours in them are the
      brand's, not ours to restyle: the orange 48 on Codex, the magenta INDIA
      on CodeHack. Two things used to overwrite them. A 0.72 desaturation
      ramp drained everything off focus toward grey, and — worse — the
      focused poster had its own ground colour added on a mask of
      pow(1 - |x - 0.5| * 2, 4), which peaks at 1.0 dead centre. It was
      written as a rim and behaved as a wash straight across the middle of the
      artwork, which is why every focused poster came out red.

      What is left is a gentle squared falloff in saturation and brightness,
      so distance still reads without any poster being recoloured.
    */
    float grey = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(grey), d * d * 0.26);
    col *= mix(0.6, 1.0, 1.0 - d * d);

    /*
      A hairline that stays one pixel wide at any distance.

      A fixed uv threshold is a fat soft band on the poster in front and
      invisible on the ones at the back. Scaling it by the screen-space
      derivative of the edge distance gives every plate the same crisp rule,
      which is what makes the ring read as a set of cards rather than a
      smudge.
    */
    float e = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float border = 1.0 - smoothstep(0.0, fwidth(e) * 1.6, e);
    col = mix(col, vec3(0.96, 0.95, 0.92), border * mix(0.3, 0.8, uFocus));

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
