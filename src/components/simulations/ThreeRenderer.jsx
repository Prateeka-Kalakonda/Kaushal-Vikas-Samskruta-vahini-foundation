import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeRenderer = ({ config, params }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // 1. SETUP SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Slate-50

    // 2. SETUP CAMERA
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. SETUP RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 4. ADD LIGHTING
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // 5. CREATE OBJECT (Example: A sphere representing a charge)
    const geometry = new THREE.SphereGeometry(params.size || 1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6 }); // Blue-500
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 6. ANIMATION LOOP
    const animate = () => {
      requestAnimationFrame(animate);
      // Rotation speed based on a param
      mesh.rotation.y += (params.rotationSpeed || 0.01);
      // Size update
      mesh.scale.setScalar(params.size || 1);
      renderer.render(scene, camera);
    };
    animate();

    // CLEANUP
    return () => {
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [params]); // Re-run when sliders change

  return <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" />;
};

export default ThreeRenderer;