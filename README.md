# alpacka

A CLI tool for packing binary content into WebAssembly (WASM) modules. Alpacka embeds any type of data into a WebAssembly module, making it easy to attach binary content to any alkane.

## Features

- Pack any binary content (images, audio, video, documents, etc.) into WASM modules
- Simple command-line interface
- Compatible with any alkane-based system
- Handles both relative and absolute file paths
- Automatically creates output directories as needed

## Installation

```bash
npm install -g alpacka
```

## CLI Usage

The basic command to pack binary content:

```bash
alpacka pack <input-file> [options]
```

### Options

- `-o, --output <output>`: Output file path (default: "<input-filename>.wasm")
- `-t, --template <template>`: Custom template WAT file path

### Examples

```bash
# Pack an image file
alpacka pack image.png

# Pack any binary file with a custom output path
alpacka pack document.pdf -o packed-document.wasm

# Pack audio content
alpacka pack audio.mp3 -o audio-content.wasm

# Using relative paths
alpacka pack ./data/video.mp4 -o ./output/video-content.wasm

# Output to a subdirectory (will be created if it doesn't exist)
alpacka pack binary-data.bin -o output/subdir/packed-data.wasm
```

## Container Format

The generated WASM container has the following structure:

1. A memory section with the embedded binary data
2. An `__execute` function that returns a pointer to a CallResponse structure
3. The CallResponse structure contains:
   - Metadata header
   - The embedded binary data

This format allows the packed content to be attached to any alkane and accessed through standard WebAssembly interfaces.

## Development

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/alpacka.git
cd alpacka

# Install dependencies
npm install

# Build the project
npm run build
```

## License

MIT
