const RadrService = require('./services/radrService');

async function testWASM() {
    console.log("Testing ShadowWire WASM Initialization...");
    try {
        await RadrService.init();
        console.log("SUCCESS: ShadowWire initialized correctly.");
    } catch (error) {
        console.error("FAILURE: ShadowWire initialization failed.");
        console.error(error);
        process.exit(1);
    }
}

testWASM();