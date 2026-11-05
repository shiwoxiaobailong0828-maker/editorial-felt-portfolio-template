import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: path.resolve(import.meta.dirname, 'assets'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/mascot3d/mascot.js'),
      name: 'Mascot3D',
      formats: ['iife'],
      fileName: () => 'mascot3d.js',
    },
  },
});
