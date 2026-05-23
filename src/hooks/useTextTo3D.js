import { useState, useCallback } from 'react';

// A mock hook to simulate Text-to-3D generation
export function useTextTo3D() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'connecting' | 'generating' | 'done' | 'error'
  const [progress, setProgress] = useState(0);
  const [meshUrl, setMeshUrl] = useState(null);
  const [error, setError] = useState(null);

  const generate = useCallback((prompt, options) => {
    setStatus('connecting');
    setProgress(0);
    setError(null);
    setMeshUrl(null);

    // Simulate connecting
    setTimeout(() => {
      setStatus('generating');
      let currentProgress = 0;
      
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setProgress(100);
          
          // Simulate completion by returning a placeholder or letting the viewer handle an empty state gracefully
          setTimeout(() => {
             setStatus('done');
             // For demonstration, we'll use a placeholder model or just leave it null if no placeholder exists.
             // We can use a generic cube if you have one, or just let it finish.
             setMeshUrl('placeholder_model_url'); // Ideally a real URL, but for frontend mockup this triggers the viewer
          }, 1000);
        } else {
          setProgress(currentProgress);
        }
      }, 800); // Progress tick every 800ms
    }, 1500);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setMeshUrl(null);
    setError(null);
  }, []);

  return { generate, status, meshUrl, error, progress, reset };
}
