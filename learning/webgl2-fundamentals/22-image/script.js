// https://webgl2fundamentals.org/webgl/lessons/webgl-image-processing.html
// Texture Parameters – https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
// Image processing that references other pixels

function loadImage(url){
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img); 
        img.onerror = (e) => reject(e);
        img.src = url;
    });
}

let img = null;
try {
    img = await loadImage('../assets/corgi.jpg');
    let el = document.querySelector('#debug');
    el.appendChild(img);
    el.style = "display: none;";
} catch (error) {
    console.error(error);
}

let canvas = document.getElementById('canvas');
let gl = canvas.getContext('webgl2');

if (!gl) {
  console.error('There is no webgl 2');
}

let vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord; // vertex shader does the interpolation
uniform vec2 u_resolution;

out vec2 v_texCoord;

void main(){
    vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;
    clipSpace.y = clipSpace.y * -1.0;
    gl_Position = vec4(clipSpace.xy, 0.0, 1.0);

    // GPU will interpolate
    v_texCoord = a_texCoord;
}
`;

let fragmentShaderSource = `#version 300 es
precision highp float;

out vec4 outColor;

uniform sampler2D u_image;

in vec2 v_texCoord;

void main(){
    vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));

    // Averaging x pixel colors
    outColor =
    (
        texture(u_image, v_texCoord) + 
        texture(u_image, v_texCoord - vec2(onePixel.x, 0.0)) + 
        texture(u_image, v_texCoord + vec2(onePixel.x, 0.0))
        ) / 3.;

    // outColor = texture(u_image, v_texCoord).bgra;
    // outColor = texture(u_image, v_texCoord);
}
`;

// Using the canvas size later so set it up early
webglUtils.resizeCanvasToDisplaySize(gl.canvas);

let program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

// Attribs
let positionAttribLocation = gl.getAttribLocation(program, 'a_position');
let texCoordAttribLocation = gl.getAttribLocation(program, 'a_texCoord');

// Uniforms
let resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
let imageLocation = gl.getUniformLocation(program, 'u_image');

// Vertex array object
let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// Positions
let positionBuffer = gl.createBuffer();
gl.enableVertexAttribArray(positionAttribLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

let positions = [
    0, 0,
    0, gl.canvas.height, 
    gl.canvas.width, 0,
    gl.canvas.width, gl.canvas.height,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Texture Coordinates
let texCoordBuffer = gl.createBuffer();
gl.enableVertexAttribArray(texCoordAttribLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
]), gl.STATIC_DRAW);
gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);

// Create a texture
let texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, texture);

// set texture params
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// Upload the image to the texture
let mipLevel = 0;
let internalFormat = gl.RGBA; // format we want in the texture
let srcFormat = gl.RGBA; // format we are supplying
let srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, img);

// Map from clip space to window coordinates
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0.2, 0.2, 0.2, 0.4);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);
gl.bindVertexArray(vao);

gl.uniform2fv(resolutionUniformLocation, new Float32Array([gl.canvas.width, gl.canvas.height]));
gl.uniform1i(imageLocation, 0);

gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
