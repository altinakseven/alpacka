/**
 * Options for generating a container
 */
export interface ContainerOptions {
    /**
     * Optional template to use instead of the default
     */
    template?: string;
    /**
     * Optional template content to use instead of loading from a file
     */
    templateContent?: string;
}
export declare function generateWat(data: Uint8Array, options?: ContainerOptions): string;
/**
 * Interface for the wat2wasm function
 */
export interface Wat2Wasm {
    (wat: string): Promise<Uint8Array>;
}
/**
 * Generate a WASM file with embedded data
 *
 * @param data The data to embed in the WASM file
 * @param wat2wasm Function to convert WAT to WASM
 * @param options Options for generating the WASM file
 * @returns Promise that resolves to the WASM file content as a Uint8Array
 */
export declare function generateWasm(data: Uint8Array, wat2wasm: Wat2Wasm, options?: ContainerOptions): Promise<Uint8Array>;
