/**
 * Generate a WAT file with embedded data
 *
 * @param data The data to embed in the WAT file
 * @param options Options for generating the WAT file
 * @returns The WAT file content as a string
 */
import path from "path";
import fs from "fs";
export function generateWat(data, options = {}) {
    // Get the template content
    let template = "";
    const possiblePaths = [
        path.join(__dirname, "..", "template.wat"),
        /*
          path.join(dirPath, '..', '..', 'template.wat'),
          path.join(process.cwd(), 'template.wat'),
          path.join(process.cwd(), 'node_modules', 'orbitals-container-generator', 'template.wat')
    */
    ];
    let templateFound = false;
    for (const templatePath of possiblePaths) {
        try {
            template = fs.readFileSync(templatePath, "utf-8");
            templateFound = true;
            break;
        }
        catch (e) {
            // Continue to the next path
        }
    }
    // Convert data to hex string
    let hexData = "";
    for (let i = 0; i < data.length; i++) {
        const byte = data[i].toString(16).padStart(2, "0");
        hexData += `\\${byte}`;
    }
    // Replace placeholders in the template
    return template
        .replace("DATA_PLACEHOLDER", hexData)
        .replace(/DATA_SIZE/g, data.length.toString());
}
/**
 * Generate a WASM file with embedded data
 *
 * @param data The data to embed in the WASM file
 * @param wat2wasm Function to convert WAT to WASM
 * @param options Options for generating the WASM file
 * @returns Promise that resolves to the WASM file content as a Uint8Array
 */
export async function generateWasm(data, wat2wasm, options = {}) {
    // Generate the WAT file
    const wat = generateWat(data, options);
    // Convert WAT to WASM using the provided function
    return await wat2wasm(wat);
}
