"use client";

import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AdditiveBlending, MathUtils } from "three";

// defensive references for imports and local helpers to avoid lint false-positives
void Float;
void OrbitControls;
void Sparkles;
void Canvas;

function LogoCore() {
  const coreRef = useRef();
  const glowRef = useRef();
  const shellRef = useRef();

  useFrame((state) => {
    if (!coreRef.current) return;
    coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    coreRef.current.rotation.y = state.clock.elapsedTime * 0.35;

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.45) * 0.03;
    coreRef.current.scale.setScalar(pulse);

    if (glowRef.current) {
      const glowScale = 1.28 + Math.sin(state.clock.elapsedTime * 1.1) * 0.045;
      glowRef.current.scale.setScalar(glowScale);
      glowRef.current.material.opacity = 0.11 + (Math.sin(state.clock.elapsedTime * 1.15) + 1) * 0.018;
    }

    if (shellRef.current) {
      shellRef.current.rotation.y = state.clock.elapsedTime * 0.16;
    }
  });

  return (
    <group ref={coreRef}>
      <mesh>
        <icosahedronGeometry args={[1.08, 1]} />
        <meshPhysicalMaterial
          color="#94f6ff"
          emissive="#53e6ff"
          emissiveIntensity={0.6}
          metalness={0.42}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
          iridescence={0.9}
          iridescenceIOR={1.45}
        />
      </mesh>
      <mesh scale={0.66}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color="#dff9ff"
          emissive="#1edfff"
          emissiveIntensity={0.95}
          metalness={0.08}
          roughness={0.03}
          transmission={0.52}
          thickness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>
      <mesh ref={shellRef} scale={0.83}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial
          color="#84ebff"
          transparent
          opacity={0.2}
          roughness={0}
          metalness={0.05}
          transmission={0.85}
          thickness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.02}
          iridescence={1}
          iridescenceIOR={1.3}
        />
      </mesh>
      <mesh ref={glowRef} scale={1.22}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#4de8ff" transparent opacity={0.12} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}

function OrbitalRings() {
  const ringRef = useRef();

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.18;
  });

  return (
    <group ref={ringRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.73, 0.052, 24, 180]} />
        <meshStandardMaterial color="#8addff" emissive="#22d3ee" emissiveIntensity={0.62} metalness={0.45} roughness={0.25} />
      </mesh>
      <mesh rotation={[0, Math.PI / 3, Math.PI / 5]}>
        <torusGeometry args={[1.26, 0.042, 24, 180]} />
        <meshStandardMaterial color="#b8b4ff" emissive="#73ddff" emissiveIntensity={0.42} metalness={0.32} roughness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, Math.PI / 7, Math.PI / 6]}>
        <torusGeometry args={[1.49, 0.028, 24, 180]} />
        <meshBasicMaterial color="#53e6ff" transparent opacity={0.28} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}

function LogoRig() {
  const rigRef = useRef();

  useFrame((state) => {
    if (!rigRef.current) return;
    const tx = state.pointer.y * 0.16;
    const ty = state.pointer.x * 0.2;
    rigRef.current.rotation.x = MathUtils.lerp(rigRef.current.rotation.x, tx, 0.08);
    rigRef.current.rotation.y = MathUtils.lerp(rigRef.current.rotation.y, ty, 0.08);
  });

  return (
    <group ref={rigRef}>
      <LogoCore />
      <OrbitalRings />
    </group>
  );
}

export function LogoScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6.2], fov: 42 }} dpr={[1, 1.35]}>
      <color attach="background" args={["#050816"]} />
      <ambientLight intensity={0.66} />
      <directionalLight position={[3, 4, 7]} intensity={1.15} color="#d8f5ff" />
      <pointLight position={[-4, -2, 5]} intensity={1.05} color="#8b5cf6" />
      <pointLight position={[0, 0, 3.5]} intensity={0.72} color="#52e4ff" />
      <Float speed={1.4} rotationIntensity={0.45} floatIntensity={1.25}>
        <LogoRig />
      </Float>
      <Sparkles count={55} scale={[5.6, 5.6, 5.6]} size={3} speed={0.24} color="#7dd3fc" />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.3} />
    </Canvas>
  );
}

export default LogoScene;