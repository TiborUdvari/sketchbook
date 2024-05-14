import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, relative, dirname, parse } from 'path';
import { load } from 'cheerio';
import { getSketchIndexes } from './utils.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directoryPath = join(__dirname, '..');

const githubBaseUrl = 'https://raw.githubusercontent.com/TiborUdvari/sketchbook/main/';

function extractScripts($) {
  const scripts = [];
  $('script').each((i, script) => {
    const src = $(script).attr('src');
    if (src && !src.includes('sketch.js') && !src.includes('dumbreload')) {
      scripts.push(src);
    }
  });
  return scripts;
}

function loadSketchCode(sketchPath) {
  try {
    return readFileSync(sketchPath, 'utf8');
  } catch (error) {
    console.error(`Error reading ${sketchPath}:`, error);
    return '';
  }
}

function convertToP5LiveFormat(htmlData, sketchPath) {
  const $ = load(htmlData);
  const scripts = extractScripts($);
  let sketchCode = loadSketchCode(join(dirname(sketchPath), 'sketch.js'));
  sketchCode = replaceRelativeUrls(sketchCode, dirname(sketchPath));
  const libraries = scripts.map(src => `'${src}'`).join(', ');

  return `
let libs = [${libraries}];

new p5(); // manually init p5

${sketchCode}
  `;
}

function replaceRelativeUrls(code, sketchDir) {
  const relativePath = relative(directoryPath, sketchDir);
  const githubUrlPrefix = join(githubBaseUrl, relativePath, '/').replace(/\\/g, '/'); // Ensure forward slashes

  return code.replace(/['"](.*?\.(png|jpg|jpeg|gif|bmp|svg|ttf|otf|woff|woff2))['"]/g, (match, p1) => {
    const newUrl = githubUrlPrefix + p1;
    return `'${newUrl}'`;
  });
}

function generateP5LiveExport() {
  const sketchDirs = getSketchIndexes();
  const structure = [];
  let sketchCount = 0;
  let folderCount = 0;

  for (const sketchDir of sketchDirs) {
    const indexPath = sketchDir;
    if (!existsSync(indexPath)) {
      console.warn(`Index file not found: ${indexPath}`);
      continue;
    }

    const data = readFileSync(indexPath, 'utf8');
    const $ = load(data);
    const folderName = parse(dirname(dirname(sketchDir))).base;

    const sketches = [];
    const sketchCode = convertToP5LiveFormat(data, indexPath);
    const sketchName = $('title').text() || 'Untitled Sketch';
    const modTime = new Date().getTime().toString();

    sketches.push({
      name: sketchName,
      mod: modTime,
      type: 'sketch',
      code: sketchCode
    });

    let folder = structure.find(f => f.name === folderName);
    if (!folder) {
      folder = {
        name: folderName,
        mod: modTime,
        type: 'folder',
        toggle: 'expand',
        contents: []
      };
      structure.push(folder);
    }

    folder.contents.push({
      name: sketchName,
      mod: modTime,
      type: 'sketch',
      code: sketchCode
    });

    sketchCount += sketches.length;
    folderCount++;
  }

  const exportData = {
    version: '1.5.0',
    revision: 47,
    structure,
    count: {
      sketches: sketchCount,
      folders: folderCount
    }
  };

  writeFileSync('p5live_export.json', JSON.stringify(exportData, null, 2), 'utf8');
  console.log('p5live export generated successfully.');
}

generateP5LiveExport();

