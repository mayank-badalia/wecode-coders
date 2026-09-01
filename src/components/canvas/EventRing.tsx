"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { groundFor } from "@/components/poster/layouts";
import { posterToCanvas } from "@/components/poster/posterCanvas";
import { angularDistance, nearestSlot, slotAngle } from "@/lib/ring";
import type { Event } from "@/lib/types";
import { ringFragment, ringVertex, worldFragment, worldVertex } from "./ringShader";

const RADIUS = 3.4;
/** How much the ring expands once the camera is at its centre. */
const INSIDE_RADIUS_GAIN = 1.5;
const PLANE_W = 2.15;
const PLANE_H = 2.85;
const TAU = Math.PI * 2;

/** Where the camera sits before it travels inside. */
export const CAMERA_Z = RADIUS + 4.9;

export type RingInput = {
  drag: number;
  scroll: number;
  nudge: number;
  dragging: boolean;
};

type EventRingProps = {
  events: Event[];
  focused: number;
  onFocusChange: (index: number) => void;
  /** Reports 0 outside the ring, 1 once the camera is at its centre. */
  onInsideChange?: (inside: number) => void;
  /** Index of the poster under the pointer, or null when over empty space. */
  onHoverChange?: (index: number | null) => void;
  consumeInput: () => RingInput;
};

export function EventRing({
  events,
  focused,
  onFocusChange,
  onInsideChange,
  onHoverChange,
  consumeInput,
}: EventRingProps) {
  const group = useRef<THREE.Group>(null);
  const world = useRef<THREE.Mesh>(null);
  const rotation = useRef(0);
  /** Where the ring is heading; scroll and drag move this, not the angle. */
  const target = useRef(0);
  const velocity = useRef(0);
  /** Seconds since the last input, used to decide when to settle. */
  const idle = useRef(0);
  const settled = useRef(false);
  const inside = useRef(0);
  const reportedInside = useRef(-1);

  const textures = useMemo(
    () =>
      events.map((e) => {
        const tex = new THREE.CanvasTexture(posterToCanvas(e));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        return tex;
      }),
    [events],
  );

  const materials = useMemo(
    () =>
      textures.map((tex, i) => {
        const ground = groundFor(events[i]!);
        return new THREE.ShaderMaterial({
          vertexShader: ringVertex,
          fragmentShader: ringFragment,
          // Double-sided so the posters stay visible once the camera is inside
          // the ring and looking at their backs.
          side: THREE.DoubleSide,
          uniforms: {
            uTex: { value: tex },
            uVelocity: { value: 0 },
            uDistance: { value: 1 },
            uFocus: { value: 0 },
            uCurve: { value: 0.05 },
            uAccent: { value: new THREE.Color(ground.bg) },
          },
        });
      }),
    [textures, events],
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
          uBase: { value: new THREE.Color("#142139") },
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
    cam.position.z = CAMERA_Z * (1 - inside.current) + 0.001;
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

    const rounded = Math.round(inside.current * 20) / 20;
    if (rounded !== reportedInside.current) {
      reportedInside.current = rounded;
      onInsideChange?.(rounded);
    }

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
              position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]}
              rotation={[0, angle, 0]}
              material={materials[i]}
              /*
                Real raycast hover, so the cursor bubble appears over an actual
                poster rather than across the whole page, and can take that
                event's own colour.
              */
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverChange?.(i);
              }}
              onPointerOut={() => onHoverChange?.(null)}
            >
              <planeGeometry args={[PLANE_W, PLANE_H, 28, 1]} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}
