import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@auth': path.resolve(__dirname, 'src/auth'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@utils': path.resolve(__dirname, 'src/utils'),
			'@services': path.resolve(__dirname, 'src/services'),
			'@store': path.resolve(__dirname, 'src/store'),
		},
	},
});
