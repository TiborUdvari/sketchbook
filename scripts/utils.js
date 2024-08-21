import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import prettier from "@prettier/sync";

const baseUrl = 'https://tiborudvari.com/sketchbook';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directoryPath = join(__dirname, '..');
const uploadsDataPath = join(directoryPath, 'editorUploads.json');

function sketchbookPath(indexPath) {
  return relative(directoryPath, indexPath);
}

function projectPath(fullPath) {
  return relative(directoryPath, fullPath).replace('index.html', '');
}

function fullPath(projectPath) {
  return resolve(directoryPath, projectPath);
}

/**
 * Returns full paths of sketch index.html files
 */
function getSketchIndexes(dir = directoryPath, sketchDirs = []) {
  readdirSync(dir).forEach(file => {
    const ignoreList = ['learning', 'utils', 'node_modules', 'test-data'];
    if (ignoreList.includes(file)) return;

    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      getSketchIndexes(fullPath, sketchDirs);
    } else if (file === 'index.html') {
      sketchDirs.push(fullPath);
    }
  });
  return sketchDirs;
}

function getFilesInDirectory(directory) {
    let fileList = [];
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fileList = [...fileList, ...getFilesInDirectory(fullPath)];
        } else {
            fileList.push(fullPath);
        }
    });
    return fileList;
}

function hashDirectory(directory) {
    const files = getFilesInDirectory(directory);
    const hash = crypto.createHash('md5');

    files.sort().forEach(file => {
        const fileContent = fs.readFileSync(file);
        hash.update(fileContent);
    });

    return hash.digest('hex');
}

/**
  * Removes extraneos metadata for p5 editor upload and adds canonical
  *
  * @param {string} htmlContent - Sketch index file content
  * @param {string} canonicalUrl - Canonical url to insert
  */
function applyEditorMetadata(htmlContent, canonicalUrl) {
  const $ = cheerio.load(htmlContent);
  
  $('meta[name="date"]').remove();  
  $('meta[name="p5-editor-id"]').remove();  
  $('meta[name="media-id"]').remove();  
  $('meta[name="keywords"]').remove();  
  $('meta[property="author"]').remove();  
  $('meta[property^="og:"]').remove();  
  $('meta[property^="og:"]').remove();  

  $('meta[property^="og:"]').remove();  
  $('meta[name^="twitter:"]').remove(); 
  $('script[type="application/ld+json"]').remove();

  if (canonicalUrl) {
    const lastMetaTag = $('head meta').last();

    if (lastMetaTag.length) {
      lastMetaTag.after(`<link rel="canonical" href="${canonicalUrl}">`);
    } else {
      $('head').prepend(`<link rel="canonical" href="${canonicalUrl}">`);
    }
  }

  const prettyHtml = prettier.format($.html(), { parser: 'html' });
  return prettyHtml;
}

// Hash data for uploads
function loadData() {
  const data = readFileSync(uploadsDataPath, 'utf-8'); 
  return JSON.parse(data);
}

function saveData(data) {
  writeFileSync(uploadsDataPath, JSON.stringify(data, null, 2), 'utf-8'); 
}

function updateHash(sketch, hash) {
  const data = loadData();
  data[sketch] = hash;
  saveData(data);
}

function readHash(sketch) {
  const data = loadData();  
  if (sketch in data){
    return data[sketch];
  }
  console.log(sketch + "hash not found");
  return null;
}

function logAxiosError(error, context = '') {
  console.error(`${context} - Error message:`, error.message);
  
  if (error.response) {
    console.error(`${context} - Error status:`, error.response.status);
    console.error(`${context} - Error data:`, error.response.data);
  } else if (error.request) {
    // console.error(`${context} - The request was made but no response was received`);
  } else {
    console.error(`${context} - Error in setting up the request`);
  }

  // console.error(`${context} - Error config:`, error.config);
}

export { baseUrl, sketchbookPath, logAxiosError, applyEditorMetadata, readHash, updateHash, fullPath, projectPath, hashDirectory, getFilesInDirectory, getSketchIndexes };
