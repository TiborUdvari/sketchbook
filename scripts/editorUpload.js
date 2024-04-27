// Uploads sketches to the p5 editor
import esMain from 'es-main';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { load } from 'cheerio';
import { applyEditorMetadata, baseUrl, getFilesInDirectory, getSketchIndexes, hashDirectory, logAxiosError, projectPath, readHash, sketchbookPath, updateHash } from './utils.js';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';
import process from 'process';
import delay from 'delay'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const directoryPath = join(__dirname, '..');
dotenv.config({path: `${__dirname}/../.env`});

function getNonUploadedSketches() {
  const result = [];
  const sketchDirs = getSketchIndexes();
  for (const sketchIndex of sketchDirs) {
    const indexText = readFileSync(sketchIndex, 'utf8');
    const editorId = getSketchSlug(indexText);
    if (!editorId) {
      result.push(sketchIndex);
    }
  }
  return result;
} 

function getModifiedSketches() {
  const result = [];
  const sketchDirs = getSketchIndexes();
  for (const indexPath of sketchDirs) {
    let currentHash = hashDirectory(dirname(indexPath));
    let editorHash = readHash(projectPath(indexPath)); 
    if (currentHash !== editorHash) {
      result.push(indexPath);
    }
  }
  return result;
} 

function setEditorId(fullPath, editorId) {
  const data = readFileSync(fullPath, 'utf8');
  const $ = load(data);
  const editorMetaTag = $('meta[name="p5-editor-id"]');

  if (editorMetaTag.length === 0) {
    $('head').append(`<meta name="p5-editor-id" content="${editorId}">`);
  } else {
    editorMetaTag.attr('content', editorId);
  }

  const updatedHtml = $.html(); 
  writeFileSync(fullPath, updatedHtml, 'utf8');
} 

function getSketchName(indexText) {
  const $ = load(indexText);
  let name = $('title').text(); 
  if (!name) {
    name = 'Unnamed sketch';
  }
  return name;
}

function getSketchSlug(indexText) {
  const $ = load(indexText);
  const editorId = $('meta[name="p5-editor-id"]').attr('content'); 
  if (!editorId) return undefined;
  return editorId;
}
const commonConfig = {
  maxBodyLength: Infinity,
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': `Basic ${process.env.P5_WEBEDITOR_TOKEN}`
  }
};

/**
 * Returns a sketch in the format of the editor
 */
function getSketchData(sketchDirectory, name, slug) {
  let files = getFilesInDirectory(sketchDirectory); 
  const includedExtensions = ['js', 'html', 'css', 'json'].map(e => '.' + e);
  files = files.filter(f => includedExtensions.includes(extname(f)));
  files = files.map(f => ({'path': f, 'filename': basename(f), 'content': readFileSync(f, 'utf8')}));

  let filesObj = files.reduce((acc, file) => {
    acc[file.filename] = { content: file.content }; 
    return acc;
  }, {});

  const sketchPayload = {
    name,
    files: filesObj
  }; 

  if (slug) {
    sketchPayload.slug = slug;
  }

  return sketchPayload;
}

/**
 * Uploads a given sketch data to p5 editor
 */
async function uploadSketch(sketchData) {
  let data = JSON.stringify(sketchData);
  let config = {
    method: 'post',
    url: `https://editor.p5js.org/api/v1/${process.env.P5_WEBEDITOR_USER}/sketches`,
    data : data,
    ...commonConfig
  };

  try {
    let res = await axios.request(config);
    const id = res.data.id;
    return id;
  } catch (error) {
    console.error('Error uploading sketch', error); 
    throw error;
  }
}

async function processAndUploadSketch(indexPath) {
  console.log('Uploading sketch ', indexPath);
  const indexText = readFileSync(indexPath, 'utf8');
  const name = getSketchName(indexText);
  let slug = getSketchSlug(indexPath);
  if (slug) {
    // so we can replace the sketch
    try {
      await deleteSketch(slug);
    } catch (error) {
      slug = undefined;  
    }
  }
  const sketchDirectory = dirname(indexPath);
  const sketchData = getSketchData(sketchDirectory, name, slug);
  const canonicalUrl = join(baseUrl, sketchbookPath(indexPath));
  const processedIndexText = applyEditorMetadata(indexText, canonicalUrl);
  sketchData.files['index.html']['content'] = processedIndexText;
  const id = await uploadSketch(sketchData);
  setEditorId(indexPath, id);
  let hash = hashDirectory(dirname(indexPath));
  updateHash(projectPath(indexPath), hash);
}

/**
  * Delete a sketch with the given id. This is currently broken on the server, getting 500 errors.
  *
  * @param {string} id – Sketch id, usually the slug as well 
  */
async function deleteSketch(id) {
  const config = {
    method: 'delete',
    url: `https://editor.p5js.org/api/v1/${process.env.P5_WEBEDITOR_USER}/sketches/${id}`,
    ...commonConfig
  }; 

  try {
    await axios.request(config);
    return true;
  } catch (error) {
    logAxiosError(error, 'Delete sketch');
    throw new Error('Failed to delete sketch. Please try again later.');
  }
}

async function uploadSketches(sketchIndexes) {
  for (const sketchIndex of sketchIndexes) {
    try {
      await processAndUploadSketch(sketchIndex);
      await delay(300); // be polite to api
    } catch (error) {
      console.error('Failed uploading a sketch, stopping ... ', error);
      process.exit(1);
    }
  }
}

function updateExistingSketches() {
}

async function syncSketches() {
  await uploadNewSketches();
  updateExistingSketches();
}

if (esMain(import.meta)) {
  console.log('p5 editor upload starting ...');
  console.log('Uploading new sketches ...');
  const nonUploadedSketches = getNonUploadedSketches();
  uploadSketches(nonUploadedSketches); 
  console.log('Uploading modified sketches ...');
  const modifiedSketches = getModifiedSketches();
  console.log(modifiedSketches)
  uploadSketches(modifiedSketches);
}

export { uploadSketch };
