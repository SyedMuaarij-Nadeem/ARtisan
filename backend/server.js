import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve extracted models statically
const modelsDir = path.join(__dirname, 'models');

// Flush the models cache every time the server starts
if (fs.existsSync(modelsDir)) {
  fs.rmSync(modelsDir, { recursive: true, force: true });
}
fs.mkdirSync(modelsDir);

app.use('/models', express.static(modelsDir));

const SKETCHFAB_API_TOKEN = process.env.SKETCHFAB_API_TOKEN;

// Route 1: Search Models
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get('https://api.sketchfab.com/v3/search', {
      params: {
        type: 'models',
        downloadable: true,
        q: q || ''
      }
    });
    
    // We only need specific fields for the frontend
    const results = response.data.results.map(model => ({
      uid: model.uid,
      name: model.name,
      author: model.user?.displayName || 'Unknown',
      thumbnail: model.thumbnails?.images?.find(img => img.width >= 300)?.url || model.thumbnails?.images?.[0]?.url,
      vertexCount: model.vertexCount,
      faceCount: model.faceCount,
    }));

    res.json({ results });
  } catch (error) {
    console.error("Error searching Sketchfab:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch models from Sketchfab' });
  }
});

// Route 2: Download & Extract Model
app.get('/api/model/:uid', async (req, res) => {
  const { uid } = req.params;
  
  if (!SKETCHFAB_API_TOKEN) {
    return res.status(500).json({ error: 'SKETCHFAB_API_TOKEN is not configured on the server.' });
  }

  try {
    // Check if model already extracted
    const extractPath = path.join(modelsDir, uid);
    if (fs.existsSync(extractPath) && fs.existsSync(path.join(extractPath, 'scene.gltf'))) {
      return res.json({ 
        modelUrl: `http://localhost:${PORT}/models/${uid}/scene.gltf` 
      });
    }

    // Attempt to download the model from Sketchfab
    const response = await axios.get(`https://api.sketchfab.com/v3/models/${uid}/download`, {
      headers: {
        Authorization: `Token ${SKETCHFAB_API_TOKEN}`
      }
    });

    // Determine the ZIP url. Sketchfab provides it under 'gltf'
    const zipUrl = response.data.gltf?.url || response.data.glb?.url;
    if (!zipUrl) {
      return res.status(404).json({ error: 'No downloadable file found for this model.' });
    }

    // Download the ZIP file to memory
    const zipRes = await axios.get(zipUrl, { responseType: 'arraybuffer' });
    
    // Save to disk
    const zipPath = path.join(modelsDir, `${uid}.zip`);
    fs.writeFileSync(zipPath, zipRes.data);

    // Extract the zip
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    // Clean up the ZIP file
    fs.unlinkSync(zipPath);

    // Return the URL pointing to the static file
    res.json({ 
      modelUrl: `http://localhost:${PORT}/models/${uid}/scene.gltf` 
    });
  } catch (error) {
    console.error("Error downloading/extracting Sketchfab model:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to download or extract model from Sketchfab' });
  }
});

app.listen(PORT, () => {
  console.log(`ARtisan Backend proxy running on http://localhost:${PORT}`);
});
