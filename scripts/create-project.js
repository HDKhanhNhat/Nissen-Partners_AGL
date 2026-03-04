#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectName = process.argv[2];

if (!projectName) {
    console.error('Please provide a project name: node create-project.js <project-name>');
    process.exit(1);
}

const projectPath = path.join(__dirname, '../projects', projectName);

if (fs.existsSync(projectPath)) {
    console.error(`Project ${projectName} already exists at ${projectPath}`);
    process.exit(1);
}

// Create project structure
const dirs = [
    'src',
    'src/_data',
    'src/_public',
    'src/_public/assets',
    'src/_public/assets/img',
    'src/_partials',
    'dist'
];

dirs.forEach(dir => {
    const fullPath = path.join(projectPath, dir);
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created: ${fullPath}`);
});

// Copy template data.json
const templateDataPath = path.join(__dirname, '../projects/ibatabeENG/src/_data/data.json');
const targetDataPath = path.join(projectPath, 'src/_data/data.json');

if (fs.existsSync(templateDataPath)) {
    fs.copyFileSync(templateDataPath, targetDataPath);
    console.log(`Copied data.json to ${targetDataPath}`);
}

// Create sample index.html
const indexHtml = `<%- include('../../shared/_layouts/layout.ejs', { title: '${projectName} - Home', pageid: 'home' }); -%>

<!-- @meta -->
<meta name="description" content="${projectName} - Professional services">
<!-- @@meta -->

<!-- @content -->
<div class="top">
   <section class="top-mv">
    <div class="top-mv__wrap">
        <div class="top-mv__img">
            <img src="/assets/img/top/mv.jpg" alt="">
        </div>
        <div class="top-mv__content">
            <h2 class="top-mv__title">
                <span>Welcome to</span>
                <span>${projectName}</span>
            </h2>
            <p class="top-mv__text">Professional services for your business needs.</p>
        </div>
    </div>
   </section>
</div>
<!-- @@content -->`;

fs.writeFileSync(path.join(projectPath, 'src/index.html'), indexHtml);
console.log(`Created: ${path.join(projectPath, 'src/index.html')}`);

// Copy shared assets to project
const sharedAssetsPath = path.join(__dirname, '../shared/_public/assets');
const projectAssetsPath = path.join(projectPath, 'src/_public/assets');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

if (fs.existsSync(sharedAssetsPath)) {
    copyRecursiveSync(sharedAssetsPath, projectAssetsPath);
    console.log(`Copied shared assets to ${projectAssetsPath}`);
}

// Copy favicon
const faviconPath = path.join(__dirname, '../shared/_public/favicon.svg');
if (fs.existsSync(faviconPath)) {
    fs.copyFileSync(faviconPath, path.join(projectPath, 'src/_public/favicon.svg'));
    console.log(`Copied favicon to project`);
}

// Add scripts to package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add dev and build scripts for the new project
const baseUrl = '/'; // Default base URL, can be customized per project
packageJson.scripts[`dev:${projectName}`] = `set VITE_PROJECT=${projectName}&& set VITE_BASE_URL=${baseUrl}&& vite --config shared/vite.config.js`;
packageJson.scripts[`build:${projectName}`] = `set VITE_PROJECT=${projectName}&& set VITE_BASE_URL=${baseUrl}&& vite build --config shared/vite.config.js --emptyOutDir`;

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`\n✅ Added npm scripts for ${projectName}:`);
console.log(`   npm run dev:${projectName}`);
console.log(`   npm run build:${projectName}`);

console.log(`\n✅ Project ${projectName} created successfully!`);
console.log(`\nNext steps:`);
console.log(`1. cd projects/${projectName}`);
console.log(`2. Add your images to src/_public/assets/img/`);
console.log(`3. Update src/_data/data.json with your project data`);
console.log(`4. Run: npm run dev:${projectName}`);
