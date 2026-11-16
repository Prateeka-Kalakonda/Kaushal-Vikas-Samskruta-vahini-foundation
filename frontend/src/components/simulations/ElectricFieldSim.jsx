import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ElectricFieldSim = ({ params }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const chargesRef = useRef([]);
  const arrowGroupRef = useRef(null);

  useEffect(() => {
    // 1. INITIAL SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(window.document.documentElement.classList.contains('dark') ? 0x050505 : 0xeff6ff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 2. LIGHTING
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 3. CHARGE SPHERES
    const geo = new THREE.SphereGeometry(0.5, 32, 32);
    const c1 = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0x2563eb, emissive: 0x2563eb, emissiveIntensity: 0.3 }));
    const c2 = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 0.3 }));
    scene.add(c1);
    scene.add(c2);
    chargesRef.current = [c1, c2];

    // 4. VECTOR FIELD
    const arrowGroup = new THREE.Group();
    scene.add(arrowGroup);
    arrowGroupRef.current = arrowGroup;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // 5. DYNAMIC UPDATES (Slider Changes)
  useEffect(() => {
    if (!chargesRef.current.length) return;
    const [c1, c2] = chargesRef.current;
    const dist = params.distance || 4;
    const strength = params.strength || 1;

    // Update Charge Positions
    c1.position.x = -(dist / 2);
    c2.position.x = (dist / 2);

    // Update Scales
    const scale = 0.5 + (strength * 0.5);
    c1.scale.setScalar(scale);
    c2.scale.setScalar(scale);

    // Rebuild Vector Field Arrows
    const group = arrowGroupRef.current;
    group.clear();
    
    const gridSize = 8;
    const spacing = 2;
    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let z = -gridSize; z <= gridSize; z += spacing) {
        const origin = new THREE.Vector3(x, 0, z);
        
        // Calculate force vector
        const v1 = new THREE.Vector3().subVectors(origin, c1.position);
        const d1 = v1.lengthSq();
        v1.normalize().divideScalar(d1 || 1);

        const v2 = new THREE.Vector3().subVectors(c2.position, origin);
        const d2 = v2.lengthSq();
        v2.normalize().divideScalar(d2 || 1);

        const finalDir = new THREE.Vector3().addVectors(v1, v2).normalize();
        const arrow = new THREE.ArrowHelper(finalDir, origin, 1, 0x64748b, 0.2, 0.1);
        group.add(arrow);
      }
    }
  }, [params]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default ElectricFieldSim;