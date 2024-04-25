import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directoryPath = join(__dirname, '..');

function getSketchDirs(dir = directoryPath, sketchDirs = []) {
  readdirSync(dir).forEach(file => {
    if (file === 'node_modules') return;
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      getSketchDirs(fullPath, sketchDirs);
    } else if (file === 'index.html') {
      const p = relative(directoryPath, fullPath).replace('index.html', '');
      sketchDirs.push(fullPath);
    }
  });
  return sketchDirs;
}

export { getSketchDirs };
