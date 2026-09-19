import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WorldClockLocation } from '../../types';

interface ThreeGlobeProps {
  locations: WorldClockLocation[];
  selectedLocationId?: string | null;
  onSelectLocation?: (id: string) => void;
  size?: number;
  enabled?: boolean;
}

export const ThreeGlobe: React.FC<ThreeGlobeProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  size = 240,
  enabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0 });
  const isDraggingRef = useRef(false);
  const previousPointerRef = useRef({ x: 0, y: 0 });

  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient light - soft pastel blue/white
    const ambientLight = new THREE.AmbientLight(0xe0e7ff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 5, 6);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 1.4);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    // Globe Main Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Globe Base Sphere - Pearl White
    const globeGeo = new THREE.SphereGeometry(2.5, 48, 48);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.1,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // Wireframe Grid - Soft Lavender / Slate Blue
    const wireframeGeo = new THREE.SphereGeometry(2.51, 24, 24);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xc7d2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeMesh);

    // Outer soft atmosphere halo
    const atmosGeo = new THREE.SphereGeometry(2.65, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // Continent Points - Soft Sky Blue
    const pointsGeo = new THREE.BufferGeometry();
    const pointCount = 1200;
    const positions: number[] = [];

    for (let i = 0; i < pointCount; i++) {
      const theta = (2 * Math.PI * i) / 1.61803398875;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / pointCount);
      const r = 2.52;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      positions.push(x, y, z);
    }
    pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
    });
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    globeGroup.add(pointsMesh);

    // Markers Group
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    globeGroup.add(markersGroup);

    // Render city location pins
    locations.forEach((loc) => {
      const lat = loc.latitude ?? 0;
      const lng = loc.longitude ?? 0;
      const pos = latLngToVector3(lat, lng, 2.53);
      const isSelected = loc.id === selectedLocationId;

      // Pin base disc
      const discGeo = new THREE.CircleGeometry(isSelected ? 0.13 : 0.08, 16);
      const discMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x1d4ed8 : 0x60a5fa,
        side: THREE.DoubleSide,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.copy(pos);
      disc.lookAt(0, 0, 0);
      markersGroup.add(disc);

      // Pin Beacon Stalk
      const pinTopPos = latLngToVector3(lat, lng, isSelected ? 2.85 : 2.72);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, pinTopPos]);
      const lineMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0x1d4ed8 : 0x93c5fd,
      });
      const pinLine = new THREE.Line(lineGeo, lineMat);
      markersGroup.add(pinLine);

      // Glowing tip sphere
      const sphereGeo = new THREE.SphereGeometry(isSelected ? 0.09 : 0.05, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x2563eb : 0x93c5fd,
      });
      const tipSphere = new THREE.Mesh(sphereGeo, sphereMat);
      tipSphere.position.copy(pinTopPos);
      markersGroup.add(tipSphere);
    });

    // Handle auto-rotation to selected location
    if (selectedLocationId) {
      const targetLoc = locations.find((l) => l.id === selectedLocationId);
      if (targetLoc) {
        const lat = targetLoc.latitude ?? 0;
        const lng = targetLoc.longitude ?? 0;
        const phi = (lat * Math.PI) / 180;
        const theta = ((lng - 90) * Math.PI) / 180;
        targetRotationRef.current = {
          x: phi * 0.5,
          y: -theta,
        };
      }
    }

    // Animation Loop
    const animate = () => {
      if (globeGroupRef.current) {
        if (!isDraggingRef.current) {
          if (!selectedLocationId) {
            targetRotationRef.current.y += 0.003;
          }
          globeGroupRef.current.rotation.y += (targetRotationRef.current.y - globeGroupRef.current.rotation.y) * 0.05;
          globeGroupRef.current.rotation.x += (targetRotationRef.current.x - globeGroupRef.current.rotation.x) * 0.05;
        }
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const domEl = containerRef.current;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;
      const deltaX = e.clientX - previousPointerRef.current.x;
      const deltaY = e.clientY - previousPointerRef.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.008;
      globeGroupRef.current.rotation.x += deltaY * 0.008;

      globeGroupRef.current.rotation.x = Math.max(-1.2, Math.min(1.2, globeGroupRef.current.rotation.x));

      targetRotationRef.current = {
        x: globeGroupRef.current.rotation.x,
        y: globeGroupRef.current.rotation.y,
      };

      previousPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [enabled, size, locations, selectedLocationId]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Neo-Apple glowing pastel gradient halo behind globe */}
      <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-pink-200/50 via-sky-200/50 to-indigo-200/40 blur-2xl pointer-events-none" />

      <div
        ref={containerRef}
        style={{ width: size, height: size }}
        className="cursor-grab active:cursor-grabbing touch-none relative z-10 filter drop-shadow-[0_12px_24px_rgba(30,41,59,0.08)]"
      />
    </div>
  );
};
