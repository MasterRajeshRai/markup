const fs = require('fs');
const path = require('path');

const prismaBuildDir = path.resolve('G:/headless/node_modules/.pnpm/prisma@6.19.3_typescript@5.9.3/node_modules/prisma/build');
const clientRuntimeDir = path.resolve('G:/headless/node_modules/.pnpm/@prisma+client@6.19.3_prism_1d040ab5215f59f0e27ddee7f0cf082e/node_modules/@prisma/client/runtime');

if (!fs.existsSync(clientRuntimeDir)) {
  fs.mkdirSync(clientRuntimeDir, { recursive: true });
}

const files = fs.readdirSync(prismaBuildDir);
for (const file of files) {
  if (file.endsWith('.wasm')) {
    const wasmPath = path.join(prismaBuildDir, file);
    const wasmData = fs.readFileSync(wasmPath);
    const base64Content = wasmData.toString('base64');
    const outName = file + '-base64.js';
    const outPath = path.join(clientRuntimeDir, outName);
    fs.writeFileSync(outPath, `module.exports = { wasm: ${JSON.stringify(base64Content)} };\n`);
    console.log(`Generated ${outName}`);
  }
}
console.log('All wasm-base64 files generated successfully!');
