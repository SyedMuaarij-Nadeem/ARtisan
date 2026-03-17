import LightRays from './LightRays';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#00e5ff"
          raysSpeed={1.3}
          lightSpread={0.6}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.2}
          noiseAmount={0.1}
          distortion={0.1}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1.6}
        />
      </div>
      
      {/* Retain the base soft glows behind the LightRays */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[150px]"></div>
    </div>
  );
};
