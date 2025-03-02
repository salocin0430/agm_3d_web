import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const ArchitectureModel = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Crea una geometría de una esfera
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    // Crea un material de color azul para la esfera
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    // Crea una malla con la geometría y el material
    const sphere = new THREE.Mesh(geometry, material);
    // Agrega la esfera a la escena
    scene.add(sphere);

    // Posiciona la cámara
    camera.position.z = 5;

    // Función de renderizado
    const animate = () => {
      requestAnimationFrame(animate);
      // Rota la esfera en el eje Y
      sphere.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="architecture-model" />;
};
