import prettier from '@prettier/sync';
import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync } from 'fs';
import { getSketchIndexes, baseUrl } from './utils.js';
import esMain from 'es-main';

/**
  * Update html file with metadata for search engines. Outputs prettified string.
  *
  * @param {string} htmlContent - The sketched index.html file contents
  * @returns {string} - Prettified content with appended metadata
  */ 
function updateMetadata(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const title = $('title').text() || 'Default Title';
  const description = $('meta[name="description"]').attr('content') || 'Default description.';
  const keywords = $('meta[name="keywords"]').attr('content') || 'p5.js';
  const date = $('meta[name="keywords"]').attr('content') || new Date().toISOString().slice(0, 10);
  const p5EditorId = $('meta[name="p5-editor-id"]').attr('content') || '';
  const mediaId = $('meta[name="media-id"]').attr('content') || '';
  const relativePath = 'spatial-computing/hello-box/index.html';

  const imageUrl = `${baseUrl}/media/web/${mediaId}.webp`;
  const sketchUrl = `${baseUrl}/${relativePath}`;
  const editorUrl = `https://editor.p5js.org/TiborUdvari/sketches/${p5EditorId}`;

  $('meta[property^="og:"], meta[name^="twitter:"], script[type="application/ld+json"]').remove();

  // Open Graph Tags
  const ogTags = `
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:url" content="${sketchUrl}">
<meta property="og:type" content="website">
`;

  const twitterTags = `
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">
`;

  const ldJsonScript = `
<script type="application/ld+json">
{
"@context": "http://schema.org",
"@type": "CreativeWork",
"name": "${title}",
"author": {
"@type": "Person",
"name": "Tibor Udvari"
},
"datePublished": "${date}",
"keywords": "${keywords}",
"description": "${description}",
"image": "${imageUrl}",
"url": "${sketchUrl}",
"sameAs": "${editorUrl}" 
}
</script>
`;

  const content = ogTags + twitterTags + ldJsonScript;
  const lastMetaTag = $('head meta').last();

  if (lastMetaTag.length) {
    lastMetaTag.after(content);
  } else {
    $('head').prepend(content);
  }

  const prettyHtml = prettier.format($.html(), { parser: 'html' });
  return prettyHtml;
}

/**
  * Updates the html files of all sketches in the project
  */
function main() {
  const sketchDirs = getSketchIndexes();
  let counter = 0;
  for (const sketchDir of sketchDirs) {
    const fullPath = sketchDir;
    const htmlContents = readFileSync(fullPath, 'utf8');
    const updatedHtmlContents = updateMetadata(htmlContents);
    const changed = htmlContents !== updatedHtmlContents;
    if (changed) { 
      writeFileSync(fullPath, updatedHtmlContents, 'utf8');
      console.log(`Metadata: updated file ${fullPath}.`);
      counter = counter + 1;
    } else {
      console.log(`Metadata: no changes, skipping file ${fullPath}`);
    }
    console.log(`Updated metadata in ${counter} files.`);
  }
}

if (esMain(import.meta)) {
  console.log('Updating sketch metadata ...');
  main();
}

export { updateMetadata };
