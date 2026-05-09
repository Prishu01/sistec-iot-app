#!/usr/bin/env node

/**
 * Build script for SISTec IoT Application
 * Handles project setup and initialization
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process for SISTec IoT App...\n');

// Define required directories
const requiredDirs = [
  'public',
  'views'
];

// Define required files
const requiredFiles = {
  'public/style.css': 'style.css',
  'views/dashboard.html': 'dashboard.html',
  'views/index.html': 'index.html',
  'views/register.html': 'register.html'
};

// Check and create required directories
console.log('📁 Checking directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✓ Created directory: ${dir}`);
  } else {
    console.log(`   ✓ Directory exists: ${dir}`);
  }
});

// Check required files
console.log('\n📄 Checking required files...');
Object.keys(requiredFiles).forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠ Missing file: ${file}`);
  } else {
    console.log(`   ✓ File exists: ${file}`);
  }
});

// Create database directory if it doesn't exist
console.log('\n💾 Ensuring database directory exists...');
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('   ✓ Created data directory');
} else {
  console.log('   ✓ Data directory exists');
}

// Create .env file if it doesn't exist
console.log('\n⚙️  Checking environment configuration...');
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  const envContent = `# SISTec IoT App Environment Variables
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database.db
SECRET_KEY=sistecsecret
`;
  fs.writeFileSync(envFile, envContent);
  console.log('   ✓ Created .env file with default configuration');
} else {
  console.log('   ✓ .env file already exists');
}

// Create .gitignore if it doesn't exist
console.log('\n🔒 Checking git configuration...');
const gitignoreFile = path.join(__dirname, '.gitignore');
if (!fs.existsSync(gitignoreFile)) {
  const gitignoreContent = `# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local
.env.*.local

# Database
*.db
database.db

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
`;
  fs.writeFileSync(gitignoreFile, gitignoreContent);
  console.log('   ✓ Created .gitignore file');
} else {
  console.log('   ✓ .gitignore already exists');
}

// Verify node_modules exists (dependencies installed)
console.log('\n📦 Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('   ⚠ node_modules not found. Run: npm install');
} else {
  console.log('   ✓ Dependencies installed');
}

console.log('\n✅ Build process completed successfully!');
console.log('📝 Next steps:');
console.log('   1. If you haven\'t already, run: npm install');
console.log('   2. Start the server: npm start');
console.log('   3. Open your browser: http://localhost:3000\n');

process.exit(0);
