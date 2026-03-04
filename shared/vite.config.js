import { resolve, join } from "path";
import fs from "fs";
import { defineConfig, loadEnv } from "vite";
import { Watcher } from "./plugins/watcher";
import { Layout } from "./plugins/layout";
import { Controller } from "./plugins/controller";
import { Imagemin } from "./plugins/imagemin";
import { Linter } from "./plugins/linter";

let input = {};

function fromDir(startPath, filter) {
	if (!fs.existsSync(startPath)) {
		console.log("no dir ", startPath);
		return;
	}

	var files = fs.readdirSync(startPath);
	for (var i = 0; i < files.length; i++) {
		var filename = join(startPath, files[i]);
		var stat = fs.lstatSync(filename);
		if (stat.isDirectory()) {
			fromDir(filename, filter); //recurse
		} else if (filename.indexOf(filter) >= 0) {
			input[filename] = resolve(__dirname, filename);
		}
	}
}

// Get project name from environment or command line
const projectName = process.env.VITE_PROJECT || process.argv[2] || 'ibatabeENG';
const projectPath = resolve(__dirname, '../projects', projectName);

if (!fs.existsSync(projectPath)) {
	console.error(`Project ${projectName} not found at ${projectPath}`);
	process.exit(1);
}

fromDir(join(projectPath, 'src'), ".html");

