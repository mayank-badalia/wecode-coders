"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { groundFor } from "@/components/poster/layouts";
import { posterToCanvas } from "@/components/poster/posterCanvas";
import { angularDistance, nearestSlot, slotAngle } from "@/lib/ring";
import type { PublicEvent } from "@/lib/types";
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

  const textures = useMemo(
    () =>
      events.map((e) => {
        // The canvas for an event with a real poster is painted once the
        // image decodes, after this texture already exists — hence the
        // callback rather than a second useMemo pass.
        const tex: THREE.CanvasTexture = new THREE.CanvasTexture(
          posterToCanvas(e, () => {
            tex.needsUpdate = true;
          }),
        );
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
            // Seeded as if the frame loop had already run once, so the first
            // painted frame shows a focused ring rather than a fully
            // desaturated one.
            uDistance: { value: i === 0 ? 0 : 1 },
            uFocus: { value: i === 0 ? 1 : 0 },
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
