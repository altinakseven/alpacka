import * as path from 'path';
import { generateWasm } from '../src/index';
import wabt from "wabt";
function createMockContext() {
    return new Uint8Array(Buffer.from('020000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e8030000000000000000000000000000', 'hex'));
}
const readArrayBufferAsUtf8 = (memory, ptr) => {
    return Buffer.from(Array.from(new Uint8Array(readArrayBuffer(memory, ptr)))).toString("utf8");
};
const readArrayBuffer = (memory, ptr) => {
    const ary = Array.from(new Uint8Array(memory.buffer));
    const data = Buffer.from(ary);
    const length = data.readUInt32LE(ptr - 4);
    return new Uint8Array(ary.slice(ptr, ptr + length)).buffer;
};
const addHexPrefix = (v) => v.substr(2) === '0x' ? v : '0x' + v;
const stripHexPrefix = (v) => addHexPrefix(v).substr(2);
const toHex = (ary) => addHexPrefix(Buffer.from(ary).toString('hex'));
const readArrayBufferAsHex = (memory, ptr) => {
    return ("0x" +
        Buffer.from(Array.from(new Uint8Array(readArrayBuffer(memory, ptr)))).toString("hex"));
};
const toU32LEBytes = (n) => {
    const ary = new Uint32Array(1);
    ary[0] = n;
    const byteArray = new Uint8Array(ary.buffer);
    return Buffer.from(Array.from(byteArray));
};
const writeArrayBuffer = (memory, ptr, buffer) => {
    const view = new Uint8Array(memory.buffer);
    const full = Buffer.concat([toU32LEBytes(buffer.length), buffer]);
    for (let i = 0; i < full.length; i++) {
        view[ptr - 4 + i] = full.readUInt8(i);
    }
};
describe('WebAssembly Alkane Environment Tests', () => {
    // Test data to be embedded in the WASM module
    const testData = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]); // "hello" in ASCII
    const wat2wasm = async (wat) => {
        const module = await wabt().then((wabt) => wabt.parseWat(path.join(__dirname, '..', 'template.wat'), wat));
        const { buffer } = module.toBinary({});
        module.destroy();
        return new Uint8Array(buffer);
    };
    // Mock context with opcode 1000
    // Create a mock WebAssembly environment for alkanes
    const createMockWasmEnv = (getInstance, contextData) => {
        let contextSize = contextData.length;
        // Mock environment functions
        const env = {
            // Required by the template.wat
            abort: (a, b, c, d) => {
                throw new Error(`WASM aborted: ${a}, ${b}, ${c}, ${d}`);
            },
            // Context functions required by the template.wat
            __request_context: () => {
                return contextSize;
            },
            __load_context: (ptr) => {
                // Copy the context data to the specified memory location
                writeArrayBuffer(getInstance().exports.memory, ptr, Buffer.from(contextData));
            },
            // Memory export - provide a memory instance
            memory: new WebAssembly.Memory({ initial: 1 })
        };
        return { env };
    };
    // Helper function to read memory from WASM
    const readMemory = (memory, offset, length) => {
        return new Uint8Array(memory.buffer, offset, length);
    };
    // Helper function to parse a CallResponse from memory
    const parseCallResponse = (memory, ptr) => {
        const memoryBuffer = new Uint8Array(memory.buffer);
        const dataView = new DataView(memory.buffer);
        // Go back 4 bytes to get the size
        const totalSize = dataView.getUint32(ptr - 4, true); // true for little-endian
        // First 16 bytes are the alkanes count
        const alkanes = Number(dataView.getBigUint64(ptr, true)); // Read first 8 bytes of alkanes count
        // Next 4 bytes are the storage length
        const storageLength = dataView.getUint32(ptr + 16, true);
        // The rest is the data
        // Ensure we don't create a negative length array
        const dataSize = Math.max(0, totalSize - 16 - 4); // 16 bytes for alkanes, 4 bytes for storage length
        const data = new Uint8Array(memory.buffer, ptr + 16 + 4, dataSize); // data starts after alkanes and storage length
        return { alkanes, storage: storageLength, data };
    };
    test('should return data when opcode is 1000', async () => {
        // Convert WAT to WASM using wabt
        const wasmBinary = await generateWasm(testData, wat2wasm);
        // Create a simple environment
        let _instance;
        const getInstance = () => _instance;
        const { env } = createMockWasmEnv(getInstance, createMockContext());
        // Instantiate the WASM module
        const { instance } = await WebAssembly.instantiate(wasmBinary, { env });
        _instance = instance;
        // Call the __execute function
        const result = instance.exports.__execute();
        // Get the data from memory
        const memory = instance.exports.memory;
        const { data, storage } = parseCallResponse(memory, result);
        // Verify that the data matches our test data
        expect(toHex(data)).toEqual(toHex(testData));
    });
});
