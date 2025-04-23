#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import { generateWasm } from './index';
import wabt from 'wabt';
// Define the CLI program
// Define the CLI program
const program = new Command();
program
    .name('orbitals-container-generate')
    .description('Generate a container WASM file from input data')
    .version('0.1.0');
// Add the generate command
program
    .command('generate')
    .description('Generate a container WASM file from input data')
    .argument('<input>', 'Input file path (any file type)')
    .option('-o, --output <output>', 'Output file path', 'container.wasm')
    .option('-t, --template <template>', 'Custom template WAT file path')
    .action(async (input, options) => {
    try {
        // Read the input file
        console.log(`Reading input file: ${input}`);
        const inputData = fs.readFileSync(input);
        // Convert to Uint8Array
        const data = new Uint8Array(inputData);
        console.log(`Input file size: ${data.length} bytes`);
        // Define the wat2wasm function using wabt
        const wat2wasm = async (wat) => {
            const wabtInstance = await wabt();
            const module = wabtInstance.parseWat('template.wat', wat);
            const { buffer } = module.toBinary({});
            module.destroy();
            return new Uint8Array(buffer);
        };
        // Generate the WASM file
        console.log('Generating WASM file...');
        const containerOptions = options.template ? { template: options.template } : {};
        const wasmBinary = await generateWasm(data, wat2wasm, containerOptions);
        // Write the output file
        console.log(`Writing output file: ${options.output}`);
        fs.writeFileSync(options.output, wasmBinary);
        console.log(`Successfully generated container WASM file: ${options.output}`);
        console.log(`Output file size: ${wasmBinary.length} bytes`);
    }
    catch (error) {
        console.error('Error generating container WASM file:', error);
        process.exit(1);
    }
});
// Add a default command that just runs the generate command
program
    .action(() => {
    console.error('Please specify a command or use --help for usage information');
    process.exit(1);
});
// Parse command line arguments
program.parse();
