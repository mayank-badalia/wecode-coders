"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { posterToCanvas } from "@/components/poster/posterCanvas";
import { angularDistance, nearestSlot, ringRadius, slotAngle } from "@/lib/ring";
import type { PublicEvent } from "@/lib/types";
import { ringFragment, ringVertex, worldFragment, worldVertex } from "./ringShader";

/** How much the ring expands once the camera is at its centre. */
const INSIDE_RADIUS_GAIN = 1.5;
const PLANE_W = 2.15;
const PLANE_H = 2.85;
const TAU = Math.PI * 2;

/**
 * How far in front of the nearest poster the camera sits, at minimum.
 *
 * Added to the radius rather than used as an absolute position, so the
 * focused poster is always at least this far away whatever the ring's size.
 * A fixed camera distance would have shrunk every poster as the ring grew.
 *
 * On a portrait screen the camera pulls back further — see frameGap.
 */
const CAMERA_GAP = 4.9;

/** The tallest a plane gets, once reshaped to a 4:5 poster. */
const PLANE_H_MAX = 2.7;

/**
 * The camera gap that frames the focused poster for a given viewport.
 *
 * A 46° field of view is vertical, so the horizontal one collapses with the
 * aspect ratio: the gap that puts a poster across 32% of a 1440x900 window
 * puts it across 112% of a 390x844 phone, overflowing the screen on both
 * sides. Solving for the distance that keeps the poster inside a fraction of
 * both axes is what makes a phone and a desktop show the same composition
 * rather than the same numbers.
 *
 * The floor is CAMERA_GAP, so nothing about a wide screen changes.
 */
export function frameGap(aspect: number, fovDegrees: number): number {
  const t = Math.tan((fovDegrees * Math.PI) / 360);
  const portrait = aspect < 1;
  /*
    A portrait screen has to leave room for two things a wide one does not:
    the fixed bar across the top, and the panel across the bottom. Filling
    82% of its width put the poster under both. 62% of the width and 46% of
    the height leaves the poster in a clean band between them.
  */
  const wFrac = portrait ? 0.62 : 0.82;
  const hFrac = portrait ? 0.46 : 0.66;
  const byWidth = PLANE_W / (2 * t * Math.max(aspect, 0.2) * wFrac);
  const byHeight = PLANE_H_MAX / (2 * t * hFrac);
  return Math.max(CAMERA_GAP, byWidth, byHeight);
}

/**
 * How far up the ring sits, in world units, for a given camera gap.
 *
 * Proportional to what the camera can see, so the ring holds its place in
 * the composition whatever the screen — a fixed offset drifts as the frame
 * changes. Zero on a landscape window, where the panel is down the left side
 * and there is nothing to clear.
 */
export function ringLift(aspect: number, fovDegrees: number, gap: number): number {
  if (aspect >= 1) return 0;
  const visibleHeight = 2 * gap * Math.tan((fovDegrees * Math.PI) / 360);
  return visibleHeight * 0.12;
}

/** The radius this many events need to sit side by side without overlapping. */
export function ringRadiusFor(count: number): number {
  return ringRadius(count, PLANE_W);
}

/**
 * Where the camera starts, before the frame loop reframes it.
 *
 * Only the initial prop on <Canvas>; the loop corrects it on the first frame
 * from the real aspect, so this just needs to be close enough that nothing
 * visibly jumps.
 */
export function cameraZFor(count: number): number {
  return ringRadiusFor(count) + CAMERA_GAP;
}

export type RingInput = {
  drag: number;
  scroll: number;
  nudge: number;
  dragging: boolean;
  /** False until the pointer has actually entered the canvas. */
  pointerOver: boolean;
};

type EventRingProps = {
  events: PublicEvent[];
  focused: number;
  onFocusChange: (index: number) => void;
  /** Index of the poster under the pointer, or null when over empty space. */
  onHoverChange?: (index: number | null) => void;
  consumeInput: () => RingInput;
};

