#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'src/pages/HomePage.jsx';
const filePath = path.join(process.cwd(), file);

console.log(`Updating colors in: ${file}`);

let content = fs.readFileSync(filePath, 'utf8');

// Text colors
content = content.replace(/\btext-gray-900\b/g, 'text-color-foreground');
content = content.replace(/\btext-gray-800\b/g, 'text-color-foreground');
content = content.replace(/\btext-gray-700\b/g, 'text-color-text');
content = content.replace(/\btext-gray-600\b/g, 'text-color-text-muted');
content = content.replace(/\btext-gray-500\b/g, 'text-color-text-subtle');

// Backgrounds
content = content.replace(/\bbg-gray-50\b/g, 'bg-color-surface');
content = content.replace(/\bbg-gray-100\b/g, 'bg-color-surface-raised');
content = content.replace(/\bbg-white\b/g, 'bg-color-background');

// Borders
content = content.replace(/\bborder-gray-200\b/g, 'border-color-border');
content = content.replace(/\bborder-gray-300\b/g, 'border-color-border-strong');

fs.writeFileSync(filePath, content);
console.log('✅ Updated successfully');
