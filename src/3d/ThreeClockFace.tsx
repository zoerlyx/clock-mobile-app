import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeClockFaceProps {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds?: number;
  size?: number;
  enabled?: boolean;
}

export const ThreeClockFace: React.FC<ThreeClockFaceProps> = ({
  hours,
  minutes,
  seconds,
  milliseconds = 0,
  size = 240,
  enabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const hourHandRef = useRef<THREE.Group | null>(null);
  const minuteHandRef = useRef<THREE.Group | null>(null);
  const secondHandRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const width = size;
    const height = size;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return; // WebGL not supported
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xecf0f1, 1.8);
    dirLight.position.set(4, 5, 6);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-5, -4, 4);
    scene.add(rimLight);

    // Bezel Outer Ring
    const outerRingGeo = new THREE.TorusGeometry(3.2, 0.18, 24, 64);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    scene.add(outerRing);

    // Dial Face
    const dialGeo = new THREE.CylinderGeometry(3.1, 3.1, 0.2, 64);
    const dialMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f19,
      roughness: 0.4,
      metalness: 0.6,
    });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.rotation.x = Math.PI / 2;
    dial.position.z = -0.1;
    dial.receiveShadow = true;
    scene.add(dial);

    // Inner subtle ring
    const innerRingGeo = new THREE.RingGeometry(2.1, 2.12, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.position.z = 0.01;
    scene.add(innerRing);

    // Hour Markers
    const tickGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const isMajor = i % 3 === 0;
      const tickGeo = new THREE.BoxGeometry(
        isMajor ? 0.12 : 0.06,
        isMajor ? 0.45 : 0.25,
        0.08
      );
      const tickMat = new THREE.MeshStandardMaterial({
        color: isMajor ? 0x38bdf8 : 0x94a3b8,
        metalness: 0.5,
        roughness: 0.2,
      });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      const r = 2.65;
      tick.position.set(Math.sin(angle) * r, Math.cos(angle) * r, 0.05);
      tick.rotation.z = -angle;
      tickGroup.add(tick);
    }
    scene.add(tickGroup);

    // Hour Hand
    const hourGroup = new THREE.Group();
    const hourGeo = new THREE.BoxGeometry(0.16, 1.8, 0.08);
    const hourMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.8,
      roughness: 0.2,
    });
    const hourMesh = new THREE.Mesh(hourGeo, hourMat);
    hourMesh.position.y = 0.8;
    hourMesh.castShadow = true;
    hourGroup.add(hourMesh);
    hourGroup.position.z = 0.15;
    scene.add(hourGroup);
    hourHandRef.current = hourGroup;

    // Minute Hand
    const minuteGroup = new THREE.Group();
    const minuteGeo = new THREE.BoxGeometry(0.1, 2.5, 0.08);
    const minuteMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.7,
      roughness: 0.3,
    });
    const minuteMesh = new THREE.Mesh(minuteGeo, minuteMat);
    minuteMesh.position.y = 1.15;
    minuteMesh.castShadow = true;
    minuteGroup.add(minuteMesh);
    minuteGroup.position.z = 0.25;
    scene.add(minuteGroup);
    minuteHandRef.current = minuteGroup;

    // Second Hand (accent azure cyan)
    const secondGroup = new THREE.Group();
    const secondGeo = new THREE.BoxGeometry(0.04, 2.8, 0.05);
    const secondMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      metalness: 0.3,
      roughness: 0.1,
    });
    const secondMesh = new THREE.Mesh(secondGeo, secondMat);
    secondMesh.position.y = 1.0;
    secondMesh.castShadow = true;
    secondGroup.add(secondMesh);

    // Counterweight
    const tailGeo = new THREE.BoxGeometry(0.08, 0.7, 0.05);
    const tailMesh = new THREE.Mesh(tailGeo, secondMat);
    tailMesh.position.y = -0.35;
    secondGroup.add(tailMesh);

    secondGroup.position.z = 0.35;
    scene.add(secondGroup);
    secondHandRef.current = secondGroup;

    // Center Cap
    const capGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.2, 32);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.45;
    scene.add(cap);

    // Subtle pointer parallax tilt
    const handlePointerMove = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      scene.rotation.y = x * 0.15;
      scene.rotation.x = -y * 0.15;
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener('mousemove', handlePointerMove);

    return () => {
      containerEl.removeEventListener('mousemove', handlePointerMove);
      renderer.dispose();
      scene.clear();
    };
  }, [enabled, size]);

  // Update hands smoothly on state change
  useEffect(() => {
    const totalSeconds = seconds + milliseconds / 1000;
    const totalMinutes = minutes + totalSeconds / 60;
    const totalHours = (hours % 12) + totalMinutes / 60;

    const hourAngle = -(totalHours * (Math.PI * 2)) / 12;
    const minuteAngle = -(totalMinutes * (Math.PI * 2)) / 60;
    const secondAngle = -(totalSeconds * (Math.PI * 2)) / 60;

    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = hourAngle;
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = minuteAngle;
    }
    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = secondAngle;
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [hours, minutes, seconds, milliseconds]);

  // 2D SVG Fallback if 3D disabled
  if (!enabled) {
    const totalSeconds = seconds + milliseconds / 1000;
    const totalMinutes = minutes + totalSeconds / 60;
    const totalHours = (hours % 12) + totalMinutes / 60;

    const hDeg = totalHours * 30;
    const mDeg = totalMinutes * 6;
    const sDeg = totalSeconds * 6;

    return (
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-inner"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#334155" strokeWidth="1.5" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="50"
              y1={i % 3 === 0 ? "10" : "12"}
              x2="50"
              y2={i % 3 === 0 ? "18" : "15"}
              stroke={i % 3 === 0 ? "#38bdf8" : "#64748b"}
              strokeWidth={i % 3 === 0 ? "2.5" : "1.5"}
              strokeLinecap="round"
              transform={`rotate(${i * 30} 50 50)`}
            />
          ))}
          {/* Hour hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="28"
            stroke="#f8fafc"
            strokeWidth="3.5"
            strokeLinecap="round"
            transform={`rotate(${hDeg} 50 50)`}
          />
          {/* Minute hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="18"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${mDeg} 50 50)`}
          />
          {/* Second hand */}
          <line
            x1="50"
            y1="58"
            x2="50"
            y2="14"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${sDeg} 50 50)`}
          />
          <circle cx="50" cy="50" r="3" fill="#38bdf8" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center cursor-pointer transition-transform duration-300"
    />
  );
};
