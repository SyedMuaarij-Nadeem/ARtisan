import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Grid } from '@react-three/drei';
import { useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const getBackendUrl = () => `http://${window.location.hostname}:5000`;
const getFrontendUrl = (ip) => `http://${ip}:${window.location.port || '5173'}`;

function useServerIp() {
  const [ip, setIp] = useState(window.location.hostname);
  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      axios.get(`http://${window.location.hostname}:5000/api/server-info`)
        .then(res => { if (res.data?.localIP) setIp(res.data.localIP); })
        .catch(() => {});
    }
  }, []);
  return ip;
}

function StudioModel({ url, onLoaded, onCenterReady }) {
  const { scene } = useGLTF(url);
  const [center, setCenter] = useState([0, 0, 0]);

  useEffect(() => {
    if (!scene) return;

    // Compute bounding box to auto-fit
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const centerVec = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centerVec);

    // Center the model at origin
    scene.position.sub(centerVec);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 3 / maxDim : 1;
    scene.scale.setScalar(scale);

    // After scaling, re-center
    const box2 = new THREE.Box3().setFromObject(scene);
    const center2 = new THREE.Vector3();
    box2.getCenter(center2);
    scene.position.sub(center2);

    setCenter([0, 0, 0]);

    // Apply texture/material fallback for meshes with no texture
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          // If material has no map (texture), apply a warm neutral fallback
          if (!child.material.map) {
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0xc8b89a),
              roughness: 0.6,
              metalness: 0.1,
            });
          }
          child.material.needsUpdate = true;
        }
      }
    });

    if (onLoaded) onLoaded();
    if (onCenterReady) onCenterReady([0, 0, 0]);
  }, [scene, onLoaded, onCenterReady]);

  return <primitive object={scene} />;
}


export default function ModelViewer({ modelUid, url }) {
  const [modelUrl, setModelUrl] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [meshLoading, setMeshLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const serverIp = useServerIp();
  const navigate = useNavigate();

  // Detect mobile or tablet devices
  const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    const load = async () => {
      setApiLoading(true);
      setMeshLoading(true);
      try {
        if (modelUid) {
          const res = await axios.get(`${getBackendUrl()}/api/model/${modelUid}`);
          setModelUrl(res.data.modelUrl);
        } else if (url) {
          setModelUrl(url);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setApiLoading(false);
      }
    };
    if (modelUid || url) load();
  }, [modelUid, url]);

  const isLoading = apiLoading || meshLoading;

  return (
    <div className="w-full h-full bg-[#0A0A0A] relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div 
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-[#0A0A0A]"
          >
            <div className="relative">
                <div className="w-20 h-20 border border-white/5 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-t-2 border-[#8B5E3C] rounded-full animate-spin" />
            </div>
            <div className="mt-12 text-center space-y-4">
                <p className="text-[10px] uppercase tracking-[0.8em] text-[#8B5E3C] font-black animate-pulse">Materializing Asset</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold">Studio Syncing • Neural Buffer Active</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Canvas shadows camera={{ position: [0, 3, 8], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2.5} castShadow shadow-mapSize={[1024,1024]} />
        <directionalLight position={[-5, 8, -5]} intensity={1.5} />
        <directionalLight position={[0, -5, 5]} intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#f5deb3" />
        
        <Suspense fallback={null}>
          <Environment preset="studio" />
          {modelUrl && (
            <StudioModel 
                url={modelUrl} 
                onLoaded={() => setTimeout(() => setMeshLoading(false), 500)}
            />
          )}
          <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={20} blur={2} far={10} />
        </Suspense>
        
        <Grid position={[0, -1.5, 0]} infiniteGrid fadeDistance={30} cellColor="#8B5E3C" sectionColor="#8B5E3C" cellThickness={0.5} sectionThickness={1} opacity={0.05} />
        <OrbitControls makeDefault target={[0, 0, 0]} minDistance={2} maxDistance={20} />
      </Canvas>

      {/* Action Bar */}
      {modelUrl && !isLoading && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            if (isMobileDevice) {
              if (modelUid) {
                navigate(`/ar/${modelUid}`);
              } else {
                navigate(`/ar-image?url=${encodeURIComponent(url)}`);
              }
            } else {
              setShowQR(true);
            }
          }}
          className="absolute top-4 sm:top-6 lg:top-8 right-3 sm:right-5 lg:right-8 z-20 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 bg-[#8B5E3C] text-white text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-black hover:bg-[#F4F1EE] hover:text-black transition-all shadow-2xl"
        >
          <span className="hidden sm:inline">View in AR Space</span>
          <span className="sm:hidden">AR View</span>
        </motion.button>
      )}

      {/* Control Hints */}
      {!isLoading && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-10 left-10 gap-8 z-20 hidden lg:flex"
        >
            {['Rotate', 'Zoom', 'Pan'].map((label) => (
            <div key={label} className="text-[10px] uppercase tracking-[0.5em] text-[#F4F1EE]/80 border-b border-[#8B5E3C]/30 pb-2 font-black">
                {label}
            </div>
            ))}
        </motion.div>
      )}

      {/* AR Modal */}
      {showQR && (
        <div 
          onClick={() => setShowQR(false)}
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[9999] p-4 sm:p-6"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()} 
            className="bg-[#0D0D0D] border border-white/5 p-6 sm:p-10 lg:p-12 flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 max-w-xs sm:max-w-sm w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
          >
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-light tracking-[0.3em] uppercase text-[#8B5E3C] mb-2 sm:mb-3">AR Portal</p>
              <div className="w-12 h-[1px] bg-[#8B5E3C] mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#F4F1EE]/80 leading-relaxed font-bold">Scan with your mobile device to anchor this asset in your environment</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-none shadow-[0_0_40px_rgba(139,94,60,0.2)]">
              <QRCodeSVG 
                value={modelUid 
                  ? `${getFrontendUrl(serverIp)}/ar/${modelUid}` 
                  : `${getFrontendUrl(serverIp)}/ar-image?url=${encodeURIComponent(url)}`
                } 
                size={180}
                level="H"
              />
            </div>
            
            <button 
                onClick={() => setShowQR(false)} 
                className="text-[10px] uppercase tracking-[0.5em] text-[#F4F1EE]/60 hover:text-[#8B5E3C] transition-colors font-bold"
            >
                Close Studio Portal
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
