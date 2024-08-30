// https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html 
// Simplest display - vertex shader with clip space coords

let canvas = document.getElementById('canvas');

let gl = canvas.getContext('webgl2');

if (!gl) {
  console.error('There is no webgl 2');
}

let vertexShaderSource = `#version 300 es

in vec4 a_position;

void main(){
    gl_Position = a_position;
}
`;

let fragmentShaderSource = `#version 300 es
precision highp float;

out vec4 outColor;

void main(){
    outColor = vec4(1.0, 1.0, 0.0, 1.0);
}
`;

let program = gl.createProgram();

let vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

let compileStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
if (!compileStatus){
    console.error("Failed to compile vertex shader");
    let log = gl.getShaderInfoLog(vertexShader);
    console.log(log);
    gl.deleteShader(vertexShader);
}

gl.attachShader(program, vertexShader);

let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragmentShaderSource);
gl.compileShader(fragShader);
gl.attachShader(program, fragShader);

compileStatus = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
if (!compileStatus){
    console.log("Failed to compile frag shader");
    let log = gl.getShaderInfoLog(fragShader);
    console.log(log);
    gl.deleteShader(fragShader);
}

gl.linkProgram(program);

let linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
if (!linkStatus){
    console.log("Linking failed");
    let log = gl.getProgramInfoLog(program);
    console.log(log);
    gl.deleteProgram(program);
}

// The progam is ready, now we need to pass it data to render

let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

let positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

let posAttribLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(posAttribLocation);

let size = 2; // 2 components
let type = gl.FLOAT;
let normalized = false;
let stride = 0;
let offset = 0;
gl.vertexAttribPointer(posAttribLocation, size, type, normalized, stride, offset);

// resize the canvas to match the display size
webglUtils.resizeCanvasToDisplaySize(gl.canvas);

// Map from clip space to window coordinates
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);
gl.bindVertexArray(vao);

let primitiveType = gl.TRIANGLES;
gl.drawArrays(gl.TRIANGLES, 0, 3); // 0 offset, 3 count, how many time to execute the vertex shader