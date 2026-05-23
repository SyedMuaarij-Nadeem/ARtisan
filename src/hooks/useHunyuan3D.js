// src/hooks/useHunyuan3D.js
// Connects to the Hunyuan3D-2.1 Gradio Space and generates a GLB model from an image.
import { useState, useCallback } from 'react';
import { Client } from '@gradio/client';

export function useHunyuan3D() {
  const [status, setStatus] = useState('idle'); // idle | connecting | generating | done | error
  const [meshUrl, setMeshUrl] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0); // 0–100

  const generate = useCallback(async (imageFile, options = {}) => {
    setStatus('connecting');
    setMeshUrl(null);
    setError(null);
    setProgress(0);

    try {
      const client = await Client.connect('Jbowyer/Hunyuan3D-2.1', {
        hf_token: import.meta.env.VITE_HF_TOKEN,
      });
      setStatus('generating');
      setProgress(10);

      // Simulate progress ticks while the model runs
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 88 ? prev + 3 : prev));
      }, 5500);

      const result = await client.predict('/generation_all', [
        "", // Text Prompt
        imageFile, // Image
        null, // Front
        null, // Back
        null, // Left
        null, // Right
        options.steps ?? 30, // Original Inference Steps
        options.guidanceScale ?? 5, // Guidance Scale
        options.seed ?? 1234, // Seed
        options.octreeResolution ?? 256, // Original High Resolution
        options.removeBackground ?? true, // Remove Background
        options.numChunks ?? 8000, // Number of Chunks
        options.randomizeSeed ?? true, // Randomize seed
      ]);

      clearInterval(progressInterval);
      setProgress(95);

      // Extract GLB URL from Gradio result wrappers
      function extractUrl(item) {
        if (!item) return null;
        if (typeof item === 'string' && item.startsWith('http')) return item;
        if (item.__type__ === 'update' && item.value) return extractUrl(item.value);
        if (item.url) return item.url;
        if (item.path) return item.path;
        if (item.value) return extractUrl(item.value);
        return null;
      }

      const url = extractUrl(result.data[1]) ?? extractUrl(result.data[0]);
      if (url) {
        setMeshUrl(url);
        setProgress(100);
        setStatus('done');
      } else {
        throw new Error('No model URL returned from API.');
      }

    } catch (err) {
      console.error('Hunyuan3D generation error:', err);
      let msg = err.message ?? 'Unknown error occurred.';
      if (msg.includes('CUDA') || msg.includes('memory')) {
        msg = 'The AI server is currently overloaded. Please wait 1-2 minutes and try again with a smaller image.';
      }
      setError(msg);
      setStatus('error');
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setMeshUrl(null);
    setError(null);
    setProgress(0);
  }, []);

  return { generate, status, meshUrl, error, progress, reset };
}
