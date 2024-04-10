const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Define the root directory containing your p5.js sketches
const directoryPath = path.join(__dirname, '..');
const manifest = [];

// Recursive function to read directories
function readDirectory(dir) {
    // Read all files and directories within the current directory
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        // Check if the file is a directory
        if (fs.statSync(fullPath).isDirectory()) {
            // If so, recursively read this directory
            readDirectory(fullPath);
        } else if (file === 'index.html') {
            // If the file is 'index.html', read and parse it
            const data = fs.readFileSync(fullPath, 'utf8');
            const $ = cheerio.load(data);
            // Example: Extract metadata from the file
            const name = $('title').text(); // Adjust based on your structure
            const tags = $('meta[name="keywords"]').attr('content'); // Example
            const description = $('meta[name="description"]').attr('content'); // Example
            // Custom metadata extraction logic here...
            const customDate = $('meta[name="date"]').attr('content'); // Custom example
            const mediaId = $('meta[name="media-id"]').attr('content'); // Custom example
            const editorId = $('meta[name="p5-editor-id"]').attr('content'); // Custom example

            // Add the extracted metadata to the manifest
            manifest.push({
                path: path.relative(directoryPath, fullPath).replace('index.html', ''),
                name,
                description,
                tags,
                date: customDate,
                media: mediaId,
                p5editor: editorId
            });
        }
    });
}

// Start reading from the root directory
readDirectory(directoryPath);

// Write the manifest to a JSON file
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2), 'utf8');

console.log('Manifest generated successfully.');
