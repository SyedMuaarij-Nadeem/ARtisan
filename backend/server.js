import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

function getLocalIP() {
  if (process.env.HOST_IP) return process.env.HOST_IP;
  const interfaces = os.networkInterfaces();
  
  // First pass: try to find Wi-Fi or physical Ethernet
  for (const name of Object.keys(interfaces)) {
    const isPrimary = name.toLowerCase().includes('wi-fi') || (name.toLowerCase().includes('ethernet') && !name.toLowerCase().includes('veth') && !name.toLowerCase().includes('virtual'));
    if (isPrimary) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
          return iface.address;
        }
      }
    }
  }

  // Second pass: return any valid IPv4 that isn't the Windows Hotspot default
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && iface.address !== '192.168.137.1') {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIP();
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

app.use(cors());
app.use(express.json());

const modelsDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir);
app.use('/models', express.static(modelsDir));

const SKETCHFAB_API_TOKEN = process.env.SKETCHFAB_API_TOKEN;

function findModelFile(uid) {
  const gltfPath = path.join(modelsDir, uid, 'scene.gltf');
  if (fs.existsSync(gltfPath)) return { url: `${BASE_URL}/models/${uid}/scene.gltf`, type: 'gltf' };
  const glbPath = path.join(modelsDir, `${uid}.glb`);
  if (fs.existsSync(glbPath)) return { url: `${BASE_URL}/models/${uid}.glb`, type: 'glb' };
  return null;
}

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get('https://api.sketchfab.com/v3/search', {
      params: { type: 'models', downloadable: true, q: q || '' },
    });
    const results = response.data.results.map((m) => ({
      uid: m.uid, name: m.name,
      author: m.user?.displayName || 'Unknown',
      thumbnail: m.thumbnails?.images?.find((i) => i.width >= 300)?.url || m.thumbnails?.images?.[0]?.url,
      vertexCount: m.vertexCount,
      faceCount: m.faceCount,
    }));
    res.json({ results });
  } catch (e) { res.status(500).json({ error: 'Search failed' }); }
});

app.get('/api/model/:uid', async (req, res) => {
  const { uid } = req.params;
  const local = findModelFile(uid);
  if (local) { console.log(`[LOCAL] ${uid}`); return res.json({ modelUrl: local.url }); }
  if (!SKETCHFAB_API_TOKEN) return res.status(500).json({ error: 'Model not cached.' });
  try {
    const response = await axios.get(`https://api.sketchfab.com/v3/models/${uid}/download`,
      { headers: { Authorization: `Token ${SKETCHFAB_API_TOKEN}` } });
    const zipUrl = response.data.gltf?.url || response.data.glb?.url;
    if (!zipUrl) return res.status(404).json({ error: 'No file found.' });
    const extractPath = path.join(modelsDir, uid);
    const zipPath = path.join(modelsDir, `${uid}.zip`);
    const zipRes = await axios.get(zipUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(zipPath, zipRes.data);
    new AdmZip(zipPath).extractAllTo(extractPath, true);
    fs.unlinkSync(zipPath);
    res.json({ modelUrl: `${BASE_URL}/models/${uid}/scene.gltf` });
  } catch (e) {
    if (e.response?.status === 403) return res.status(403).json({ error: 'Sketchfab Pro required.' });
    res.status(500).json({ error: 'Download failed.' });
  }
});

app.get('/api/local-models', (req, res) => {
  try {
    const models = [];
    const entries = fs.readdirSync(modelsDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory() && fs.existsSync(path.join(modelsDir, e.name, 'scene.gltf')))
        models.push({ uid: e.name, modelUrl: `${BASE_URL}/models/${e.name}/scene.gltf`, type: 'gltf' });
      if (e.isFile() && e.name.endsWith('.glb'))
        models.push({ uid: e.name.replace('.glb', ''), modelUrl: `${BASE_URL}/models/${e.name}`, type: 'glb' });
    }
    res.json({ models });
  } catch (_) { res.status(500).json({ error: 'Could not list models.' }); }
});

app.get('/api/server-info', (req, res) => {
  res.json({ backendUrl: BASE_URL, localIP: LOCAL_IP });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ ARtisan Backend running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: ${BASE_URL}  ← open this on your phone\n`);
  try {
    const entries = fs.readdirSync(modelsDir, { withFileTypes: true });
    const g = entries.filter(e => e.isDirectory() && fs.existsSync(path.join(modelsDir, e.name, 'scene.gltf'))).length;
    const b = entries.filter(e => e.isFile() && e.name.endsWith('.glb')).length;
    console.log(`📦 Cache: ${g} GLTF + ${b} GLB models ready\n`);
  } catch (_) {}
});