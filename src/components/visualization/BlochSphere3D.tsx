import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface BlochSphere3DProps {
  theta?: number; // 0 to PI
  phi?: number;   // 0 to 2*PI
  interactive?: boolean;
  autoRotate?: boolean;
  className?: string;
  onAnglesChange?: (theta: number, phi: number) => void;
  onSelectState?: (state: '0' | '1') => void;
}

export const BlochSphere3D: React.FC<BlochSphere3DProps> = ({
  theta = Math.PI / 3, // default 60 deg
  phi = Math.PI / 4,   // default 45 deg
  interactive = true,
  autoRotate = true,
  className = '',
  onAnglesChange,
  onSelectState
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<THREE.ArrowHelper | null>(null);
  const tipRef = useRef<THREE.Mesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const interactiveRef = useRef<boolean>(interactive);

  // Keep refs immediately up-to-date with latest prop values
  autoRotateRef.current = autoRotate;
  interactiveRef.current = interactive;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.4, 2.0, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient & directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x22d3ee, 2.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3, 10);
    purpleLight.position.set(-3, -2, -3);
    scene.add(purpleLight);

    // Group for the sphere that can be rotated
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // 1. Semi-transparent sphere surface
    const sphereGeo = new THREE.SphereGeometry(1, 36, 36);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0f172a,
      emissive: 0x06283d,
      transparent: true,
      opacity: 0.35,
      wireframe: false,
      shininess: 90
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereGroup.add(sphereMesh);

    // 2. Wireframe overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const wireframeMesh = new THREE.Mesh(sphereGeo, wireframeMat);
    sphereGroup.add(wireframeMesh);

    // 3. Equator and Meridian rings
    const createRing = (radius: number, color: number, rotation: [number, number, number]) => {
      const ringGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
      }
      ringGeo.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
      const ring = new THREE.Line(ringGeo, ringMat);
      ring.rotation.set(...rotation);
      return ring;
    };

    // Equator (XY plane in standard Math, which is XZ in Three.js where Y is up)
    sphereGroup.add(createRing(1, 0x06b6d4, [Math.PI / 2, 0, 0])); // Equator
    sphereGroup.add(createRing(1, 0xa855f7, [0, 0, 0]));           // Z-Y meridian
    sphereGroup.add(createRing(1, 0x3b82f6, [0, Math.PI / 2, 0])); // Z-X meridian

    // 4. Coordinate Axes
    // Three.js axes: Y is up (which corresponds to Quantum Z: |0> is +Y, |1> is -Y)
    const axisMatZ = new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2 });
    const axisMatX = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
    const axisMatY = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 2 });

    const createAxisLine = (start: [number, number, number], end: [number, number, number], mat: THREE.Material) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      ]);
      return new THREE.Line(geo, mat);
    };

    sphereGroup.add(createAxisLine([0, -1.35, 0], [0, 1.35, 0], axisMatZ)); // Quantum Z axis (|0> up, |1> down)
    sphereGroup.add(createAxisLine([-1.35, 0, 0], [1.35, 0, 0], axisMatX)); // Quantum X axis
    sphereGroup.add(createAxisLine([0, 0, -1.35], [0, 0, 1.35], axisMatY)); // Quantum Y axis

    // 5. State Vector Arrow |ψ⟩
    // Converting Quantum angles (θ: 0 at +Z, π at -Z; φ: azimuth from X towards Y)
    // In Three.js: Quantum Z is +Y, Quantum X is +X, Quantum Y is +Z
    const dir = new THREE.Vector3(
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi)
    ).normalize();

    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 1, 0x38bdf8, 0.15, 0.08);
    sphereGroup.add(arrow);
    arrowRef.current = arrow;

    // Glowing tip sphere at |ψ⟩
    const tipGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2
    });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.copy(dir);
    sphereGroup.add(tipMesh);
    tipRef.current = tipMesh;

    // Interactive mouse drag to rotate the sphere view
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (!interactiveRef.current) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      sphereGroup.rotation.y += deltaX * 0.01;
      sphereGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support for mobile and tablet drag
    const onTouchStart = (e: TouchEvent) => {
      if (!interactiveRef.current || e.touches.length === 0) return;
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      sphereGroup.rotation.y += deltaX * 0.01;
      sphereGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation loop: checks autoRotateRef.current on every frame
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotateRef.current && !isDragging) {
        sphereGroup.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update arrow when theta or phi changes
  useEffect(() => {
    if (!arrowRef.current || !tipRef.current) return;
    const dir = new THREE.Vector3(
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi)
    ).normalize();

    arrowRef.current.setDirection(dir);
    arrowRef.current.setLength(1, 0.15, 0.08);
    tipRef.current.position.copy(dir);
  }, [theta, phi]);

  // Dynamic quantum state computation based on orbit inputs (theta, phi)
  const alpha = Math.cos(theta / 2);
  const betaMag = Math.sin(theta / 2);
  // Normalize phi to [0, 2π)
  const normPhi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const phiPiRatio = normPhi / Math.PI;

  const isNearZero = Math.abs(theta) < 0.08;
  const isNearOne = Math.abs(theta - Math.PI) < 0.08;
  const isSouthActive = theta > Math.PI / 2;
  const isNorthActive = theta <= Math.PI / 2;

  // Format the equation dynamically based on orbit inputs
  const formatDynamicEquation = () => {
    if (isNearZero) {
      return '|ψ⟩ = 1.000|0⟩ + 0.000|1⟩';
    }
    if (isNearOne) {
      return '|ψ⟩ = 0.000|0⟩ + 1.000|1⟩';
    }

    // Special exact / symmetry phase points
    if (Math.abs(normPhi) < 0.04 || Math.abs(normPhi - 2 * Math.PI) < 0.04) {
      return `|ψ⟩ = ${alpha.toFixed(3)}|0⟩ + ${betaMag.toFixed(3)}|1⟩`;
    }
    if (Math.abs(normPhi - Math.PI) < 0.04) {
      return `|ψ⟩ = ${alpha.toFixed(3)}|0⟩ - ${betaMag.toFixed(3)}|1⟩`;
    }
    if (Math.abs(normPhi - Math.PI / 2) < 0.04) {
      return `|ψ⟩ = ${alpha.toFixed(3)}|0⟩ + ${betaMag.toFixed(3)}i|1⟩`;
    }
    if (Math.abs(normPhi - 3 * Math.PI / 2) < 0.04) {
      return `|ψ⟩ = ${alpha.toFixed(3)}|0⟩ - ${betaMag.toFixed(3)}i|1⟩`;
    }

    return `|ψ⟩ = ${alpha.toFixed(3)}|0⟩ + (${betaMag.toFixed(3)}·e^(${phiPiRatio.toFixed(2)}πi))|1⟩`;
  };

  const dynamicEquation = formatDynamicEquation();

  return (
    <div className={`flex flex-col w-full h-full overflow-hidden ${className}`}>
      {/* 3D Orbit Viewport - clean, unobstructed canvas */}
      <div className="relative flex-1 w-full min-h-[260px] overflow-hidden">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* Below the Orbit: Active Pole Controls (|0⟩, |1⟩) & Dynamic State Equation */}
      <div className="w-full bg-slate-950/95 border-t border-slate-800/90 px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 select-none">
        {/* Left: Active Pole Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">Poles:</span>

          {/* |0⟩ (Z-North) Pole */}
          <button
            type="button"
            onClick={() => onSelectState?.('0')}
            className={`text-xs font-mono flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all ${
              isNorthActive
                ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-850'
            } ${onSelectState ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''}`}
            title="Click to activate Ground state |0⟩ (Z-North)"
          >
            <span className={`w-2 h-2 rounded-full bg-cyan-400 inline-block ${isNorthActive ? 'shadow-[0_0_8px_#22d3ee] animate-pulse' : ''}`} />
            <span className="font-semibold">|0⟩ (Z-North)</span>
            <span className={`text-[10px] font-sans px-1.5 py-0.2 rounded font-medium ${
              isNorthActive ? 'bg-cyan-500/25 text-cyan-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {isNorthActive ? 'Active' : 'Ground'}
            </span>
          </button>

          {/* |1⟩ (Z-South) Pole */}
          <button
            type="button"
            onClick={() => onSelectState?.('1')}
            className={`text-xs font-mono flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all ${
              isSouthActive
                ? 'bg-purple-950/90 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.25)] ring-1 ring-purple-400/50'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-purple-400 hover:text-purple-300 hover:bg-slate-850'
            } ${onSelectState ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''}`}
            title="Click to activate Excited state |1⟩ (Z-South)"
          >
            <span className={`w-2 h-2 rounded-full bg-purple-400 inline-block ${isSouthActive ? 'shadow-[0_0_8px_#c084fc] animate-pulse' : 'shadow-[0_0_6px_#a855f7]'}`} />
            <span className="font-semibold">|1⟩ (Z-South)</span>
            <span className={`text-[10px] font-sans px-1.5 py-0.2 rounded font-medium ${
              isSouthActive ? 'bg-purple-500/25 text-purple-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {isSouthActive ? 'Active' : 'Excited'}
            </span>
          </button>
        </div>

        {/* Right: Dynamic State Equation derived from Orbit Inputs */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
            <span className="text-xs font-mono font-bold text-purple-300 tracking-wide">
              {dynamicEquation}
            </span>
            <span className="text-[11px] font-mono text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-700 sm:pl-2.5 pt-0.5 sm:pt-0">
              θ={(theta * 180 / Math.PI).toFixed(1)}° · φ={(phi * 180 / Math.PI).toFixed(1)}°
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