export function EventRing({
  events,
  focused,
  onFocusChange,
  onHoverChange,
  consumeInput,
}: EventRingProps) {
  /*
    Sized from the count, not from a constant.

    Sixteen events on the ten-event radius buried 38% of every poster under
    its neighbour, which is what "merged" looked like from outside and from
    the centre alike.
  */
  const radius = ringRadiusFor(events.length);

  const group = useRef<THREE.Group>(null);
  const planes = useRef<(THREE.Mesh | null)[]>([]);
  const reportedHover = useRef<number | null>(null);
  const world = useRef<THREE.Mesh>(null);
  const rotation = useRef(0);
  /** Where the ring is heading; scroll and drag move this, not the angle. */
  const target = useRef(0);
  const velocity = useRef(0);
  /** Seconds since the last input, used to decide when to settle. */
  const idle = useRef(0);
  const settled = useRef(false);
  const inside = useRef(0);

  /*
    Anisotropic filtering, at whatever the GPU actually offers.

    Every poster except the focused one is seen at a steep angle, which is the
    exact case trilinear filtering handles worst: it picks a mip level for the
    squashed axis and smears the other one. It was pinned at 4; asking the
    renderer for its maximum is free and is most of the difference between a
    legible poster at the edge of the ring and a grey smudge.
  */
  const maxAnisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());

  const textures = useMemo(
    () =>
      events.map((e) => {
        /*
          The canvas for an event with a real poster is painted once the image
          decodes, after this texture already exists — hence the callback
          rather than a second useMemo pass.

          The artwork's aspect is recorded on the texture itself. It belongs
          with the thing it describes, it arrives at the same moment, and the
          frame loop that reshapes the plane already has the texture to hand.
        */
        const tex: THREE.CanvasTexture = new THREE.CanvasTexture(
          posterToCanvas(e, (ratio) => {
            tex.userData.ratio = ratio;
            /*
              The plate is resized to the artwork when it decodes, and
              needsUpdate alone does not survive that.

              needsUpdate re-uploads pixels into the allocation three already
              made, which is still the pre-resize size — so the GPU kept
              showing the holding colour and every tile came out a flat slab
              of its ground. dispose() drops that allocation, and the next
              render builds a new one from the canvas as it now is. Verified
              in the browser that the canvas itself redraws correctly, so the
              re-upload was the only thing missing.
            */
            tex.dispose();
            tex.needsUpdate = true;
          }),
        );
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAnisotropy;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        return tex;
      }),
    [events, maxAnisotropy],
  );

  const materials = useMemo(
    () =>
      textures.map((tex, i) => {
        return new THREE.ShaderMaterial({
          vertexShader: ringVertex,
          fragmentShader: ringFragment,
          // Double-sided so the posters stay visible once the camera is inside
          // the ring and looking at their backs.
          side: THREE.DoubleSide,
          uniforms: {
            uTex: { value: tex },
            uVelocity: { value: 0 },
            // Seeded as if the frame loop had already run once, so the first
            // painted frame shows a focused ring rather than a fully
            // desaturated one.
            uDistance: { value: i === 0 ? 0 : 1 },
            uFocus: { value: i === 0 ? 1 : 0 },
            uCurve: { value: 0.05 },
          },
        });
      }),
    // No longer reads `events`: the accent wash it fed is gone, and the
    // textures array already changes whenever the events do.
    [textures],
  );

  const worldMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: worldVertex,
        fragmentShader: worldFragment,
        side: THREE.BackSide,
        uniforms: {
          uOffset: { value: 0 },
          uInside: { value: 0 },
          /*
            Deliberately darker than the ink poster ground.

            The world used to be exactly #142139 — the same value an
            ink-ground poster is filled with — so those posters vanished
            into the background and the ring looked empty at rest.
          */
          uBase: { value: new THREE.Color("#0A0F1C") },
          uLine: { value: new THREE.Color("#F3EFE5") },
        },
      }),
    [],
  );

  // Three does not free GPU memory on its own; without this, navigating away
  // and back leaks a texture and a program per event, every time.
  useEffect(() => {
    return () => {
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      worldMaterial.dispose();
    };
  }, [textures, materials, worldMaterial]);

  // The camera comes from the frame state rather than from a render-time
  // capture: it is external scene state the loop drives, not React state.
  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const input = consumeInput();
    const previous = rotation.current;

    /*
      Scroll drives a target angle and the ring eases toward it.

      The first version added each scroll tick to an angular velocity that then
      decayed. That reads as sluggish and unpredictable — forty wheel ticks
      moved the ring less than a single turn, because each tick's contribution
      was already decaying before the next arrived. Aiming at a target and
      easing toward it accumulates properly, stays smooth at any frame rate,
      and makes the snap a small adjustment of the target rather than a fight
      against momentum.
    */
    if (input.dragging) {
      target.current += input.drag;
      idle.current = 0;
    } else {
      if (input.scroll !== 0) {
        target.current += input.scroll;
        idle.current = 0;
      }
      if (input.nudge !== 0) {
        target.current -= input.nudge * (TAU / events.length);
        idle.current = 0;
      }
      idle.current += dt;

      // Once the visitor stops, settle onto the nearest event.
      if (idle.current > 0.28) {
        const slot = nearestSlot(-target.current, events.length);
        const nearest = -slotAngle(slot, events.length);
        const turns = Math.round((target.current - nearest) / TAU);
        target.current += (nearest + turns * TAU - target.current) * Math.min(1, dt * 3.4);
      }
    }

    // Frame-rate independent easing toward the target.
    rotation.current += (target.current - rotation.current) * (1 - Math.exp(-dt / 0.16));
    velocity.current = (rotation.current - previous) / Math.max(dt, 0.0001);
    settled.current = Math.abs(target.current - rotation.current) < 0.0005;

    if (group.current) {
      group.current.rotation.y = rotation.current;
      /*
        Lifted on a portrait screen, so the ring sits above the panel that
        overlays the bottom of the page rather than behind it. On a landscape
        window the panel is down the left side and there is nothing to clear.
      */
      const view = state.camera as THREE.PerspectiveCamera;
      const lift = ringLift(view.aspect, view.fov, frameGap(view.aspect, view.fov));
      group.current.position.y = lift * (1 - inside.current);
      // Push the posters back as the camera arrives, so standing at the centre
      // reads as being surrounded rather than as being pinned against them.
      const scale = 1 + inside.current * (INSIDE_RADIUS_GAIN - 1);
      group.current.scale.set(scale, 1 + inside.current * 0.12, scale);
    }

    /*
      After one full turn the camera travels from outside the ring to its
      centre, so the posters end up surrounding the visitor — in front, behind
      and to both sides — rather than always being viewed from the outside.
      It is driven by accumulated rotation, so it is reversible: scrolling back
      pulls the camera out again.
    */
    /*
      One full revolution earns the trip inside. Measured, not guessed: at the
      first gain the ring moved ~0.8 rad per scroll burst, so a visitor needed
      roughly nineteen bursts to get here and nobody ever would.
    */
    const turnsDone = Math.abs(rotation.current) / TAU;
    const targetInside = Math.min(1, Math.max(0, (turnsDone - 1) / 0.32));
    inside.current += (targetInside - inside.current) * Math.min(1, dt * 2.4);

    const cam = state.camera as THREE.PerspectiveCamera;
    /*
      Reframed every frame from the camera's own aspect.

      Cheap — two tangents — and it covers a phone rotating, a desktop window
      being dragged narrow, and the browser chrome collapsing on scroll, none
      of which fire a resize we would otherwise act on.
    */
    const gap = frameGap(cam.aspect, cam.fov);
    cam.position.z = (radius + gap) * (1 - inside.current) + 0.001;
    cam.position.y = 0.15 * (1 - inside.current);

    /*
      Turn to face the focused slot on the way in.

      Slot 0 sits at +Z, which is behind a camera looking down -Z, so arriving
      at the centre without this put the focused poster at the visitor's back
      and left a hole where it should have been.
    */
    cam.rotation.y = inside.current * Math.PI;

    // And open up the lens: at the outside framing everything within arm's
    // reach fills the frame as an unreadable slab.
    const fov = 46 + inside.current * 36;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    worldMaterial.uniforms.uOffset!.value = rotation.current / TAU;
    worldMaterial.uniforms.uInside!.value = inside.current;
    if (world.current) world.current.rotation.y = rotation.current * 0.35;

    // Dev-only readout, used to tune the scroll gain and the inside ramp
    // against measured values rather than guesses.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as Record<string, unknown>).__ring = {
        rotation: rotation.current,
        turns: turnsDone,
        target: targetInside,
        inside: inside.current,
        velocity: velocity.current,
      };
    }

    /*
      Hover is resolved by raycasting every frame, not by pointer enter and
      leave events.

      Those events are missed whenever the thing under the pointer changes for
      a reason other than the pointer moving — the ring rotating out from under
      it, a poster passing behind another, a fast flick between two planes —
      and a missed "out" left the cursor bubble stranded over empty space.
      Asking the scene what is actually under the pointer each frame cannot get
      stuck in the same way.
    */
    const meshes = planes.current.filter((m): m is THREE.Mesh => m !== null);

    /*
      The raycaster is aimed explicitly, and only while the pointer is over
      the canvas: an untouched pointer reads (0, 0), which is dead centre, and
      would report a hover on the focused poster before the visitor had moved
      the mouse at all.
    */
    if (input.pointerOver && meshes.length > 0) {
      state.raycaster.setFromCamera(state.pointer, state.camera);
    }
    const hits =
      input.pointerOver && meshes.length > 0
        ? state.raycaster.intersectObjects(meshes, false)
        : [];
    const hitMesh = hits[0]?.object;
    const hovered = hitMesh ? planes.current.findIndex((m) => m === hitMesh) : -1;
    const hoveredIndex = hovered === -1 ? null : hovered;

    if (hoveredIndex !== reportedHover.current) {
      reportedHover.current = hoveredIndex;
      onHoverChange?.(hoveredIndex);
    }

    /*
      Reshape each plane to its poster.

      The plates are no longer letterboxed, so a square poster on the default
      3:4 plane would be stretched tall. Width is what the ring's spacing is
      built on and stays fixed; the height follows the artwork. Applied here
      rather than at mount because the ratio only arrives once the image has
      decoded, and it is a no-op on every frame after the first.
    */
    planes.current.forEach((mesh, i) => {
      const ratio = textures[i]?.userData.ratio as number | undefined;
      if (!mesh || !ratio) return;
      const wanted = PLANE_W / ratio / PLANE_H;
      if (Math.abs(mesh.scale.y - wanted) > 0.0001) mesh.scale.y = wanted;
    });

    const slot = nearestSlot(-rotation.current, events.length);
    if (slot !== focused) onFocusChange(slot);

    materials.forEach((mat, i) => {
      const planeAngle = slotAngle(i, events.length);
      const dist = angularDistance(planeAngle, -rotation.current) / Math.PI;
      // Inside the ring everything is close, so the falloff is gentler and
      // the posters behind the visitor stay legible.
      const spread = 2.2 - inside.current * 1.35;
      mat.uniforms.uDistance!.value = Math.min(1, dist * spread);
      mat.uniforms.uFocus!.value = i === slot ? 1 : 0;
      mat.uniforms.uVelocity!.value = velocity.current;
    });

  });

  return (
    <>
      <mesh ref={world} material={worldMaterial}>
        <cylinderGeometry args={[26, 26, 34, 64, 1, true]} />
      </mesh>

      <group ref={group}>
        {events.map((event, i) => {
          const angle = slotAngle(i, events.length);
          return (
            <mesh
              key={event.slug}
              position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
              rotation={[0, angle, 0]}
              material={materials[i]}
              ref={(node) => {
                planes.current[i] = node;
              }}
            >
              <planeGeometry args={[PLANE_W, PLANE_H, 28, 1]} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}
