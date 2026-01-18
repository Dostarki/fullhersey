const fs = require('fs');
const wasmBase64 = fs.readFileSync('wasm_base64.txt', 'utf8').trim();
module.exports = wasmBase64;