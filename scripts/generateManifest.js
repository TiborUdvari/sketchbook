import { readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { load } from 'cheerio';
import { getSketchDirs } from './utils.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directoryPath = join(__dirname, '..');

function generateManifest() {
  const manifest = [];
  const sketchDirs = getSketchDirs();
  for (const sketchDir of sketchDirs) {
    //const fullPath = join(sketchDir, 'index.html');
    const fullPath = sketchDir;
    const data = readFileSync(fullPath, 'utf8');
    const $ = load(data);
    const name = $('title').text(); 
    const tags = $('meta[name="keywords"]').attr('content'); 
    const description = $('meta[name="description"]').attr('content'); 
    const customDate = $('meta[name="date"]').attr('content'); 
    const mediaId = $('meta[name="media-id"]').attr('content'); 
    const editorId = $('meta[name="p5-editor-id"]').attr('content'); 

    manifest.push({
      path: relative(directoryPath, fullPath).replace('index.html', ''),
      name,
      description,
      tags,
      date: customDate,
      media: mediaId,
      p5editor: editorId
    });
  }
  return manifest;
} 

const manifest = generateManifest();
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2), 'utf8');

console.log('Manifest generated successfully.');
