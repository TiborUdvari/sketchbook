// Mocking with jest https://github.com/axios/axios/issues/5676
import {jest} from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

jest.unstable_mockModule("axios", () => ({
  default: {
    request: jest.fn(),
  }
}));

const { default: axios } = await import("axios");
const { applyEditorMetadata } = await import("./utils.js");
const { uploadSketch } = await import("./editorUpload");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const indexPath = join(__dirname, 'test-data', 'index.html');

let htmlContent = "";

try {
  htmlContent = readFileSync(indexPath, 'utf8');
} catch (err) {
  console.error("Failed reading file");
  console.error(err);
}

const title = 'Hello AR Box';

describe('Metadata transformations', () => {
  test('Cannonical url tests', () => {
    const canonicalUrl = 'https://tiborudvari.com/sketches/hello-world';
    const modifiedHtml = applyEditorMetadata(htmlContent, canonicalUrl);
    expect(modifiedHtml).toContain(`<link rel="canonical" href="${canonicalUrl}" />`);
  });
});

describe('uploadSketch', () => {
  const path = indexPath;
  const slug = 'my-slug';
  const name = title;

  const sketchPayload = {
    name,
    files: {
      'file1.js': { content: 'console.log("Hello World!");\n' },
      'index.html': { content: htmlContent },
    },
  };

  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('should upload the sketch to the API', async () => {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://editor.p5js.org/api/v1/${process.env.P5_WEBEDITOR_USER}/sketches`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.P5_WEBEDITOR_TOKEN}`,
      },
      data: JSON.stringify(sketchPayload),
    };
    
    axios.request.mockResolvedValue({ data: { id: 123 } });

    const id = await uploadSketch(sketchPayload);

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith(config);
    expect(id).toBe(123);
  });

  it('should throw an error if the API request fails', async () => {
    const error = new Error('API request failed');
    axios.request.mockRejectedValue(error);

    await expect(uploadSketch(path)).rejects.toEqual(error);
  });

});