module.exports = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd())
	const base = env.VITE_BASE_URL || '/';

	return {
		root: join(projectPath, 'src'),
		publicDir: join(projectPath, 'src/_public'),
		base,
		server: {
			open: true,
			port: 3000 + (projectName === 'kantogiken' ? 1 : 0), // Different ports
			fs: {
				allow: [resolve(__dirname), projectPath]
			}
		},
		build: {
			outDir: join(projectPath, 'dist'),
			rollupOptions: {
				input: {
					style: resolve(__dirname, '_scss/style.js')
				},
				external: (id) => id.startsWith('/assets/') || id.startsWith('/favicon.svg') || id.startsWith('/_scss/'),
				output: {
					entryFileNames: 'assets/js/[name].js',
					assetFileNames: (data) => {
						var ext = /(?:\.([^.]+))?$/.exec(data.name)[1];
						return `assets/${ext}/[name].[ext]`
					}
				},
			},
			minify: true,
		},
		resolve: {
			alias: {
				'@shared': resolve(__dirname),
				'@layouts': resolve(__dirname, '_layouts'),
				'@partials': resolve(__dirname, '_partials'),
				'@scss': resolve(__dirname, '_scss'),
				'@public': resolve(__dirname, '_public'),
				'@plugins': resolve(__dirname, 'plugins')
			}
		},

		plugins: [
			{
				name: 'scss-dev-server',
				configureServer(server) {
					server.middlewares.use((req, res, next) => {
						if (req.url === '/assets/css/style.css') {
							const fs = require('fs');
							const path = require('path');
							const sass = require('sass');
							
							try {
								const scssPath = resolve(__dirname, '_scss/style.scss');
								const result = sass.compile(scssPath);
								
								res.setHeader('Content-Type', 'text/css');
								res.end(result.css);
							} catch (e) {
								console.error('SCSS compilation error:', e);
								res.statusCode = 500;
								res.end('SCSS compilation error');
							}
							return;
						}
						next();
					});
				}
			},
			Watcher([
				'**/*.ejs',
				'_public/**',
				'_data/**'
			]),
			{
				name: 'ejs-processor',
				transformIndexHtml: {
					enforce: "pre",
					transform(html, ctx) {
						// Process EJS before Vite parses HTML
						try {
							const ejs = require('ejs');
							const fs = require('fs');
							const dataFile = join(projectPath, 'src/_data/data.json');
							let data = {};
							
							if (fs.existsSync(dataFile)) {
								const dataRaw = fs.readFileSync(dataFile, 'utf8');
								data = JSON.parse(dataRaw);
							}
							
							// Add required variables
							data.url = base;
							data.BASE_URL = base;
							data.MODE = mode;
							data.PROD = mode === 'production';
							data.DEV = mode !== 'production';
							
							// Determine partial paths
							function getPartialPath(partialName) {
								const projectPartial = join(projectPath, 'src/_partials', partialName + '.ejs');
								const sharedPartial = resolve(__dirname, '_partials', partialName + '.ejs');
								
								if (fs.existsSync(projectPartial)) {
									return projectPartial;
								}
								return sharedPartial;
							}
							
							data.headerPartialPath = getPartialPath('header');
							data.footerPartialPath = getPartialPath('footer');
							
							// Process EJS includes
							html = ejs.render(html, data, {
								views: [join(projectPath, 'src'), resolve(__dirname), resolve(__dirname, '_partials'), resolve(__dirname, '_layouts')],
								filename: ctx.filename
							});
							
							return html;
						} catch (e) {
							console.error('EJS processing error:', e);
							return html;
						}
					}
				}
			},
			Layout({
				dataFile: join(projectPath, 'src/_data/data.json'),
				ejs: {
					views: [join(projectPath, 'src'), resolve(__dirname)],
				},
			}),
			Controller(),
			{
				name: 'html-generator',
				generateBundle(options, bundle) {
					// Process HTML files after build
					const fs = require('fs');
					const path = require('path');
					
					// Find HTML files in project src
					const srcDir = join(projectPath, 'src');
					const htmlFiles = [];
					
					function findHtmlFiles(dir) {
						if (!fs.existsSync(dir)) return;
						
						const files = fs.readdirSync(dir);
						for (const file of files) {
							const fullPath = path.join(dir, file);
							const stat = fs.lstatSync(fullPath);
							
							if (stat.isDirectory()) {
								findHtmlFiles(fullPath);
							} else if (file.endsWith('.html')) {
								htmlFiles.push(fullPath);
							}
						}
					}
					
					findHtmlFiles(srcDir);
					
					// Process each HTML file
					for (const htmlFile of htmlFiles) {
						try {
							let html = fs.readFileSync(htmlFile, 'utf8');
							const relativePath = path.relative(srcDir, htmlFile);
							const outputPath = path.join(join(projectPath, 'dist'), relativePath);
							
							// Process EJS
							const ejs = require('ejs');
							const dataFile = join(projectPath, 'src/_data/data.json');
							let data = {};
							
							if (fs.existsSync(dataFile)) {
								const dataRaw = fs.readFileSync(dataFile, 'utf8');
								data = JSON.parse(dataRaw);
							}
							
							data.url = base;
							data.BASE_URL = base;
							data.MODE = mode;
							data.PROD = mode === 'production';
							data.DEV = mode !== 'production';
							
							// Determine partial paths
							function getPartialPath(partialName) {
								const projectPartial = path.join(projectPath, 'src/_partials', partialName + '.ejs');
								const sharedPartial = path.resolve(__dirname, '_partials', partialName + '.ejs');
								
								if (fs.existsSync(projectPartial)) {
									return projectPartial;
								}
								return sharedPartial;
							}
							
							data.headerPartialPath = getPartialPath('header');
							data.footerPartialPath = getPartialPath('footer');
							
							html = ejs.render(html, data, {
								views: [srcDir, resolve(__dirname), resolve(__dirname, '_partials'), resolve(__dirname, '_layouts')],
								filename: htmlFile
							});
							
							// Ensure output directory exists
							const outputDir = path.dirname(outputPath);
							if (!fs.existsSync(outputDir)) {
								fs.mkdirSync(outputDir, { recursive: true });
							}
							
							// Write processed HTML
							fs.writeFileSync(outputPath, html);
							console.log(`Generated: ${outputPath}`);
							
						} catch (e) {
							console.error(`Error processing ${htmlFile}:`, e);
						}
					}
				}
			},
			Imagemin({
				gifsicle: {
					optimizationLevel: 7,
					interlaced: false,
				},
				optipng: {
					optimizationLevel: 7,
				},
				jpegTran: {
					progressive: true,
				},
				svgo: {
					plugins: [
						{
							name: 'removeViewBox',
						},
						{
							name: 'removeEmptyAttrs',
							active: false,
						},
					],
				},
			}),
			Linter({
				errorOverlay: mode === 'development',
				htmlhint: {
					files: ['src/**/*.{html,ejs}'],
				},
				stylelint: {
					files: ['src/**/*.{vue,css,scss,sass,less,styl,svelte}'],
					fix: false
				},
				eslint: {
					files: ['src/_public/assets/js/**/*.js'],
					options: {
						fix: false
					}
				}
			}),
		],
	}
});
