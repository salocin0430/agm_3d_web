import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

/**
 * Componente para renderizar un modelo 3D en un contenedor
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.object - Objeto 3D a renderizar (opcional)
 * @param {string} props.modelUrl - URL del modelo a cargar (opcional)
 * @param {string} props.modelType - Tipo de modelo ('gltf', 'obj', etc.)
 * @param {Object} props.options - Opciones de configuración
 * @param {boolean} props.options.autoRotate - Activar rotación automática
 * @param {Array} props.options.cameraPosition - Posición inicial de la cámara [x, y, z]
 * @param {string} props.options.backgroundColor - Color de fondo
 */
const ModelViewer3D = ({ 
  object, 
  modelUrl, 
  modelType,
  options = {
    autoRotate: true,
    cameraPosition: [0, 2, 5],
    backgroundColor: '#f5f5f5'
  }
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  // Inicializar el visor 3D
  useEffect(() => {
    if (!containerRef.current) return;

    // Limpiar cualquier renderizador existente
    if (rendererRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    // Obtener dimensiones del contenedor
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Crear escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(options.backgroundColor || '#f5f5f5');
    
    // Crear cámara
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const cameraPos = options.cameraPosition || [0, 2, 5];
    camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
    
    // Crear renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    
    // Crear controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    // Añadir iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Crear un objeto de carga mientras se carga el modelo
    const loadingGeometry = new THREE.SphereGeometry(1, 32, 32);
    const loadingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3366ff,
      roughness: 0.7,
      metalness: 0.2,
      transparent: true,
      opacity: 0.7
    });
    const loadingObject = new THREE.Mesh(loadingGeometry, loadingMaterial);
    scene.add(loadingObject);

    // Función para animar el objeto de carga
    const animateLoading = () => {
      if (loadingObject) {
        loadingObject.rotation.y += 0.03;
        loadingObject.rotation.x += 0.01;
      }
    };

    // Función para cargar el modelo
    const loadModel = () => {
      // Si se proporciona un objeto directamente
      if (object) {
        console.log("Usando objeto proporcionado directamente");
        
        // Clonar el objeto para evitar modificar el original
        let displayObject;
        try {
          displayObject = object.clone();
        } catch (error) {
          console.error("Error al clonar el objeto:", error);
          
          // Si falla, crear un objeto simple como respaldo
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({ color: 0x3366ff });
          displayObject = new THREE.Mesh(geometry, material);
        }
        
        // Eliminar el objeto de carga
        scene.remove(loadingObject);
        
        // Centrar y escalar el objeto
        const box = new THREE.Box3().setFromObject(displayObject);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Centrar el objeto
        displayObject.position.sub(center);
        
        // Escalar el objeto para que se ajuste a la vista
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 2 / maxDim;
          displayObject.scale.multiplyScalar(scale);
        }
        
        // Añadir el objeto a la escena
        scene.add(displayObject);
        
        // Activar rotación automática si está habilitada
        if (options.autoRotate) {
          displayObject.userData.shouldRotate = true;
        }
        
        setIsLoading(false);
        setLoadingProgress(100);
      }
      // Si se proporciona una URL de modelo
      else if (modelUrl) {
        console.log("Cargando modelo desde URL:", modelUrl);
        
        const fileExtension = modelUrl.split('.').pop().toLowerCase();
        const type = modelType || fileExtension;
        
        // Cargar el modelo según su tipo
        if (type === 'gltf' || type === 'glb') {
          const loader = new GLTFLoader();
          loader.load(
            modelUrl,
            (gltf) => {
              // Eliminar el objeto de carga
              scene.remove(loadingObject);
              
              const model = gltf.scene;
              
              // Centrar y escalar el modelo
              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              
              // Centrar el modelo
              model.position.sub(center);
              
              // Escalar el modelo para que se ajuste a la vista
              const maxDim = Math.max(size.x, size.y, size.z);
              if (maxDim > 0) {
                const scale = 2 / maxDim;
                model.scale.multiplyScalar(scale);
              }
              
              // Añadir el modelo a la escena
              scene.add(model);
              
              // Activar rotación automática si está habilitada
              if (options.autoRotate) {
                model.userData.shouldRotate = true;
              }
              
              setIsLoading(false);
              setLoadingProgress(100);
              console.log("Modelo GLTF cargado correctamente");
            },
            (xhr) => {
              const progress = xhr.loaded / xhr.total * 100;
              setLoadingProgress(progress);
              console.log(progress + '% cargado');
            },
            (error) => {
              console.error('Error al cargar el modelo GLTF:', error);
              setError('Error al cargar el modelo');
              setIsLoading(false);
            }
          );
        } else if (type === 'obj') {
          // Cargar OBJ
          const loader = new OBJLoader();
          loader.load(
            modelUrl,
            (obj) => {
              // Eliminar el objeto de carga
              scene.remove(loadingObject);
              
              // Centrar y escalar el modelo
              const box = new THREE.Box3().setFromObject(obj);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              
              // Centrar el modelo
              obj.position.sub(center);
              
              // Escalar el modelo para que se ajuste a la vista
              const maxDim = Math.max(size.x, size.y, size.z);
              if (maxDim > 0) {
                const scale = 2 / maxDim;
                obj.scale.multiplyScalar(scale);
              }
              
              // Añadir el modelo a la escena
              scene.add(obj);
              
              // Activar rotación automática si está habilitada
              if (options.autoRotate) {
                obj.userData.shouldRotate = true;
              }
              
              setIsLoading(false);
              setLoadingProgress(100);
              console.log("Modelo OBJ cargado correctamente");
            },
            (xhr) => {
              const progress = xhr.loaded / xhr.total * 100;
              setLoadingProgress(progress);
              console.log(progress + '% cargado');
            },
            (error) => {
              console.error('Error al cargar el modelo OBJ:', error);
              setError('Error al cargar el modelo');
              setIsLoading(false);
            }
          );
        } else {
          console.error("Formato de modelo no soportado:", type);
          setError(`Formato de modelo no soportado: ${type}`);
          setIsLoading(false);
        }
      } else {
        // Si no hay objeto ni URL, mostrar un cubo simple
        console.log("No se proporcionó objeto ni URL, mostrando objeto por defecto");
        
        // Crear un cubo simple
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
          color: 0x3366ff,
          roughness: 0.7,
          metalness: 0.2
        });
        const cube = new THREE.Mesh(geometry, material);
        
        // Eliminar el objeto de carga
        scene.remove(loadingObject);
        
        // Añadir el cubo a la escena
        scene.add(cube);
        
        // Activar rotación automática si está habilitada
        if (options.autoRotate) {
          cube.userData.shouldRotate = true;
        }
        
        setIsLoading(false);
        setLoadingProgress(100);
      }
    };

    // Función de animación
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (controls) {
        controls.update();
      }
      
      // Animar el objeto de carga si está cargando
      if (isLoading && loadingObject) {
        animateLoading();
      }
      
      // Animar cualquier objeto que tenga la propiedad shouldRotate
      scene.traverse((object) => {
        if (object.userData && object.userData.shouldRotate) {
          object.rotation.y += 0.01;
        }
      });
      
      renderer.render(scene, camera);
    };

    // Iniciar animación
    animate();
    
    // Cargar el modelo
    loadModel();
    
    // Guardar referencias
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    
    // Manejar cambios de tamaño
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Limpiar al desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current && containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Limpiar referencias
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, [object, modelUrl, modelType, options]);

  return (
    <div className="model-viewer-container" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {isLoading && (
        <div className="model-viewer-loading">
          <div className="model-viewer-progress">
            <div className="model-viewer-progress-bar" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <div className="model-viewer-progress-text">
            {loadingProgress.toFixed(0)}%
          </div>
        </div>
      )}
      {error && (
        <div className="model-viewer-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ModelViewer3D; 