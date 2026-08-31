"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { angularDistance, nearestSlot, slotAngle } from "@/lib/ring";
import type { Event } from "@/lib/types";
import { posterToCanvas } from "@/components/poster/posterCanvas";
import { ringFragment, ringVertex } from "./ringShader";

/*
  The camera sits outside the ring looking in, not at its centre.

  From the centre, seven slots sit 51.4deg apart while even an 85deg lens only
  reaches ~56deg horizontally, so every neighbour fell outside the frustum and
  the "ring" read as one poster floating in the dark. From outside, the front
  arc of the cylinder is visible at once and the thing reads as a carousel
  turning in space, which is what it is.
*/
const RADIUS = 3.2;
const PLANE_W = 2.1;
const PLANE_H = 2.8;
export const CAMERA_Z = RADIUS + 4.6;
const SNAP_SPEED = 0.05;

export type RingInput = {
  /** Radians of drag accumulated since the last read. */
  drag: number;
  /** Radians per second contributed by scroll since the last read. */
  scroll: number;
  /** Whole slots to advance, from keyboard input. */
  nudge: number;
  dragging: boolean;
};

type EventRingProps = {
  events: Event[];
  focused: number;
  onFocusChange: (index: number) => void;
  /**
   * Returns the input accumulated since the last call and clears it.
   *
   * The ring reads input rather than reaching into refs it does not own —
   * whoever owns the pointer and scroll listeners owns their state, and this
   * is the seam between them.
   */
  consumeInput: () => RingInput;
};

export function EventRing({
  events,
  focused,
  onFocusChange,
  consumeInput,
}: EventRingProps) {
  const group = useRef<THREE.Group>(null);
  const rotation = useRef(0);
  const velocity = useRef(0);
  const settling = useRef(false);
  const { invalidate } = useThree();

  const textures = useMemo(
    () =>
      events.map((e) => {
        const tex = new THREE.CanvasTexture(posterToCanvas(e));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        return tex;
      }),
    [events],
  );

  const materials = useMemo(
    () =>
      textures.map(
        (tex) =>
          new THREE.ShaderMaterial({
            vertexShader: ringVertex,
            fragmentShader: ringFragment,
            uniforms: {
              uTex: { value: tex },
              uVelocity: { value: 0 },
              uDistance: { value: 1 },
              uFocus: { value: 0 },
              uCurve: { value: 0.05 },
            },
          }),
      ),
    [textures],
  );

  // Three does not free GPU memory on its own; without this, navigating away
  // and back leaks a texture and a program per event, every time.
  useEffect(() => {
    return () => {
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
    };
  }, [textures, materials]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const input = consumeInput();

    if (input.dragging) {
      velocity.current = input.drag / Math.max(dt, 0.0001);
      rotation.current += input.drag;
      settling.current = false;
    } else {
      velocity.current += input.scroll;

      // A key press is an angular impulse rather than a jump, so the ring
      // travels to the next slot the same way a flick would. Without this the
      // ring's own slot detection immediately overwrote any focus set from
      // outside, and arrow keys did nothing.
      if (input.nudge !== 0) {
        velocity.current -= input.nudge * 2.6;
        settling.current = false;
      }

      rotation.current += velocity.current * dt;
      // Exponential damping, so the coast-down feels the same at any frame rate.
      velocity.current *= Math.exp(-dt / 0.35);

      if (Math.abs(velocity.current) < SNAP_SPEED) {
        // Ease to the nearest slot once the spin has decayed.
        const slot = nearestSlot(-rotation.current, events.length);
        const target = -slotAngle(slot, events.length);
        const turns = Math.round((rotation.current - target) / (Math.PI * 2));
        const goal = target + turns * Math.PI * 2;
        rotation.current += (goal - rotation.current) * Math.min(1, dt * 6);
        velocity.current *= 0.9;
        settling.current = true;
      }
    }

    if (group.current) group.current.rotation.y = rotation.current;

    const slot = nearestSlot(-rotation.current, events.length);
    if (slot !== focused) onFocusChange(slot);

    materials.forEach((mat, i) => {
      const planeAngle = slotAngle(i, events.length);
      const dist = angularDistance(planeAngle, -rotation.current) / Math.PI;
      mat.uniforms.uDistance!.value = Math.min(1, dist * 2.2);
      mat.uniforms.uFocus!.value = i === slot ? 1 : 0;
      mat.uniforms.uVelocity!.value = velocity.current;
    });

    // frameloop is "demand": keep asking for frames only while something moves.
    if (Math.abs(velocity.current) > 0.001 || !settling.current) invalidate();
  });

  return (
    <group ref={group}>
      {events.map((event, i) => {
        const angle = slotAngle(i, events.length);
        /*
          Slot 0 sits at +Z, nearest the camera, with each plane rotated so its
          front face points outward along the radius — toward the viewer rather
          than toward the axis. Facing them inward left the whole ring
          back-face culled and the canvas rendered empty.
        */
        return (
          <mesh
            key={event.slug}
            position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]}
            rotation={[0, angle, 0]}
            material={materials[i]}
            onPointerOver={() => {
              if (i === focused) document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <planeGeometry args={[PLANE_W, PLANE_H, 24, 1]} />
          </mesh>
        );
      })}
    </group>
  );
}
