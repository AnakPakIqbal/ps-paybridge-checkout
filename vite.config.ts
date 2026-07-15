import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Built output is consumed by the ps-paybridge Express app, which serves the
// checkout page under the /checkout/ prefix (GET /checkout/:id for the HTML
// shell, GET /checkout/assets/* for static files) — base must match that
// prefix or every built <script>/<link> reference will 404, and outDir must
// land directly in that Express app's public/checkout/ so no backend changes
// are needed to serve the build.
export default defineConfig({
  plugins: [react()],
  base: '/checkout/',
  build: {
    outDir: '../public/checkout',
    emptyOutDir: true,
    // lucide-react's barrel export doesn't tree-shake cleanly with Rollup,
    // so the main chunk includes unused icons pushing it past the default
    // 500kB warning threshold even though gzip size (~250kB) is reasonable.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          gsap: ['gsap'],
        },
      },
    },
  },
});
