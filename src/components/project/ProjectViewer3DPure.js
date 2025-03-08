import React, { useRef, useEffect, useState, useCallback, useContext } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './ProjectViewer3D.css';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import LogoWhite from '../../assets/images/logo_white.png';
import { ContextProvider } from '../../contexts/ContextProvider';
import { useTranslation } from 'react-i18next';
import { IoClose } from 'react-icons/io5';
import { FaSun, FaMoon } from 'react-icons/fa';
import { MdWbTwilight } from 'react-icons/md';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ProjectConfigService } from '../../services/ProjectConfigService';
// Importar el nuevo componente
import ModelViewer3D from '../common/ModelViewer3D';

export default function ProjectViewer3DPure({ modelUrl, projectId, onClose }) {
  // Usar el contexto para acceder al modo de página
  const { modePage } = useContext(ContextProvider) || { modePage: 'dark' };
  const { t } = useTranslation();
  
  // Estados y referencias
  const containerRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(12); // Hora del día (0-24)
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Referencias para mantener el estado de Three.js
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const transformControlsRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const composerRef = useRef(null);
  const objectsRef = useRef({});
  const animationIdRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const mouseClickHandlerRef = useRef(null);
  const outlinePassRef = useRef(null);
  const [projectConfig, setProjectConfig] = useState(null);
  // Añadir un nuevo estado para rastrear todos los objetos cargados
  const [loadedObjects, setLoadedObjects] = useState([]);
  
  // Añadir un nuevo estado para el material del suelo
  const [floorMaterial, setFloorMaterial] = useState('marble'); // Cambiado de 'wood' a 'marble'
  
  // Agregar nuevos estados para el control de teclado
  const [keysPressed, setKeysPressed] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  });
  const [cameraSpeed, setCameraSpeed] = useState(0.1); // Velocidad de movimiento de la cámara
  const [keyboardControlEnabled, setKeyboardControlEnabled] = useState(false); // Inicialmente desactivado
  
  // Agregar estas referencias para el modal (justo después de las otras referencias)
  const modalContainerRef = useRef(null);
  const modalRendererRef = useRef(null);
  const modalSceneRef = useRef(null);
  const modalCameraRef = useRef(null);
  const modalControlsRef = useRef(null);
  
  // Función para añadir logs
  const addLog = (message) => {
    console.log(message);
  };
  
  // Definir funciones de utilidad
  const resetView = () => {
    if (cameraRef.current && orbitControlsRef.current) {
      cameraRef.current.position.set(0, 2, 5); // Posición más cercana
      orbitControlsRef.current.target.set(0, 1, 0); // Apuntar más bajo
      orbitControlsRef.current.update();
    }
  };
  
  const resetObjectPosition = () => {
    console.log("Resetear posición del objeto");
    if (selectedObject && selectedObject.userData.originalPosition) {
      selectedObject.position.set(
        selectedObject.userData.originalPosition[0],
        selectedObject.userData.originalPosition[1],
        selectedObject.userData.originalPosition[2]
      );
      
      if (selectedObject.userData.originalRotation) {
        selectedObject.rotation.set(
          selectedObject.userData.originalRotation[0],
          selectedObject.userData.originalRotation[1],
          selectedObject.userData.originalRotation[2]
        );
      }
      
      if (selectedObject.userData.originalScale) {
        if (typeof selectedObject.userData.originalScale === 'number') {
          selectedObject.scale.set(
            selectedObject.userData.originalScale,
            selectedObject.userData.originalScale,
            selectedObject.userData.originalScale
          );
        } else {
          selectedObject.scale.set(
            selectedObject.userData.originalScale[0],
            selectedObject.userData.originalScale[1],
            selectedObject.userData.originalScale[2]
          );
        }
      }
    }
  };
  
  const changeTransformMode = (mode) => {
    console.log(`Cambiando modo de transformación a: ${mode}`);
    setTransformMode(mode);
    
    if (transformControlsRef.current) {
      // Guardar el objeto seleccionado actualmente
      const currentObject = transformControlsRef.current.object;
      
      // Desconectar los controles
      transformControlsRef.current.detach();
      
      // Cambiar el modo
      transformControlsRef.current.setMode(mode);
      
      // Configurar los ejes visibles según el modo
      if (mode === 'translate') {
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = false; // Deshabilitar movimiento vertical
        transformControlsRef.current.showZ = true;
      } else if (mode === 'rotate') {
        transformControlsRef.current.showX = false;
        transformControlsRef.current.showY = true; // Solo permitir rotación en Y
        transformControlsRef.current.showZ = false;
      } else if (mode === 'scale') {
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = true;
      }
      
      // Volver a conectar los controles si había un objeto seleccionado
      if (currentObject) {
        setTimeout(() => {
          try {
            transformControlsRef.current.attach(currentObject);
            
            // Forzar una actualización del renderizador
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
          } catch (error) {
            console.error("Error al reajuntar controles después de cambiar el modo:", error);
          }
        }, 50);
      }
      
      console.log(`Modo de transformación cambiado a: ${mode}`);
    } else {
      console.warn("No se encontraron controles de transformación");
    }
  };
  
  // Función para crear un modelo de respaldo
  const createFallbackModel = useCallback((position) => {
    if (!sceneRef.current) return null;
    
    // Crear una geometría simple (cubo)
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    
    // Configurar posición
    cube.position.set(position[0], position[1] + 1, position[2]);
    
    // Configurar sombras
    cube.castShadow = true;
    cube.receiveShadow = true;
    
    // Añadir a la escena
    sceneRef.current.add(cube);
    
    return cube;
  }, []);
  
  // Función auxiliar para verificar si un objeto contiene una malla específica
  const containsMesh = useCallback((object, mesh) => {
    let found = false;
    object.traverse((child) => {
      if (child === mesh) {
        found = true;
      }
    });
    return found;
  }, []);
  
  // Mejorar la selección de objetos usando useCallback
  const selectObject = useCallback((object) => {
    // Si ya hay un objeto seleccionado, quitar el contorno
    if (selectedObject) {
      // Quitar el contorno del objeto anterior
      if (outlinePassRef.current) {
        outlinePassRef.current.selectedObjects = [];
      }
    }
    
    // Actualizar el estado
    setSelectedObject(object);
    
    // Añadir el contorno al nuevo objeto seleccionado
    if (object && outlinePassRef.current) {
      outlinePassRef.current.selectedObjects = [object];
      console.log(`Objeto seleccionado: ${object.userData.id || 'desconocido'}`);
    }
    
    // Adjuntar los controles al objeto seleccionado
    if (object && transformControlsRef.current) {
      transformControlsRef.current.attach(object);
    } else if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
  }, [selectedObject]);
  
  // Definir la función onMouseClick como useCallback
  const onMouseClick = useCallback((event) => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
    
    // Verificar si el clic fue en el panel de detalles o en alguno de sus elementos
    const detailsPanel = document.querySelector('.details-panel');
    if (detailsPanel) {
      // Verificar si el clic fue dentro del panel de detalles
      if (detailsPanel.contains(event.target)) {
        // Si el clic fue en el panel de detalles, no hacer nada
        return;
      }
    }
    
    // Verificar si el clic fue en los botones de modo de transformación
    const transformButtons = document.querySelectorAll('.transform-controls button, .transform-mode-button');
    for (const button of transformButtons) {
      if (button.contains(event.target)) {
        // Si el clic fue en un botón de modo, no afectar la selección
        return;
      }
    }
    
    // Calcular posición del mouse normalizada
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Lanzar rayo desde la cámara
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    // Obtener solo los objetos interactivos para intersección
    const selectableObjects = [];
    sceneRef.current.traverse((object) => {
      // Solo incluir mallas que sean interactivas o parte de un objeto interactivo
      if (object.isMesh) {
        // Verificar si el objeto es interactivo directamente
        if (object.userData.interactive === true) {
          selectableObjects.push(object);
        }
        // O si es parte de un objeto interactivo (su padre)
        else if (object.parent && object.parent.userData && object.parent.userData.interactive === true) {
          selectableObjects.push(object);
        }
      }
    });
    
    // Calcular intersecciones
    const intersects = raycasterRef.current.intersectObjects(selectableObjects, false);
    
    if (intersects.length > 0) {
      // Encontrar el objeto raíz (puede ser el padre del objeto intersectado)
      let selectedObj = intersects[0].object;
      
      // Si el objeto es parte de un grupo, seleccionar el grupo
      while (selectedObj.parent && selectedObj.parent !== sceneRef.current && selectedObj.parent.type !== 'Scene') {
        if (selectedObj.parent.userData && selectedObj.parent.userData.id) {
          selectedObj = selectedObj.parent;
          break;
        }
        selectedObj = selectedObj.parent;
      }
      
      // Seleccionar el objeto
      selectObject(selectedObj);
    } else {
      // Si no hay intersección, deseleccionar el objeto actual
      selectObject(null);
    }
  }, [selectObject, containsMesh]);
  
  // Añadir evento
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Eliminar el manejador anterior si existe
      if (mouseClickHandlerRef.current) {
        container.removeEventListener('click', mouseClickHandlerRef.current);
      }
      
      // Crear y guardar el nuevo manejador
      mouseClickHandlerRef.current = onMouseClick;
      
      // Añadir el evento
      container.addEventListener('click', mouseClickHandlerRef.current);
      
      // Limpiar al desmontar
      return () => {
        if (mouseClickHandlerRef.current) {
          container.removeEventListener('click', mouseClickHandlerRef.current);
        }
      };
    }
  }, [onMouseClick]);
  
  // Inicializar la escena
  const initScene = useCallback(async () => {
    console.log("Inicializando escena...");
    
    // Cargar la configuración primero
    const config = await ProjectConfigService.getProjectConfig(projectId);
    console.log("Configuración cargada para proyecto:", projectId, config);
    
    // Guardar la configuración en el estado
    setProjectConfig(config);
    
    const container = containerRef.current;
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Crear escena con fondo más claro
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;
    
    // Crear cámara con un campo de visión más estrecho para interiores
    const camera = new THREE.PerspectiveCamera(
      60, // FOV más estrecho (antes 75)
      container.clientWidth / container.clientHeight,
      0.1,
      100 // Reducir el far plane (antes 1000)
    );
    // Posicionar la cámara más cerca para interiores
    camera.position.set(0, 8, 10); // Antes (0, 5, 10)
    cameraRef.current = camera;
    
    // Crear renderer con mejor calidad
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Configurar iluminación más natural
    // Luz ambiental con mayor intensidad para interiores
    const ambientLight = new THREE.AmbientLight(0xffffff, 3); // Aumentado de 0.3 a 0.5
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);
    
    // Luz direccional (sol) con menor intensidad
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Reducido de 1.0 a 0.8
    directionalLight.position.set(5, 5, 5); // Reducido de (10, 10, 10)
    directionalLight.castShadow = true;
    // Reducir el tamaño de las sombras para mejor rendimiento
    directionalLight.shadow.mapSize.width = 1024; // Reducido de 2048
    directionalLight.shadow.mapSize.height = 1024; // Reducido de 2048
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 30; // Reducido de 50
    directionalLight.shadow.camera.left = -10; // Reducido de -20
    directionalLight.shadow.camera.right = 10; // Reducido de 20
    directionalLight.shadow.camera.top = 10; // Reducido de 20
    directionalLight.shadow.camera.bottom = -10; // Reducido de -20
    directionalLight.name = 'mainLight';
    scene.add(directionalLight);
    
    // Crear suelo más pequeño para interiores
    const createElegantFloor = () => {
      if (!sceneRef.current) return;
      
      // Cargar textura según los archivos descargados
      const textureLoader = new THREE.TextureLoader();
      
      // Mapeo de las texturas descargadas con rutas absolutas
      const floorTextures = {
        marble: {
          baseColor: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_BaseColor.jpg',
          normal: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_Normal.png',
          roughness: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_Roughness.jpg',
          metallic: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_Metallic.jpg',
          displacement: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_Displacement.tiff',
        },
        wood: {
          baseColor: '/textures/floor/wood/Planks037A_2K-JPG_Color.jpg',
          normal: '/textures/floor/wood/Planks037A_2K-JPG_NormalDX.jpg',
          roughness: '/textures/floor/wood/Planks037A_2K-JPG_Roughness.jpg',
          ao: '/textures/floor/wood/Planks037A_2K-JPG_AmbientOcclusion.jpg',
        },
        grass: {
          baseColor: '/textures/floor/grass/Grass001_1K-JPG_Color.jpg',
          normal: '/textures/floor/grass/Grass001_1K-JPG_NormalDX.jpg',
          roughness: '/textures/floor/grass/Grass001_1K-JPG_Roughness.jpg',
          ao: '/textures/floor/grass/Grass001_1K-JPG_AmbientOcclusion.jpg',
          displacement: '/textures/floor/grass/Grass001_1K-JPG_Displacement.jpg',
        }
      };
      
      // Seleccionar textura según el tipo de proyecto
      const projectType = projectId.includes('house') || projectId.includes('apartment') ? 'residential' : 'commercial';
      const selectedTexture = projectType === 'residential' ? floorTextures.wood : floorTextures.marble;
      
      // Cargar texturas
      const baseColorTexture = textureLoader.load(selectedTexture.baseColor);
      const normalTexture = textureLoader.load(selectedTexture.normal);
      const roughnessTexture = textureLoader.load(selectedTexture.roughness);
      const aoTexture = selectedTexture.ao ? textureLoader.load(selectedTexture.ao) : null;
      const displacementTexture = selectedTexture.displacement ? textureLoader.load(selectedTexture.displacement) : null;
      
      // Configurar repetición de texturas - aumentar para suelo más pequeño
      [baseColorTexture, normalTexture, roughnessTexture, aoTexture, displacementTexture].forEach(texture => {
        if (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          // Usar repetición más alta para el pasto para que se vea más detallado
          const repeatFactor = selectedTexture === floorTextures.grass ? 4 : 2;
          texture.repeat.set(repeatFactor, repeatFactor);
        }
      });
      
      // Crear material PBR
      const floorMaterial = new THREE.MeshStandardMaterial({
        map: baseColorTexture,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture,
        roughness: 0.9,
        aoMap: aoTexture,
        envMapIntensity: 0.3,
        side: THREE.DoubleSide,
        // Asegurarse de que el suelo no tenga emisividad por defecto
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0
      });
      
      // Crear geometría del suelo más pequeña
      const floorGeometry = new THREE.PlaneGeometry(20, 20, 50, 50); // Reducido de 50,50,100,100
      
      // Crear malla
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      
      // Rotar y posicionar el suelo
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      
      // Configurar sombras
      floor.receiveShadow = true;
      
      // Guardar referencia para interactividad
      floor.userData = {
        id: 'floor',
        name: 'Suelo',
        interactive: false,
        description: 'Suelo (no interactivo)'
      };
      
      // Añadir a la escena
      sceneRef.current.add(floor);
      
      return floor;
    };
    
    createElegantFloor();
    
    // Crear entorno de cielo HDRI
    const createSkyEnvironment = () => {
      if (!sceneRef.current || !rendererRef.current) return;
      
      // Cargar textura HDR para el fondo y la iluminación
      const rgbeLoader = new RGBELoader();
      rgbeLoader.setPath('/textures/environment/');
      
      // Cargar el archivo HDR
      rgbeLoader.load('venice_sunset_1k.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        // Configurar el fondo y el entorno
        sceneRef.current.background = texture;
        sceneRef.current.environment = texture;
        
        // Actualizar materiales para que reflejen el entorno
        sceneRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            //child.material.envMap = texture;
            //child.material.needsUpdate = true;
          }
        });
        
        // Configurar el renderer para que maneje correctamente el HDR
        rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
        rendererRef.current.toneMappingExposure = 1.0;
        rendererRef.current.outputEncoding = THREE.sRGBEncoding;
      });
    };
    
    //createSkyEnvironment();
    
    // Mejorar los controles de órbita para una mejor experiencia en interiores
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.1;
    orbitControls.screenSpacePanning = true;
    orbitControls.minDistance = 1; // Reducido de 2 para acercarse más
    orbitControls.maxDistance = 10; // Reducido de 20 para mantener la cámara cerca
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
    orbitControls.target.set(0, 1, 0); // Reducido de (0, 2, 0) para apuntar más bajo
    orbitControlsRef.current = orbitControls;
    
    // Añadir controles de transformación
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
    
    // Configurar los controles para que sean más precisos
    transformControls.setSize(0.7); // Tamaño más pequeño para mejor precisión
    transformControls.showX = true;
    transformControls.showY = true;
    transformControls.showZ = true;
    
    scene.add(transformControls);
    transformControlsRef.current = transformControls;
    
    // Crear raycaster para selección de objetos
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();
    
    // Configurar el compositor de efectos para el contorno
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Crear y configurar el OutlinePass
    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );
    
    // Configurar el aspecto del contorno
    outlinePass.edgeStrength = 3.0;     // Intensidad del borde
    outlinePass.edgeGlow = 0.5;         // Brillo del borde
    outlinePass.edgeThickness = 1.0;    // Grosor del borde
    outlinePass.pulsePeriod = 0;        // Sin pulso
    outlinePass.visibleEdgeColor.set('#ffffff'); // Color del borde (blanco)
    outlinePass.hiddenEdgeColor.set('#888888');  // Color del borde oculto (gris)
    
    composer.addPass(outlinePass);
    
    // Guardar referencias
    composerRef.current = composer;
    outlinePassRef.current = outlinePass;
    
    // Función de animación optimizada
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      try {
        // Actualizar controles de órbita solo si están activos
        if (orbitControlsRef.current && orbitControlsRef.current.enabled) {
          orbitControlsRef.current.update();
        }
        
        // Asegurarse de que los controles de transformación estén visibles si hay un objeto seleccionado
        if (selectedObject && transformControlsRef.current && !transformControlsRef.current.object) {
          transformControlsRef.current.attach(selectedObject);
        }
        
        // Renderizar la escena con el compositor para incluir el efecto de contorno
        if (composerRef.current && sceneRef.current && cameraRef.current) {
          composerRef.current.render();
        } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
          // Fallback al renderizado normal si el compositor no está disponible
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      } catch (error) {
        console.error("Error en el bucle de animación:", error);
      }
    };
    
    // Iniciar animación
    animate();
    
    // Manejar redimensionamiento
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    console.log("Escena inicializada correctamente");
    
    // Cargar objetos pasando la configuración directamente
    loadProjectObjects(config);
  }, [projectId]);
  
  // Añadir una función para aplicar mapas y propiedades de materiales
  const applyMaterialProperties = useCallback((object, objectData) => {
    if (!object || !objectData) return;
    
    // Verificar si hay configuraciones de mapas o propiedades de materiales
    const hasMaps = objectData.maps && Object.values(objectData.maps).some(map => map);
    const hasProperties = objectData.materialProperties && Object.keys(objectData.materialProperties).length > 0;
    
    if (!hasMaps && !hasProperties) return;
    
    console.log(`Aplicando propiedades de materiales para ${objectData.id}`);
    
    // Cargar texturas si están definidas
    const textureLoader = new THREE.TextureLoader();
    const textures = {};
    
    if (objectData.maps) {
      // Cargar cada mapa definido
      Object.entries(objectData.maps).forEach(([mapType, mapPath]) => {
        if (mapPath) {
          console.log(`Cargando mapa ${mapType} desde ${mapPath} para ${objectData.id}`);
          textures[mapType] = textureLoader.load(mapPath);
        }
      });
    }
    
    // Aplicar texturas y propiedades a los materiales
    object.traverse((child) => {
      if (child.isMesh && child.material) {
        // Manejar tanto materiales individuales como arrays de materiales
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach(material => {
          // Aplicar mapas de texturas si están disponibles
          if (textures.diffuse) {
            material.map = textures.diffuse;
          }
          
          if (textures.normal) {
            material.normalMap = textures.normal;
            
            // Aplicar escala normal si está definida
            if (objectData.materialProperties && objectData.materialProperties.normalScale !== undefined) {
              material.normalScale = new THREE.Vector2(
                objectData.materialProperties.normalScale,
                objectData.materialProperties.normalScale
              );
            }
          }
          
          if (textures.roughness) {
            material.roughnessMap = textures.roughness;
          }
          
          if (textures.metalness) {
            material.metalnessMap = textures.metalness;
          }
          
          if (textures.ao) {
            material.aoMap = textures.ao;
            
            // Aplicar intensidad de oclusión ambiental si está definida
            if (objectData.materialProperties && objectData.materialProperties.aoMapIntensity !== undefined) {
              material.aoMapIntensity = objectData.materialProperties.aoMapIntensity;
            }
          }
          
          if (textures.emissive) {
            material.emissiveMap = textures.emissive;
            material.emissive = new THREE.Color(0xffffff);
            
            // Aplicar intensidad emisiva si está definida
            if (objectData.materialProperties && objectData.materialProperties.emissiveIntensity !== undefined) {
              material.emissiveIntensity = objectData.materialProperties.emissiveIntensity;
            }
          }
          
          // Aplicar propiedades de material si están definidas
          if (objectData.materialProperties) {
            if (objectData.materialProperties.roughness !== undefined) {
              material.roughness = objectData.materialProperties.roughness;
            }
            
            if (objectData.materialProperties.metalness !== undefined) {
              material.metalness = objectData.materialProperties.metalness;
            }
            
            // Aplicar reflectividad si está definida
            if (objectData.materialProperties.reflective === true && sceneRef.current && sceneRef.current.background) {
              material.envMap = sceneRef.current.background;
            }
          }
          
          // Asegurarse de que los cambios se apliquen
          material.needsUpdate = true;
        });
      }
    });
  }, []);
  
  // Modificar la función loadOBJWithMaterials para aplicar propiedades de materiales
  const loadOBJWithMaterials = useCallback((objectData, manager) => {
    return new Promise((resolve, reject) => {
      console.log(`Iniciando carga de OBJ: ${objectData.id} desde ${objectData.path}`);
      
      // Extraer las rutas base
      const mtlBasePath = objectData.mtlPath.substring(0, objectData.mtlPath.lastIndexOf('/') + 1);
      const mtlFileName = objectData.mtlPath.split('/').pop();
      
      const objBasePath = objectData.path.substring(0, objectData.path.lastIndexOf('/') + 1);
      const objFileName = objectData.path.split('/').pop();
      
      console.log(`Ruta base MTL: ${mtlBasePath}, Archivo: ${mtlFileName}`);
      console.log(`Ruta base OBJ: ${objBasePath}, Archivo: ${objFileName}`);
      
      // Primero cargar el archivo MTL
      const mtlLoader = new MTLLoader(manager);
      mtlLoader.setPath(mtlBasePath);
      
      mtlLoader.load(mtlFileName, (materials) => {
        console.log(`Materiales cargados para ${objectData.id}:`, materials);
        
        // Configurar materiales
        materials.preload();
        
        // Luego cargar el archivo OBJ con los materiales
        const objLoader = new OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.setPath(objBasePath);
        
        objLoader.load(objFileName, (object) => {
          console.log(`Objeto OBJ cargado: ${objectData.id}`);
          
          // Configurar posición, rotación y escala
          object.position.set(
            objectData.position[0], 
            objectData.position[1], 
            objectData.position[2]
          );
          
          // Convertir grados a radianes si es necesario
          const rotX = objectData.rotation[0] * (Math.PI / 180);
          const rotY = objectData.rotation[1] * (Math.PI / 180);
          const rotZ = objectData.rotation[2] * (Math.PI / 180);
          
          object.rotation.set(rotX, rotY, rotZ);
          
          object.scale.set(
            objectData.scale[0], 
            objectData.scale[1], 
            objectData.scale[2]
          );
          
          // Configurar materiales y sombras
          object.traverse((child) => {
            if (child.isMesh) {
              // Configurar sombras
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Asegurarse de que los materiales estén bien configurados
              if (child.material) {
                // Configurar para renderizado a doble cara
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    mat.side = THREE.DoubleSide;
                    
                    // Asegurarse de que las texturas se carguen correctamente
                    if (mat.map) {
                      mat.map.encoding = THREE.sRGBEncoding;
                      mat.map.anisotropy = 16;
                      mat.map.needsUpdate = true;
                    }
                  });
                } else {
                  child.material.side = THREE.DoubleSide;
                  
                  // Asegurarse de que las texturas se carguen correctamente
                  if (child.material.map) {
                    child.material.map.encoding = THREE.sRGBEncoding;
                    child.material.map.anisotropy = 16;
                    child.material.map.needsUpdate = true;
                  }
                }
              }
              
              // Marcar como parte del objeto principal
              child.userData = {
                ...child.userData,
                partOf: objectData.id,
                interactive: objectData.interactive === true
              };
            }
          });
          
          // Añadir metadatos
          object.userData = {
            id: objectData.id,
            name: objectData.name || objectData.id,
            type: objectData.type || "Objeto",
            interactive: objectData.interactive === true,
            description: objectData.description || `Modelo ${objectData.name || objectData.id}`,
            price: objectData.price || 0,
            currency: objectData.currency || '€',
            image: objectData.image
          };
          
          // Aplicar propiedades de materiales personalizadas
          applyMaterialProperties(object, objectData);
          
          resolve(object);
        }, 
        // Progreso
        (xhr) => {
          const progress = (xhr.loaded / xhr.total) * 100;
          console.log(`Progreso de carga OBJ ${objectData.id}: ${progress.toFixed(0)}%`);
        }, 
        // Error
        (error) => {
          console.error(`Error cargando OBJ ${objectData.id}:`, error);
          reject(error);
        });
      }, 
      // Progreso MTL
      (xhr) => {
        const progress = (xhr.loaded / xhr.total) * 100;
        console.log(`Progreso de carga MTL ${objectData.id}: ${progress.toFixed(0)}%`);
      }, 
      // Error MTL
      (error) => {
        console.error(`Error cargando MTL ${objectData.id}:`, error);
        reject(error);
      });
    });
  }, [applyMaterialProperties]);
  
  // Modificar loadProjectObjects para usar la nueva función
  const loadProjectObjects = useCallback((config) => {
    console.log("Iniciando carga de objetos del proyecto...");
    
    // Limpiar objetos existentes
    Object.values(objectsRef.current).forEach(obj => {
      if (sceneRef.current) {
        sceneRef.current.remove(obj);
      }
    });
    objectsRef.current = {};
    
    // Reiniciar la lista de objetos cargados
    setLoadedObjects([]);
    
    // Usar un gestor de carga para mejor rendimiento
    const manager = new THREE.LoadingManager();
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      setLoadingProgress(progress);
      console.log(`Progreso general: ${progress.toFixed(0)}% (${itemsLoaded}/${itemsTotal})`);
    };
    
    manager.onLoad = () => {
      console.log("Todos los objetos cargados correctamente");
      setIsLoading(false);
    };
    
    manager.onError = (url) => {
      console.error(`Error cargando: ${url}`);
    };
    
    // Definir los objetos a cargar con mayor escala
    var roomObjects = [
    ];

    // Agregar objetos de la configuración si existe
    if (config) {
      console.log("Usando configuración para cargar objetos:", config);
      
      // Agregar el modelo base si existe
      if (config.baseModel) {
        if (!config.baseModel.hidden) {
          
        
        const baseModel = {
          ...config.baseModel,
          modelUrl: config.baseModel.path,
          interactive: false
        };
        console.log("Añadiendo modelo base (no interactivo):", baseModel);
        roomObjects.push(baseModel);
        }
      }
      
      // Agregar los objetos interactivos
      if (config.objects && Array.isArray(config.objects)) {
        config.objects.forEach(obj => {
          if (obj.hidden === true) {
            return;
          }
          const interactiveObj = {
            ...obj,
            modelUrl: obj.path,
            interactive: obj.interactive !== false
          };
          console.log("Añadiendo objeto interactivo:", interactiveObj);
          roomObjects.push(interactiveObj);
        });
      }
    }
    
    console.log("Objetos a cargar:", roomObjects);
    
    // Cargar cada objeto
    roomObjects.forEach(objectData => {
      console.log(`Cargando objeto: ${objectData.id}, tipo: ${objectData.typeModel}, interactivo: ${objectData.interactive}`);
      
      if (objectData.typeModel === 'glb') {
        const loader = new GLTFLoader(manager);
        loader.load(
          objectData.modelUrl,
          (gltf) => {
            const model = gltf.scene;
            
            // Configurar posición, rotación y escala
            model.position.set(
              objectData.position[0],
              objectData.position[1],
              objectData.position[2]
            );
            
            if (objectData.rotation) {
              model.rotation.set(
                objectData.rotation[0],
                objectData.rotation[1],
                objectData.rotation[2]
              );
            }
            
            if (objectData.scale) {
              if (typeof objectData.scale === 'number') {
                model.scale.set(
                  objectData.scale,
                  objectData.scale,
                  objectData.scale
                );
              } else {
                model.scale.set(
                  objectData.scale[0],
                  objectData.scale[1],
                  objectData.scale[2]
                );
              }
            }
            
            // Añadir metadatos al modelo raíz
            model.userData = {
              ...objectData,
              id: objectData.id,
              interactive: objectData.interactive === true, // Usar === true para asegurar valor booleano
              originalPosition: [...objectData.position],
              originalRotation: objectData.rotation ? [...objectData.rotation] : [0, 0, 0],
              originalScale: objectData.scale,
              image: objectData.image
            };
            
            // Configurar sombras y metadatos para todas las partes del modelo
            model.traverse((child) => { 
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Mejorar materiales
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      mat.side = THREE.DoubleSide;
                      mat.needsUpdate = true;
                    });
                  } else {
                    child.material.side = THREE.DoubleSide;
                    child.material.needsUpdate = true;
                  }
                }
                
                // Marcar como parte del objeto principal y heredar la interactividad
                child.userData = {
                  ...child.userData,
                  partOf: objectData.id,
                  interactive: objectData.interactive === true
                };
              }
            });
            
            // Añadir a la escena
            sceneRef.current.add(model);
            
            // Guardar referencia
            objectsRef.current[objectData.id] = model;
            
            // Añadir a la lista de objetos cargados
            setLoadedObjects(prevObjects => [
              ...prevObjects, 
              {
                id: objectData.id,
                name: objectData.name,
                description: objectData.description,
                type: 'model',
                image: objectData.image
              }
            ]);
            
            console.log(`Objeto cargado: ${objectData.id}`);
          },
          (xhr) => {
            const progress = (xhr.loaded / xhr.total) * 100;
            console.log(`Progreso de carga ${objectData.id}: ${progress.toFixed(0)}%`);
          },
          (error) => {
            console.error(`Error cargando objeto ${objectData.id}:`, error);
            
            // Crear un modelo de respaldo
            const fallbackModel = createFallbackModel(objectData.position);
            if (fallbackModel) {
              fallbackModel.userData = {
                ...objectData,
                name: `${objectData.name} (Respaldo)`,
                description: `${objectData.description} (Error al cargar el modelo original)`,
                originalPosition: [...objectData.position],
                originalRotation: objectData.rotation ? [...objectData.rotation] : [0, 0, 0],
                originalScale: objectData.scale
              };
              
              // Añadir a la escena
              sceneRef.current.add(fallbackModel);
              
              // Guardar referencia
              objectsRef.current[objectData.id] = fallbackModel;
            }
          }
        );
      } else if (objectData.typeModel === 'obj') {
        // Usar la nueva función para cargar OBJ con materiales
        loadOBJWithMaterials(objectData, manager)
          .then(object => {
            // Añadir a la escena
            sceneRef.current.add(object);
            
            // Registrar el objeto
            objectsRef.current[objectData.id] = object;
            
            // Actualizar la lista de objetos cargados
            setLoadedObjects(prev => [...prev, { 
              id: objectData.id, 
              name: objectData.name || objectData.id, 
              type: objectData.type || "Objeto",
              image: objectData.image
            }]);
            
            console.log(`Objeto OBJ ${objectData.id} añadido a la escena`);
          })
          .catch(error => {
            console.error(`Error en la carga de OBJ ${objectData.id}:`, error);
          });
      } else {
        console.warn(`Tipo de modelo desconocido para ${objectData.id}: ${objectData.typeModel}`);
      }
    });
        
    //DELETE
    /*
    try {
      const mtlLoader = new MTLLoader(manager);
      mtlLoader.setPath('/models/22/ChildrenHouse/');
      mtlLoader.load('ChildrenHouse.mtl', (materials) => {
        materials.preload();
        
        const objLoader = new OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/22/ChildrenHouse/');
        objLoader.load('ChildrenHouse.obj', (object) => {
          // Configurar como modelo de fondo con mayor escala
          object.position.set(0, 0, 0);
          object.scale.set(1.2, 1.2, 1.2);
           
          // Marcar explícitamente como no interactivo
          object.userData = {
            id: 'background',
            name: 'Fondo',
            interactive: false,
            description: 'Modelo de fondo (no interactivo)'
          };
          
          // Marcar todas las partes como no interactivas
          object.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData = {
                partOf: 'background',
                interactive: false
              };
            }
          });
          
          // Añadir a la escena
          sceneRef.current.add(object);
          objectsRef.current['background'] = object;
        });
      });
    } catch (error) {
      console.error("Error cargando modelo de fondo:", error);
    }
    */
    setTimePreset('noon');
  }, [createFallbackModel, modelUrl, loadOBJWithMaterials]);
  
  // Definir handleResize fuera del useEffect
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current || !containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);
  
  // Función para limpiar recursos
  const cleanup = useCallback(() => {
    console.log("Limpiando recursos...");
    
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    
    const container = containerRef.current;
    if (container) {
      if (mouseClickHandlerRef.current) {
        container.removeEventListener('click', mouseClickHandlerRef.current);
      }
      
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
      }
    }
    
    if (transformControlsRef.current) {
      transformControlsRef.current.dispose();
    }
    
    if (orbitControlsRef.current) {
      orbitControlsRef.current.dispose();
    }
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    
    if (sceneRef.current) {
      while (sceneRef.current.children.length > 0) {
        const object = sceneRef.current.children[0];
        sceneRef.current.remove(object);
      }
    }
    
    window.removeEventListener('resize', handleResize);
    
    console.log("Recursos limpiados correctamente");
  }, [handleResize]);
  
  // useEffect para inicializar
  useEffect(() => {
    // Inicializar la escena

    // Inicializar la escena
    initScene();
    
    // Añadir evento de redimensionamiento
    window.addEventListener('resize', handleResize);
    
    // Limpiar al desmontar
    return () => {
      cleanup();
    };
  }, [initScene, cleanup, handleResize]);
  
  // Mejorar la inicialización de los controles de transformación
  useEffect(() => {
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      console.log("Configurando controles de transformación");
      
      // Eliminar controles existentes si los hay
      if (transformControlsRef.current) {
        sceneRef.current.remove(transformControlsRef.current);
        transformControlsRef.current.dispose();
      }
      
      // Crear nuevos controles
      const transformControls = new TransformControls(cameraRef.current, rendererRef.current.domElement);
      
      transformControls.showY = false;
      // Configurar eventos
      transformControls.addEventListener('dragging-changed', (event) => {
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = !event.value;
        }
      });
      
      // Evento para actualizar la UI cuando cambia el objeto
      transformControls.addEventListener('objectChange', () => {
        if (selectedObject) {
          // Forzar actualización de la UI
          setSelectedObject({...selectedObject});
        }
      });
      
      // Configurar el modo inicial
      transformControls.setMode(transformMode);
      transformControls.setSize(0.8); // Tamaño ligeramente más pequeño para mejor visibilidad
      
      // Añadir a la escena
      sceneRef.current.add(transformControls);
      transformControlsRef.current = transformControls;
      
      console.log("Controles de transformación configurados correctamente");
    }
  }, [sceneRef.current, cameraRef.current, rendererRef.current]);
  
  // Actualizar el modo cuando cambia
  useEffect(() => {
    if (transformControlsRef.current) {
      console.log(`Actualizando modo de transformación a: ${transformMode}`);
      transformControlsRef.current.setMode(transformMode);
    }
  }, [transformMode]);
  
  // Mejorar la función de iluminación para transiciones más suaves
  const updateLighting = useCallback((time) => {
    if (!sceneRef.current) return;
    
    // Buscar las luces en la escena
    const sunLight = sceneRef.current.children.find(child => 
      child.isDirectionalLight && child.name === 'mainLight'
    );
    
    const ambientLight = sceneRef.current.children.find(child => 
      child.isAmbientLight && child.name === 'ambientLight'
    );
    
    if (sunLight && ambientLight) {
      // Calcular posición del sol basada en la hora del día
      const sunAngle = ((time - 6) / 12) * Math.PI; // 6am = 0, 6pm = PI
      const sunHeight = Math.sin(sunAngle);
      const sunDistance = 20;
      
      sunLight.position.x = Math.cos(sunAngle) * sunDistance;
      sunLight.position.y = Math.max(0.5, sunHeight * sunDistance); // Mantener un mínimo de altura
      sunLight.position.z = Math.sin(sunAngle + Math.PI/4) * sunDistance;
      
      // Definir colores para diferentes momentos del día
      const morningColor = new THREE.Color(0xffd6aa); // Amanecer: cálido
      const noonColor = new THREE.Color(0xffffff);    // Mediodía: blanco
      const eveningColor = new THREE.Color(0xff9e63); // Atardecer: naranja-rojizo
      
      // Definir intensidades para diferentes momentos del día
      const morningIntensity = { sun: 0.8, ambient: 0.3 };
      const noonIntensity = { sun: 1.0, ambient: 0.5 };
      const eveningIntensity = { sun: 0.8, ambient: 0.3 };
      
      // Función para interpolar suavemente entre dos valores
      const lerp = (a, b, t) => a + (b - a) * t;
      
      // Función para interpolar suavemente entre dos colores
      const lerpColor = (colorA, colorB, t) => {
        const result = new THREE.Color();
        result.r = lerp(colorA.r, colorB.r, t);
        result.g = lerp(colorA.g, colorB.g, t);
        result.b = lerp(colorA.b, colorB.b, t);
        return result;
      };
      
      let sunColor, sunIntensity, ambientIntensity;
      
      // Transición suave entre amanecer y mediodía (6-12)
      if (time >= 6 && time < 12) {
        const t = (time - 6) / 6; // 0 a 1 desde 6h a 12h
        sunColor = lerpColor(morningColor, noonColor, t);
        sunIntensity = lerp(morningIntensity.sun, noonIntensity.sun, t);
        ambientIntensity = lerp(morningIntensity.ambient, noonIntensity.ambient, t);
      } 
      // Transición suave entre mediodía y atardecer (12-18)
      else if (time >= 12 && time <= 18) {
        const t = (time - 12) / 6; // 0 a 1 desde 12h a 18h
        sunColor = lerpColor(noonColor, eveningColor, t);
        sunIntensity = lerp(noonIntensity.sun, eveningIntensity.sun, t);
        ambientIntensity = lerp(noonIntensity.ambient, eveningIntensity.ambient, t);
      }
      
      // Aplicar color e intensidad
      sunLight.color.copy(sunColor);
      sunLight.intensity = sunIntensity;
      ambientLight.color.copy(sunColor);
      ambientLight.intensity = ambientIntensity + 2.1;
      
      // Actualizar exposición del renderer para mantener una iluminación consistente
      if (rendererRef.current) {
        rendererRef.current.toneMappingExposure = 1.0;
      }
      
      // Forzar una actualización del renderizado
      if (composerRef.current && sceneRef.current && cameraRef.current) {
        composerRef.current.render();
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }
  }, []);

  // Modificar la función handleTimeChange para usar updateLighting
  const handleTimeChange = useCallback((event) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
    
    // Actualizar la iluminación
    updateLighting(newTime);
    
    // Si hay un objeto seleccionado, asegurarse de que el contorno siga visible
    if (selectedObject && outlinePassRef.current) {
      outlinePassRef.current.selectedObjects = [selectedObject];
    }
  }, [updateLighting, selectedObject]);

  // Presets de tiempo
  const setTimePreset = useCallback((preset) => {
    let newTime;
    
    switch (preset) {
      case 'morning':
        newTime = 8; // 8:00 AM
        break;
      case 'noon':
        newTime = 12; // 12:00 PM
        break;
      case 'evening':
        newTime = 18; // 6:00 PM
        break;
      default:
        newTime = 12;
    }
    
    setCurrentTime(newTime);
    
    // Actualizar la iluminación
    updateLighting(newTime);
    
    // Forzar una actualización del renderizado
    if (composerRef.current && sceneRef.current && cameraRef.current) {
      composerRef.current.render();
    } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [updateLighting]);
  
  // Función para cambiar el material del suelo
  const changeFloorMaterial = useCallback((materialType) => {
    if (!sceneRef.current) return;
    
    // Buscar el suelo en la escena
    const floor = sceneRef.current.children.find(child => 
      child.userData && child.userData.id === 'floor'
    );
    
    if (!floor) {
      console.warn("No se encontró el suelo en la escena");
      return;
    }
    
    // Mapeo de las texturas disponibles
    const floorTextures = {
      wood: {
        baseColor: '/textures/floor/wood/Planks037A_2K-JPG_Color.jpg',
        normal: '/textures/floor/wood/Planks037A_2K-JPG_NormalDX.jpg',
        roughness: '/textures/floor/wood/Planks037A_2K-JPG_Roughness.jpg',
        ao: '/textures/floor/wood/Planks037A_2K-JPG_AmbientOcclusion.jpg',
      },
      grass: {
        baseColor: '/textures/floor/grass/Grass001_1K-JPG_Color.jpg',
        normal: '/textures/floor/grass/Grass001_1K-JPG_NormalDX.jpg',
        roughness: '/textures/floor/grass/Grass001_1K-JPG_Roughness.jpg',
        ao: '/textures/floor/grass/Grass001_1K-JPG_AmbientOcclusion.jpg',
        displacement: '/textures/floor/grass/Grass001_1K-JPG_Displacement.jpg',
      },
      marble: {
        baseColor: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_BaseColor.jpg',
        normal: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_Normal.png',
        roughness: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_Roughness.jpg',
        metallic: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_Metallic.jpg',
        displacement: '/textures/floor/marbleWhite/Poliigon_StoneQuartzite_8060_Displacement.tiff',
      }
    };
    
    // Seleccionar textura según el tipo elegido
    const selectedTexture = floorTextures[materialType] || floorTextures.wood;
    
    // Cargar texturas
    const textureLoader = new THREE.TextureLoader();
    const baseColorTexture = textureLoader.load(selectedTexture.baseColor);
    const normalTexture = textureLoader.load(selectedTexture.normal);
    const roughnessTexture = textureLoader.load(selectedTexture.roughness);
    const aoTexture = selectedTexture.ao ? textureLoader.load(selectedTexture.ao) : null;
    const displacementTexture = selectedTexture.displacement ? textureLoader.load(selectedTexture.displacement) : null;
    
    // Configurar repetición de texturas
    [baseColorTexture, normalTexture, roughnessTexture, aoTexture, displacementTexture].forEach(texture => {
      if (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // Usar repetición más alta para el pasto para que se vea más detallado
        const repeatFactor = materialType === 'grass' ? 4 : 2;
        texture.repeat.set(repeatFactor, repeatFactor);
      }
    });
    
    // Actualizar el material del suelo
    if (floor.material) {
      floor.material.map = baseColorTexture;
      floor.material.normalMap = normalTexture;
      floor.material.roughnessMap = roughnessTexture;
      floor.material.aoMap = aoTexture || null;
      floor.material.displacementMap = displacementTexture || null;
      floor.material.needsUpdate = true;
      
      // Ajustar propiedades específicas según el material
      switch (materialType) {
        case 'wood':
          floor.material.roughness = 0.9;
          floor.material.metalness = 0.0;
          floor.material.displacementScale = 0.0;
          floor.material.envMapIntensity = 0.3;
          break;
        case 'grass':
          floor.material.roughness = 1.0;
          floor.material.metalness = 0.0;
          floor.material.displacementScale = 0.05;
          floor.material.envMapIntensity = 0.2;
          break;
        case 'marble':
          floor.material.roughness = 0.5;
          floor.material.metalness = 0.2;
          floor.material.displacementScale = 0.0;
          floor.material.envMapIntensity = 0.4;
          break;
        default:
          floor.material.roughness = 0.5;
          floor.material.metalness = 0.0;
      }
    }
    
    // Actualizar el estado
    setFloorMaterial(materialType);
    
    console.log(`Material del suelo cambiado a: ${materialType}`);
  }, []);
  
  // Función para manejar las teclas presionadas
  const handleKeyDown = useCallback((event) => {
    // Solo procesar si el control por teclado está habilitado
    if (!keyboardControlEnabled) return;
    
    const key = event.key.toLowerCase();
    
    // Solo actualizar si es una de las teclas WASD
    if (['w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault(); // Prevenir comportamiento predeterminado
      
      setKeysPressed(prev => {
        // Solo actualizar si el estado actual es diferente
        if (prev[key] !== true) {
          console.log(`Tecla ${key} presionada`);
          return { ...prev, [key]: true };
        }
        return prev;
      });
    }
  }, [keyboardControlEnabled]);

  // Función para manejar las teclas liberadas
  const handleKeyUp = useCallback((event) => {
    const key = event.key.toLowerCase();
    
    // Solo actualizar si es una de las teclas WASD
    if (['w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault(); // Prevenir comportamiento predeterminado
      
      setKeysPressed(prev => {
        // Solo actualizar si el estado actual es diferente
        if (prev[key] !== false) {
          console.log(`Tecla ${key} liberada`);
          return { ...prev, [key]: false };
        }
        return prev;
      });
    }
  }, []);

  // Función para mover la cámara según las teclas presionadas
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = orbitControlsRef.current;
    
    // Verificar si hay alguna tecla presionada
    if (!keysPressed.w && !keysPressed.a && !keysPressed.s && !keysPressed.d) return;
    
    // Obtener la dirección de la cámara
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    direction.y = 0;
    direction.normalize();
    
    // Vector derecha (perpendicular a la dirección)
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();
    
    // Velocidad de movimiento
    const speed = 0.07;
    
    // Aplicar movimiento según las teclas presionadas
    if (keysPressed.w) {
      camera.position.x += direction.x * speed;
      camera.position.z += direction.z * speed;
    }
    if (keysPressed.s) {
      camera.position.x -= direction.x * speed;
      camera.position.z -= direction.z * speed;
    }
    
    // Corregir la dirección del movimiento lateral
    // A debe mover hacia la izquierda (negativo del vector right)
    if (keysPressed.a) {
      camera.position.x -= right.x * speed; // Cambiado de + a -
      camera.position.z -= right.z * speed; // Cambiado de + a -
    }
    // D debe mover hacia la derecha (positivo del vector right)
    if (keysPressed.d) {
      camera.position.x += right.x * speed; // Cambiado de - a +
      camera.position.z += right.z * speed; // Cambiado de - a +
    }
    
    // Actualizar el punto de mira
    controls.target.set(
      camera.position.x + direction.x,
      controls.target.y,
      camera.position.z + direction.z
    );
    
    controls.update();
  }, [keysPressed]);

  // Efecto para manejar los event listeners
  useEffect(() => {
    // Función para resetear todas las teclas
    const resetKeys = () => {
      setKeysPressed({
        w: false,
        a: false,
        s: false,
        d: false
      });
    };
    
    // Función para manejar cuando la ventana pierde el foco
    const handleBlur = () => {
      resetKeys();
      console.log('Ventana perdió el foco, reseteando todas las teclas');
    };
    
    // Función para manejar cuando se cambia de pestaña
    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetKeys();
        console.log('Documento oculto, reseteando todas las teclas');
      }
    };
    
    if (keyboardControlEnabled) {
      // Agregar event listeners
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Resetear teclas al activar
      resetKeys();
    } else {
      // Quitar event listeners
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Resetear teclas al desactivar
      resetKeys();
    }
    
    // Limpiar al desmontar
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleKeyDown, handleKeyUp, keyboardControlEnabled]);

  // Primero definimos adjustCameraForControlMode
  const adjustCameraForControlMode = useCallback((enabled) => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = orbitControlsRef.current;
    
    // Asegurarse de que userData esté inicializado
    if (!camera.userData) camera.userData = {};
    if (!controls.userData) controls.userData = {};
    
    if (enabled) {
      // Modo tercera persona: bajar la cámara
      console.log('Ajustando cámara para modo tercera persona');
      
      // Guardar la posición actual para poder restaurarla
      camera.userData.previousPosition = camera.position.clone();
      controls.userData.previousTarget = controls.target.clone();
      
      // Ajustar a posición de tercera persona
      camera.position.set(0, 1.7, 5); // Altura más baja, como una persona
      controls.target.set(0, 1.7, 0); // Mirar al frente a la altura de los ojos
      
      // Actualizar controles
      controls.update();
    } else {
      // Restaurar vista normal o resetear a la vista predeterminada
      console.log('Restaurando vista normal');
      
      // Si hay una posición previa guardada, restaurarla
      if (camera.userData.previousPosition && controls.userData.previousTarget) {
        camera.position.copy(camera.userData.previousPosition);
        controls.target.copy(controls.userData.previousTarget);
      } else {
        // Si no hay posición previa, usar la vista predeterminada
        resetView();
      }
      
      // Actualizar controles
      controls.update();
    }
  }, [resetView]);

  useEffect(() => {
    // Solo iniciar el bucle de animación si el control por teclado está habilitado
    if (!keyboardControlEnabled) return;
    
    console.log('Iniciando bucle de animación para control por teclado');
    
    let animationId;
    
    const animate = () => {
      // Actualizar la posición de la cámara según las teclas presionadas
      updateCameraPosition();
      
      // Solicitar el siguiente frame
      animationId = requestAnimationFrame(animate);
    };
    
    // Iniciar el bucle
    animationId = requestAnimationFrame(animate);
    
    // Limpiar al desmontar o cuando se desactive el control por teclado
    return () => {
      console.log('Deteniendo bucle de animación para control por teclado');
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [keyboardControlEnabled, updateCameraPosition]);

  // Luego definimos toggleKeyboardControl que usa adjustCameraForControlMode
  const toggleKeyboardControl = useCallback(() => {
    try {
      setKeyboardControlEnabled(prev => {
        const newState = !prev;
        // Ajustar la cámara según el nuevo estado
        adjustCameraForControlMode(newState);
        return newState;
      });
    } catch (error) {
      console.error("Error al cambiar el modo de control:", error);
      // En caso de error, simplemente cambiar el estado sin ajustar la cámara
      setKeyboardControlEnabled(prev => !prev);
    }
  }, [adjustCameraForControlMode]);
  
  // Modificar la función initModalViewer para usar un enfoque más directo
  const initModalViewer = useCallback(() => {
    console.log("Inicializando visor modal con enfoque directo");
    if (!modalContainerRef.current || !selectedObject) {
      console.error("No se puede inicializar el visor modal:", 
                  !modalContainerRef.current ? "Contenedor no encontrado" : "Objeto no seleccionado");
      return;
    }
    
    // Limpiar el contenedor si ya existe un renderizador
    if (modalRendererRef.current && modalContainerRef.current.contains(modalRendererRef.current.domElement)) {
      modalContainerRef.current.removeChild(modalRendererRef.current.domElement);
      if (modalControlsRef.current) {
        modalControlsRef.current.dispose();
      }
    }
    
    // Obtener dimensiones del contenedor
    const width = modalContainerRef.current.clientWidth;
    const height = modalContainerRef.current.clientHeight;
    console.log("Dimensiones del contenedor modal:", width, height);
    
    // Crear escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    // Crear cámara
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    
    // Crear renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    modalContainerRef.current.appendChild(renderer.domElement);
    
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
    
    // Cargar el mismo modelo que está seleccionado
    const modelId = selectedObject.userData.id;
    console.log("Cargando modelo para el modal:", modelId);
    
    // Crear un objeto para mostrar mientras se carga el modelo
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
    
    // Animación de carga
    const animateLoading = () => {
      if (loadingObject) {
        loadingObject.rotation.y += 0.03;
        loadingObject.rotation.x += 0.01;
      }
    };
    
    // Función para cargar el modelo
    const loadModel = () => {
      // Obtener la URL del modelo desde el objeto seleccionado
      if (selectedObject.userData && selectedObject.userData.modelUrl) {
        const modelUrl = selectedObject.userData.modelUrl;
        const fileExtension = modelUrl.split('.').pop().toLowerCase();
        
        console.log("Cargando modelo desde URL:", modelUrl);
        
        // Cargar el modelo según su extensión
        if (fileExtension === 'gltf' || fileExtension === 'glb') {
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
              console.log("Modelo GLTF cargado correctamente");
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '% cargado');
            },
            (error) => {
              console.error('Error al cargar el modelo GLTF:', error);
            }
          );
        } else if (fileExtension === 'obj') {
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
              console.log("Modelo OBJ cargado correctamente");
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '% cargado');
            },
            (error) => {
              console.error('Error al cargar el modelo OBJ:', error);
            }
          );
        } else {
          console.error("Formato de modelo no soportado:", fileExtension);
        }
      } else {
        // Si no hay URL del modelo, usar el objeto seleccionado directamente
        console.log("No se encontró URL del modelo, usando objeto seleccionado directamente");
        
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
        
        // Hacer que el cubo gire
        // En lugar de reasignar la función animate, creamos una variable para el cubo
        // y lo animamos en la función animate existente
        cube.userData.shouldRotate = true;
      }
    };
    
    // Modificar la función de animación para incluir la rotación del cubo
    const animate = () => {
      if (!modalRendererRef.current) return;
      
      requestAnimationFrame(animate);
      controls.update();
      
      // Animar el objeto de carga si existe
      if (loadingObject) {
        animateLoading();
      }
      
      // Animar cualquier objeto que tenga la propiedad shouldRotate
      scene.traverse((object) => {
        if (object.userData && object.userData.shouldRotate) {
          object.rotation.y += 0.01;
          object.rotation.x += 0.005;
        }
      });
      
      renderer.render(scene, camera);
    };
    
    // Iniciar animación
    animate();
    
    // Cargar el modelo
    loadModel();
    
    // Guardar referencias
    modalSceneRef.current = scene;
    modalCameraRef.current = camera;
    modalRendererRef.current = renderer;
    modalControlsRef.current = controls;
    
    // Manejar cambios de tamaño
    const handleResize = () => {
      if (!modalContainerRef.current || !modalCameraRef.current || !modalRendererRef.current) return;
      
      const width = modalContainerRef.current.clientWidth;
      const height = modalContainerRef.current.clientHeight;
      
      modalCameraRef.current.aspect = width / height;
      modalCameraRef.current.updateProjectionMatrix();
      modalRendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    console.log("Visor modal inicializado correctamente");
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedObject]);

  // Modificar el efecto para asegurarse de que el modal se inicializa correctamente
  useEffect(() => {
    console.log("Estado del modal:", isModalOpen);
    console.log("Objeto seleccionado:", selectedObject?.userData?.name);
    
    if (isModalOpen && selectedObject) {
      // Esperar a que el DOM se actualice
      setTimeout(() => {
        modalContainerRef.current = document.getElementById('modal-model-container');
        console.log("Contenedor modal encontrado:", !!modalContainerRef.current);
        if (modalContainerRef.current) {
          initModalViewer();
        } else {
          console.error("No se pudo encontrar el contenedor del modal");
        }
      }, 100);
    }
    
    // Limpiar cuando se cierra el modal
    return () => {
      if (!isModalOpen) {
        console.log("Limpiando recursos del modal");
        if (modalRendererRef.current && modalContainerRef.current) {
          try {
            if (modalContainerRef.current.contains(modalRendererRef.current.domElement)) {
              modalContainerRef.current.removeChild(modalRendererRef.current.domElement);
            }
          } catch (e) {
            console.log('Error al limpiar el renderizador del modal:', e);
          }
        }
        
        if (modalControlsRef.current) {
          modalControlsRef.current.dispose();
        }
        
        modalRendererRef.current = null;
        modalSceneRef.current = null;
        modalCameraRef.current = null;
        modalControlsRef.current = null;
      }
    };
  }, [isModalOpen, selectedObject, initModalViewer]);
  
  // Modificar la función setView para que acepte un parámetro de duración
  const setView = useCallback((viewType, duration = 500) => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    
    // Guardar la posición y rotación actuales
    const startPosition = cameraRef.current.position.clone();
    const startTarget = orbitControlsRef.current.target.clone();
    
    // Definir la posición y objetivo según el tipo de vista
    let targetPosition, targetTarget;
    
    switch (viewType) {
      case 'front':
        targetPosition = new THREE.Vector3(0, 2, 5);
        targetTarget = new THREE.Vector3(0, 0, 0);
        break;
      case 'top':
        targetPosition = new THREE.Vector3(0, 5, 0);
        targetTarget = new THREE.Vector3(0, 0, 0);
        break;
      case 'side':
        targetPosition = new THREE.Vector3(5, 2, 0);
        targetTarget = new THREE.Vector3(0, 0, 0);
        break;
      default:
        return;
    }
    
    // Iniciar la animación
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Función de easing para suavizar el movimiento
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      // Interpolar la posición y el objetivo
      cameraRef.current.position.lerpVectors(startPosition, targetPosition, easeProgress);
      orbitControlsRef.current.target.lerpVectors(startTarget, targetTarget, easeProgress);
      
      // Actualizar los controles
      orbitControlsRef.current.update();
      
      // Continuar la animación si no ha terminado
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    // Iniciar la animación
    animateCamera();
  }, []);

  // Añadir un useEffect para animar la cámara al inicio
  useEffect(() => {
    // Esperar un momento para que todo esté inicializado
    const timer = setTimeout(() => {
      // Usar la función setView con una duración más larga para la animación inicial
      setView('front', 2000);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [setView]);
  
  // Renderizar el componente con UI mejorada
  return (
    <div className="project-viewer-3d">
      {/* Botón flotante de cierre con icono SVG */}
      <button className="floating-close-btn" onClick={onClose} aria-label="Cerrar">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      
      <div className="viewer-layout">
        {/* Panel de elementos a la izquierda con logo en la parte superior */}
        <div className="elements-panel">
          <div className="elements-logo">
            <img src={LogoWhite} alt="LAO Architects" />
          </div>
          <div className="elements-header">
            {/* Icono view_in_ar */}
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M21 9V7c0-1.65-1.35-3-3-3H6C4.35 4 3 5.35 3 7v2c-1.65 0-3 1.35-3 3v5c0 1.65 1.35 3 3 3h18c1.65 0 3-1.35 3-3v-5c0-1.65-1.35-3-3-3zM5 7c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v2.78c-.61.55-1 1.34-1 2.22v2H6v-2c0-.88-.39-1.67-1-2.22V7zm17 10c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1-1-1v-5c0-.55.45-1 1-1s1 .45 1 1v4h16v-4c0-.55.45-1 1-1s1 .45 1 1v5z"/>
            </svg>
            <h3>Elementos</h3>
          </div>
          <div className="elements-list">
            {loadedObjects.map(obj => (
              <div 
                key={obj.id} 
                className={`element-item ${selectedObject && selectedObject.userData.id === obj.id ? 'selected' : ''}`}
                onClick={() => {
                  const object = objectsRef.current[obj.id];
                  if (object) selectObject(object);
                }}
              >
                <div className="element-icon">
                  {obj.image ? (
                    // Si el objeto tiene una imagen definida, mostrarla
                    <img 
                      src={obj.image} 
                      alt={obj.image} 
                      style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px'}}
                    />
                  ) : (
                    // Si no tiene imagen, mostrar el icono que ya tenías
                    obj.id === 'sofa' ? (
                      /* Icono weekend */
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                        <path d="M0 0h24v24H0V0z" fill="none"/>
                        <path d="M21 9V7c0-1.65-1.35-3-3-3H6C4.35 4 3 5.35 3 7v2c-1.65 0-3 1.35-3 3v5c0 1.65 1.35 3 3 3h18c1.65 0 3-1.35 3-3v-5c0-1.65-1.35-3-3-3zM5 7c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v2.78c-.61.55-1 1.34-1 2.22v2H6v-2c0-.88-.39-1.67-1-2.22V7zm17 10c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1-1-1v-5c0-.55.45-1 1-1s1 .45 1 1v4h16v-4c0-.55.45-1 1-1s1 .45 1 1v5z"/>
                      </svg>
                    ) : obj.id === 'robot' ? (
                      /* Icono smart_toy */
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                        <path d="M0 0h24v24H0V0z" fill="none"/>
                        <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.65 0-3 1.35-3 3v5c0 1.65 1.35 3 3 3h12c1.65 0 3-1.35 3-3v-5c0-1.65-1.35-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                      </svg>
                    ) : (
                      /* Icono view_in_ar por defecto */
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18.25 7.6l-5.5-3.18c-.46-.27-1.04-.27-1.5 0L5.75 7.6c-.46.27-.75.76-.75 1.3v6.35c0 .54.29 1.03.75 1.3l5.5 3.18c.46.27 1.04.27 1.5 0l5.5-3.18c.46-.27.75-.76.75-1.3V8.9c0-.54-.29-1.03-.75-1.3zM7 14.96v-4.62l4 2.32v4.61l-4-2.31zm5-4.03L8 8.61l4-2.31 4 2.31-4 2.32zm1 6.34v-4.61l4-2.32v4.62l-4 2.31z"/>
                      </svg>
                    )
                  )}
                </div>
                <div className="element-info">
                  <div className="element-name">{obj.name}</div>
                  <div className="element-type">{obj.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        
        {/* Contenedor principal del visor */}
        <div className="viewer-container" ref={containerRef}>
          {/* Loader mejorado con animación y estilo moderno */}
          {isLoading && (
            <div className="loader3d-overlay">
              <div className="loader3d">
                <div className="loader3d-progress">
                  <div className="loader3d-bar" style={{ width: `${loadingProgress}%` }}></div>
                </div>
                <div className="loader3d-text">
                  Cargando modelo 3D... {loadingProgress.toFixed(0)}%
                </div>
              </div>
            </div>
          )}
          
          {/* Panel de detalles del objeto seleccionado */}
          {selectedObject && (
            <div className="details-panel">
              <div className="details-header">
                <h3>{selectedObject.userData.name}</h3>
                <button className="close-btn" onClick={() => setSelectedObject(null)} aria-label="Cerrar panel">
                  {/* Icono close */}
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <div className="details-content">
                {/* Mostrar la imagen si existe */}
                {selectedObject.userData.image && (
                  <div className="object-image-container">
                    <img 
                      src={selectedObject.userData.image} 
                      alt={selectedObject.userData.name} 
                      className="object-detail-image"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </div>
                )}
                
                {selectedObject.userData.type && (
                  <div className="object-type">{selectedObject.userData.type}</div>
                )}
                
                {selectedObject.userData.description && (
                  <div className="detail-row">
                    <span>Descripción</span>
                    <span>{selectedObject.userData.description}</span>
                  </div>
                )}
                
                {/* Mostrar el precio si existe */}
                {selectedObject.userData.price && (
                  <div className="object-price">
                    {selectedObject.userData.price}
                    <span className="currency">{selectedObject.userData.currency || '€'}</span>
                  </div>
                )}
                
                <div className="detail-row">
                  <span>Posición</span>
                  <span>
                    X: {selectedObject.position.x.toFixed(2)}, 
                    Y: {selectedObject.position.y.toFixed(2)}, 
                    Z: {selectedObject.position.z.toFixed(2)}
                  </span>
                </div>
                
                <div className="detail-actions">
                  {/* Botón para ver el modelo en detalle */}
                  <button 
                    className="view-model-button"
                    onClick={() => {
                      console.log("Botón presionado");
                      console.log("Objeto seleccionado:", selectedObject);
                      console.log("Abriendo modal para:", selectedObject.userData.name);
                      setIsModalOpen(true);
                      console.log("Estado del modal después de setIsModalOpen:", true);
                      
                      // Forzar una actualización del DOM
                      setTimeout(() => {
                        console.log("Modal abierto:", document.getElementById('modal-model-container') ? "Sí" : "No");
                      }, 100);
                    }}
                  >
                    {/* Icono 3d_rotation */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                      <path d="M0 0h24v24H0z" fill="none"/>
                      <path d="M7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32zm.89-6.52c-.19 0-.37-.03-.52-.08-.16-.06-.29-.13-.4-.24-.11-.1-.2-.22-.26-.37-.06-.14-.09-.3-.09-.47h-1.3c0 .36.07.68.21.95.14.27.33.5.56.69.24.18.51.32.82.41.3.1.62.15.96.15.37 0 .72-.05 1.03-.15.32-.1.6-.25.83-.44s.42-.43.55-.72c.13-.29.2-.61.2-.97 0-.19-.02-.38-.07-.56-.05-.18-.12-.35-.23-.51-.1-.16-.24-.3-.4-.43-.17-.13-.37-.23-.61-.31.2-.09.37-.2.52-.33.15-.13.27-.27.37-.42.1-.15.17-.3.22-.46.05-.16.07-.32.07-.48 0-.36-.06-.68-.18-.96-.12-.28-.29-.51-.51-.69-.2-.19-.47-.33-.77-.43C9.1 8.05 8.76 8 8.39 8c-.36 0-.69.05-1 .16-.3.11-.57.26-.79.45-.21.19-.38.41-.51.67-.12.26-.18.54-.18.85h1.3c0-.17.03-.32.09-.45s.14-.25.25-.34c.11-.09.23-.17.38-.22.15-.05.3-.08.48-.08.4 0 .7.1.89.31.19.2.29.49.29.86 0 .18-.03.34-.08.49-.05.15-.14.27-.25.37-.11.1-.25.18-.41.24-.16.06-.36.09-.58.09H7.5v1.03h.77c.22 0 .42.02.6.07s.33.13.45.23c.12.11.22.24.29.4.07.16.1.35.1.57 0 .41-.12.72-.35.93-.23.23-.55.33-.95.33zm8.55-5.92c-.32-.33-.7-.59-1.14-.77-.43-.18-.92-.27-1.46-.27H12v8h2.3c.55 0 1.06-.09 1.51-.27.45-.18.84-.43 1.16-.76.32-.33.57-.73.74-1.19.17-.47.26-.99.26-1.57v-.4c0-.58-.09-1.1-.26-1.57-.18-.47-.43-.87-.75-1.2zm-.39 3.16c0 .42-.05.79-.14 1.13-.1.33-.24.62-.43.85-.19.23-.43.41-.71.53-.29.12-.62.18-.99.18h-.91V9.12h.97c.72 0 1.27.23 1.64.69.38.46.57 1.12.57 1.99v.4zM12 0l-.66.03 3.81 3.81 1.33-1.33c3.27 1.55 5.61 4.72 5.96 8.48h1.5C23.44 4.84 18.29 0 12 0z"/>
                    </svg>
                    Ver modelo en 3D
                  </button>
                  {/*}
                  <button onClick={resetObjectPosition}>
                   
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                      <path d="M0 0h24v24H0V0z" fill="none"/>
                      <path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6 0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93 0-4.42-3.58-8-8-8zm-6 8c0-1.65.67-3.15 1.76-4.24L6.34 7.34C4.9 8.79 4 10.79 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.83-.48-5-2.94-5-5.91z"/>
                    </svg>
                    Resetearss
                  </button>
                  */}
                </div>
              </div>
            </div>
          )}
          
          {/* Controles de la interfaz mejorados */}
          <div className="bottom-controls">
            <div className="transform-controls">
              <button 
                className={transformMode === 'translate' ? 'active' : ''} 
                onClick={() => changeTransformMode('translate')}
                title="Mover"
              >
                {/* Icono open_with */}
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
                </svg>
                <span className="control-label">Mover</span>
              </button>
              <button 
                className={transformMode === 'rotate' ? 'active' : ''} 
                onClick={() => changeTransformMode('rotate')}
                title="Rotar"
              >
                {/* Icono rotate_90_degrees_ccw */}
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M7.34 6.41L.86 12.9l6.49 6.48 6.49-6.48-6.5-6.49zM3.69 12.9l3.66-3.66L11 12.9l-3.66 3.66-3.65-3.66zm15.67-6.26C17.61 4.88 15.3 4 13 4V.76L8.76 5 13 9.24V6c1.79 0 3.58.68 4.95 2.05 2.73 2.73 2.73 2.73 2.73 2.73 7.17 0 9.9C16.58 19.32 14.79 20 13 20c-.97 0-1.94-.21-2.84-.61l-1.49 1.49C10.02 21.62 11.51 22 13 22c2.3 0 4.61-.88 6.36-2.64 3.52-3.51 3.52-9.21 0-12.72z"/>
                </svg>
                <span className="control-label">Rotar</span>
              </button>
              <button 
                className={transformMode === 'scale' ? 'active' : ''} 
                onClick={() => changeTransformMode('scale')}
                title="Escalar"
              >
                {/* Icono zoom_out_map */}
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42-2.87 2.89-2.3-2.3v6h6z"/>
                </svg>
                <span className="control-label">Escalar</span>
              </button>
              <div className="separator"></div>
              
              <button onClick={resetView} title="Restablecer vista">
                {/* Icono home */}
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
                </svg>
                <span className="control-label">Vista</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="project-viewer-3d-controls">
        <div className="time-control">
          <div className="time-presets">
            <button onClick={() => setTimePreset('morning')} title="Mañana">
              <MdWbTwilight style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button onClick={() => setTimePreset('noon')} title="Mediodía">
              <FaSun />
            </button>
            <button onClick={() => setTimePreset('evening')} title="Atardecer">
              <MdWbTwilight />
            </button>
          </div>
          <input
            type="range"
            min="6"    // Cambiado de 0 a 6
            max="18"   // Cambiado de 24 a 18
            step="0.166"  // Aproximadamente 10 minutos (1/6 de hora)
            value={currentTime}
            onChange={handleTimeChange}
            className="time-slider"
          />
          <div className="time-display">
            {Math.floor(currentTime)}:
            {Math.round((currentTime % 1) * 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      
      {/* Actualizar la interfaz para mostrar solo los materiales disponibles */}
      <div className="floor-material-selector">
        <button 
          className={`material-button ${floorMaterial === 'marble' ? 'active' : ''}`} 
          onClick={() => changeFloorMaterial('marble')}
          title="Suelo de Mármol"
        >
          <div className="material-icon marble"></div>
        </button>
        <button 
          className={`material-button ${floorMaterial === 'wood' ? 'active' : ''}`} 
          onClick={() => changeFloorMaterial('wood')}
          title="Suelo de Madera"
        >
          <div className="material-icon wood"></div>
        </button>
        <button 
          className={`material-button ${floorMaterial === 'grass' ? 'active' : ''}`} 
          onClick={() => changeFloorMaterial('grass')}
          title="Suelo de Césped"
        >
          <div className="material-icon grass"></div>
        </button>
      </div>
      
      <div className="keyboard-controls-indicator">
        <div className={`keyboard-toggle ${keyboardControlEnabled ? 'active' : ''}`} 
             onClick={toggleKeyboardControl}
             title={keyboardControlEnabled ? "Desactivar control por teclado" : "Activar control por teclado"}>
          <div className="keyboard-icon">
            <span className="key">W</span>
            <div className="key-row">
              <span className="key">A</span>
              <span className="key">S</span>
              <span className="key">D</span>
            </div>
          </div>
          <span className="keyboard-status">{keyboardControlEnabled ? "Activado" : "Desactivado"}</span>
        </div>
      </div>
      
      {/* Modal para mostrar el modelo 3D */}
      {isModalOpen && selectedObject && (
        <div className="model-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="model-modal" onClick={(e) => e.stopPropagation()}>
            <div className="model-modal-header">
              <h3>{selectedObject.userData.name}</h3>
              <button className="model-modal-close" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="model-modal-content">
              <ModelViewer3D 
                object={selectedObject} 
                options={{
                  autoRotate: true,
                  cameraPosition: [0, 2, 5],
                  backgroundColor: '#f5f5f5'
                }}
              />
            </div>
            <div className="model-modal-footer">
              <div className="model-modal-info">
                {selectedObject.userData.type && (
                  <span className="model-modal-type">{selectedObject.userData.type}</span>
                )}
                {selectedObject.userData.price && (
                  <span className="model-modal-price">
                    {selectedObject.userData.price} {selectedObject.userData.currency || '€'}
                  </span>
                )}
              </div>
              <div className="model-modal-actions">
                {selectedObject.userData.price && (
                  <button className="buy-button">
                    Añadir al carrito
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 