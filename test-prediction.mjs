import { Client } from '@gradio/client';
import fs from 'fs';

async function run() {
  const imageBlob = new Blob([fs.readFileSync('public/hero-home.png')]); // any image

  try {
      console.log(`Connecting to Tencent/Hunyuan3D-2...`);
      const client = await Client.connect('Tencent/Hunyuan3D-2');
      
      console.log('Sending predict...');
      const result = await client.predict('/generation_all', [
        "", // Text Prompt
        imageBlob, // Image
        null, // Front
        null, // Back
        null, // Left
        null, // Right
        30, // Inference Steps
        5, // Guidance Scale
        1234, // Seed
        256, // Octree Resolution
        true, // Remove Background
        8000, // Number of Chunks
        true, // Randomize seed
      ]);
      console.log('Success!', result);
  } catch (e) {
      console.error('Error during predict:', e);
  }
}
run();
