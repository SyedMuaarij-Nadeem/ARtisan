import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Grid, ContactShadows, Html } from '@react-three/drei';
import { useState, useEffect, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import axios from 'axios';

function NormalizedModel({ url }) {
  // Pass true to enable default Draco and Meshopt decoders internally for Sketchfab assets
  const { scene } = useGLTF(url, true);

  // Instant calculation without cloning or mutating PBR shaders
  useEffect(() => {
    if (!scene) return;

    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Scale standardizer
    if (maxDim > 0) scene.scale.setScalar(8 / maxDim);
    scene.updateMatrixWorld(true);

    const newBox = new THREE.Box3().setFromObject(scene);
    const newCenter = newBox.getCenter(new THREE.Vector3());

    // Position perfectly on Y axis floor
    scene.position.x = -newCenter.x;
    scene.position.y = -newBox.min.y;
    scene.position.z = -newCenter.z;

    // Apply lighting capabilities
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Force WebGL to re-read the textures in case it dropped them from a previous cached load
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.needsUpdate = true);
          } else {
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

export default function ModelViewer({ modelUid }) {
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchModel = async () => {
      setLoading(true);
      setError(null);
      setModelUrl(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/model/${modelUid}`);
        if (isMounted) {
          // Append a timestamp to completely bust the Three.js and Browser cache.
          // This forces the geometry to be loaded perfectly clean, restoring missing textures.
          setModelUrl(`${response.data.modelUrl}?t=${Date.now()}`);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Failed to load model. Sketchfab API Key might be invalid or missing in the backend proxy.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (modelUid) {
      fetchModel();
    }

    return () => {
      isMounted = false;
    };
  }, [modelUid]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 w-full h-full">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md text-red-100 p-6 rounded-2xl max-w-md text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <p className="font-semibold mb-2">Error Loading Model</p>
              <p className="text-sm font-light opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Custom Premium Loader */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#020617]/80 backdrop-blur-md pointer-events-none transition-all duration-500">
            <div className="relative flex items-center justify-center mb-8">
              {/* Outer pulsing glow */}
              <div className="absolute inset-0 bg-[#00f5ff]/20 rounded-full blur-2xl animate-pulse" style={{ padding: '40px' }} />
              {/* Rotating dashed ring */}
              <div className="w-24 h-24 border-2 border-dashed border-[#00f5ff]/40 rounded-full animate-[spin_8s_linear_infinite] flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-dashed border-[#00f5ff]/80 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
              </div>
              {/* Inner glowing core */}
              <div className="absolute w-8 h-8 bg-[#00f5ff] rounded-full blur-md animate-pulse" />
            </div>
            
            <p className="font-light italic text-xl tracking-[0.3em] uppercase text-transparent bg-clip-text bg-linear-to-r from-[#00f5ff] to-white animate-pulse">
              Loading Model
            </p>
            <p className="text-xs mt-3 text-[#00f5ff]/50 font-light tracking-widest uppercase">
              Extracting Assets
            </p>
          </div>
        )}

        <Canvas 
          shadows={{ type: THREE.PCFShadowMap }} 
          camera={{ position: [0, 4, 12], fov: 50 }} 
          className="touch-none bg-transparent"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center pointer-events-none drop-shadow-[0_0_15px_rgba(0,245,255,0.8)]">
                <p className="font-light italic text-lg tracking-[0.2em] uppercase text-[#00f5ff] animate-pulse whitespace-nowrap">
                  Parsing Geometry
                </p>
              </div>
            </Html>
          }>
            <Environment preset="city" />
            {(modelUrl && !error) && <NormalizedModel url={modelUrl} />}
          </Suspense>

          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.6} 
            scale={20} 
            blur={2} 
            far={10} 
          />
          
          <Grid 
            position={[0, 0, 0]}
            infiniteGrid 
            fadeDistance={25} 
            cellColor="#00f5ff" 
            sectionColor="#00f5ff"
            cellThickness={0.5}
            sectionThickness={1}
            opacity={0.15}
          />
          
          <OrbitControls 
            makeDefault 
            autoRotate={false} 
            enableDamping 
            dampingFactor={0.05} 
            target={[0, 3, 0]} 
            minDistance={2} 
            maxDistance={35}
          />
        </Canvas>
      </div>

      {/* Guide Labels with Hover States */}
      <div className="absolute bottom-6 right-6 flex gap-3 z-20 hidden md:flex">
        <div className="px-4 py-2 rounded-lg text-[10px] sm:text-xs uppercase tracking-widest cursor-default transition-all duration-300 border border-white/10 bg-black/60 text-white/50 backdrop-blur-md hover:text-[#00f5ff] hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/50 hover:shadow-[0_0_15px_rgba(0,245,255,0.2)]">
          Left Click: Rotate
        </div>
        <div className="px-4 py-2 rounded-lg text-[10px] sm:text-xs uppercase tracking-widest cursor-default transition-all duration-300 border border-white/10 bg-black/60 text-white/50 backdrop-blur-md hover:text-[#00f5ff] hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/50 hover:shadow-[0_0_15px_rgba(0,245,255,0.2)]">
          Scroll: Zoom
        </div>
        <div className="px-4 py-2 rounded-lg text-[10px] sm:text-xs uppercase tracking-widest cursor-default transition-all duration-300 border border-white/10 bg-black/60 text-white/50 backdrop-blur-md hover:text-[#00f5ff] hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/50 hover:shadow-[0_0_15px_rgba(0,245,255,0.2)]">
          Right Click: Pan
        </div>
      </div>
    </div>
  );
}
