'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import type { Mesh } from 'three';

gsap.registerPlugin(ScrollTrigger);

function Box() {
  const mesh = useRef<Mesh>(null);

  useEffect(() => {
    if (!mesh.current) return;
    const tween = gsap.to(mesh.current.rotation, {
      y: Math.PI * 2,
      duration: 6,
      repeat: -1,
      ease: 'none',
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <RigidBody colliders="cuboid" restitution={0.4} position={[0, 4, 0]}>
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e8e3d9" roughness={0.35} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}

function Floor() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}

export default function SmokeTestScene() {
  return (
    <Canvas shadows camera={{ position: [6, 4, 8], fov: 45 }}>
      <color attach="background" args={['#0a0a0b']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={2} castShadow />
      <Physics gravity={[0, -9.81, 0]}>
        <Box />
        <Floor />
      </Physics>
      <Environment preset="city" />
      <OrbitControls makeDefault />
    </Canvas>
  );
}
