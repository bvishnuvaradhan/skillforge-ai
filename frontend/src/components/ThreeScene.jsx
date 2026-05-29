"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";

// Intentionally reference imports to avoid removing them during lint cleanup
void Suspense;
void Canvas;
void Float;
void OrbitControls;
void Sparkles;

// Keep internal scene components referenced to avoid unused-var lint noise
void Orb; void Rings;

function Orb({ position, color, scale = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.18;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.28;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.18;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.7} floatIntensity={1.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.45}
          roughness={0.18}
          metalness={0.75}
        />
      </mesh>
    </Float>
  );
}

function Rings() {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.2;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.06, 16, 120]} />
        <meshStandardMaterial color="#83f0ff" emissive="#3cdfff" emissiveIntensity={0.65} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, Math.PI / 7]}>
        <torusGeometry args={[1.7, 0.045, 16, 120]} />
        <meshStandardMaterial color="#a98bff" emissive="#846bff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function ThreeScene({ className }) {
  const orbPositions = useMemo(
    () => [
      [-2.1, 0.4, 0.3, "#7de3ff", 0.7],
      [1.8, -0.5, -0.6, "#b89cff", 0.55],
      [0.2, 1.2, 0.8, "#9ef5c2", 0.42],
    ],
    [],
  );

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 42 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#050816"]} />
        <fog attach="fog" args={["#050816", 6, 14]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 8]} intensity={1.5} color="#d8f5ff" />
        <pointLight position={[-4, -2, 4]} intensity={1.2} color="#8f7cff" />
        <Suspense fallback={null}>
          <Sparkles count={80} size={4} scale={[12, 8, 6]} speed={0.25} color="#7de3ff" />
          <Rings />
          {orbPositions.map(([x, y, z, color, scale]) => (
            <Orb key={`${x}-${y}-${z}`} position={[x, y, z]} color={color} scale={scale} />
          ))}
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}

export default ThreeScene;
