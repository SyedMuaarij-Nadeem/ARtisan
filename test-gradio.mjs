import { Client } from '@gradio/client';

async function testSpace(name) {
  console.log(`\nTesting ${name}...`);
  try {
    const client = await Client.connect(name);
    console.log(`[SUCCESS] Connected to ${name}`);
    
    // optionally list endpoints to see if it matches our needs
    // endpoints vary by space.
    // console.log(client.view_api());
  } catch (err) {
    console.log(`[ERROR] ${name}: ${err.message}`);
  }
}

async function run() {
  await testSpace('Jbowyer/Hunyuan3D-2.1');
  await testSpace('Tencent/Hunyuan3D-2');
  await testSpace('Tencent/Hunyuan3D-1');
  await testSpace('TencentARC/Hunyuan3D-1');
}

run();
