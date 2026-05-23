import { Client } from '@gradio/client';
import fs from 'fs';

async function testSpace(name) {
  try {
    const client = await Client.connect(name);
    const api = client.view_api();
    fs.writeFileSync(`endpoints-${name.replace('/', '-')}.json`, JSON.stringify(api, null, 2));
    console.log(`Saved endpoints for ${name}`);
  } catch (err) {
    console.log(`[ERROR] ${name}: ${err.message}`);
  }
}

async function run() {
  await testSpace('Jbowyer/Hunyuan3D-2.1');
  await testSpace('Tencent/Hunyuan3D-2');
}

run();
