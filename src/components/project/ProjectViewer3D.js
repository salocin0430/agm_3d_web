import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  TransformControls, 
  Html, 
  useGLTF, 
  Environment, 
  PresentationControls,
  useProgress,
  Stats
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import './ProjectViewer3D.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import ReactDOM from 'react-dom';
import ProjectViewer3DPure from './ProjectViewer3DPure';
import { useParams } from 'react-router-dom';
import { projectService } from '../../data/projectService';

// Componente de carga
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader3d">
        <div className="loader3d-progress">
          <div 
            className="loader3d-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="loader3d-text">Cargando modelo {progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
}

// Componente para el modelo 3D
function Model({ url, setSelectedObject }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      scale={1} 
      position={[0, 0, 0]} 
      onClick={(e) => {
        e.stopPropagation();
        setSelectedObject(e.object);
      }}
    />
  );
}

// Componente para cargar modelos OBJ
function ObjModel({ url, setSelectedObject }) {
  const [model, setModel] = useState(null);
  
  useEffect(() => {
    const objLoader = new OBJLoader();
    objLoader.load(
      url,
      (obj) => {
        obj.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        setModel(obj);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading OBJ model:', error);
      }
    );
  }, [url]);
  
  if (!model) return null;
  
  return (
    <primitive 
      object={model} 
      scale={1} 
      position={[0, 0, 0]} 
      onClick={(e) => {
        e.stopPropagation();
        setSelectedObject(e.object);
      }}
    />
  );
}

// Panel de detalles para el objeto seleccionado
function DetailsPanel({ selectedObject, onClose, onReset }) {
  if (!selectedObject) return null;
  
  return (
    <div className="details-panel">
      <div className="details-header">
        <h3>{selectedObject.name || "Objeto seleccionado"}</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="details-content">
        <div className="detail-row">
          <span>Tipo:</span>
          <span>{selectedObject.type}</span>
        </div>
        {selectedObject.material && (
          <div className="detail-row">
            <span>Material:</span>
            <span>{selectedObject.material.name || "Material estándar"}</span>
          </div>
        )}
        <div className="detail-row">
          <span>Posición:</span>
          <span>
            X: {selectedObject.position.x.toFixed(2)}, 
            Y: {selectedObject.position.y.toFixed(2)}, 
            Z: {selectedObject.position.z.toFixed(2)}
          </span>
        </div>
        <div className="detail-actions">
          <button onClick={onReset}>Restablecer posición</button>
        </div>
      </div>
    </div>
  );
}

// Añade esta función después de la función DetailsPanel
function FallbackModel({ setSelectedObject }) {
  return (
    <group>
      <mesh 
        position={[0, 0, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedObject(e.object);
        }}
        name="Cubo central"
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <mesh 
        position={[2, 0, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedObject(e.object);
        }}
        name="Esfera derecha"
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
      <mesh 
        position={[-2, 0, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedObject(e.object);
        }}
        name="Cilindro izquierdo"
      >
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
      <mesh 
        position={[0, -1.5, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        name="Plano base"
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

// Escena principal
function Scene({ modelUrl = "/models/default/robota/scene.gltf" }) {
  const [selectedObject, setSelectedObject] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const transformRef = useRef();
  const controlsRef = useRef();
  
  // Siempre llamar a useGLTF con una URL por defecto
  const { scene: defaultScene } = useGLTF("/models/default/robota/scene.gltf");
  
  // Estado para controlar qué modelo mostrar
  const [modelType, setModelType] = useState('default');
  
  // Determinar el tipo de modelo basado en la extensión del archivo
  useEffect(() => {
    if (modelUrl.endsWith('.gltf') || modelUrl.endsWith('.glb')) {
      setModelType('gltf');
    } else if (modelUrl.endsWith('.obj')) {
      setModelType('obj');
    } else {
      setModelType('default');
    }
  }, [modelUrl]);
  
  // Resetear la selección al hacer clic en el fondo
  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedObject(null);
    }
  };
  
  // Resetear la posición del objeto seleccionado
  const resetObjectPosition = () => {
    if (selectedObject) {
      selectedObject.position.set(0, 0, 0);
      selectedObject.rotation.set(0, 0, 0);
      selectedObject.scale.set(1, 1, 1);
    }
  };

  return (
    <>
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 5], fov: 50 }} 
        onClick={handleCanvasClick}
        style={{ background: '#1a1a1a' }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {modelType === 'default' && (
            <primitive 
              object={defaultScene} 
              scale={1} 
              position={[0, 0, 0]} 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(e.object);
              }}
            />
          )}
          
          {modelType === 'gltf' && modelUrl !== "/models/default/robota/scene.gltf" && (
            <Model url={modelUrl} setSelectedObject={setSelectedObject} />
          )}
          
          {modelType === 'obj' && (
            <ObjModel url={modelUrl} setSelectedObject={setSelectedObject} />
          )}
          
          <Environment preset="apartment" />
          
          <OrbitControls 
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
          />
          
          {selectedObject && (
            <TransformControls
              ref={transformRef}
              object={selectedObject}
              mode={transformMode}
              size={0.7}
            />
          )}
          
          <gridHelper args={[20, 20, '#444444', '#222222']} />
          <axesHelper args={[5]} />
          
          {process.env.NODE_ENV === 'development' && <Stats />}
        </Suspense>
      </Canvas>
      
      {/* Controles de UI */}
      <div className="viewer-controls">
        <div className="transform-controls">
          <button 
            className={transformMode === 'translate' ? 'active' : ''} 
            onClick={() => setTransformMode('translate')}
          >
            Mover
          </button>
          <button 
            className={transformMode === 'rotate' ? 'active' : ''} 
            onClick={() => setTransformMode('rotate')}
          >
            Rotar
          </button>
          <button 
            className={transformMode === 'scale' ? 'active' : ''} 
            onClick={() => setTransformMode('scale')}
          >
            Escalar
          </button>
        </div>
        
        <div className="view-controls">
          <button onClick={() => controlsRef.current?.reset()}>
            Restablecer vista
          </button>
        </div>
      </div>
      
      {/* Panel de detalles */}
      <DetailsPanel 
        selectedObject={selectedObject} 
        onClose={() => setSelectedObject(null)}
        onReset={resetObjectPosition}
      />
    </>
  );
}

// Componente wrapper que usa un portal para renderizar el visor 3D
const ProjectViewer3D = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await projectService.getProjectById(id);
        setProject(projectData);
      } catch (error) {
        console.error('Error al cargar el proyecto:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);
  
  const handleClose = () => {
    // Redirigir de vuelta a la página del proyecto
    window.history.back();
  };
  
  if (loading) {
    return (
      <div className="project-viewer-3d-loading">
        <div className="loader"></div>
        <p>Cargando visualizador 3D...</p>
      </div>
    );
  }
  
  // Determinar la URL del modelo según el ID del proyecto
  const getModelUrl = () => {
    // Puedes personalizar esta lógica según tus necesidades
    return `/models/${id}/model.gltf`;
  };
  
  return (
    <ProjectViewer3DPure
      modelUrl={getModelUrl()}
      projectId={id}
      onClose={handleClose}
    />
  );
};

export default ProjectViewer3D; 