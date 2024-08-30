// https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html 
// Rectangle function
// Vertex shader with pixel coordinates
// Frag shader with color
// webgl2 graphic primitives https://webgl2fundamentals.org/webgl/lessons/webgl-points-lines-triangles.html
// drawing rects – this can be optimised differently

function rect(x, y, w, h) {
    let points = [
        x, y,
        x, y + h,
        x + w, y,
        x + w, y + h
    ];

    // update the data in the buffer
    // let vao = gl.createVertexArray();
    // gl.bindVertexArray(vao);
    // get the vertex attrib
    // Once bound buffers may not be rebound
    let posAttribLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttribLocation);

    // let buffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    // gl.vertexAttribPointer(posAttribLocation, 2, gl.FLOAT, false, 0, 0);

    // gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

let canvas = document.getElementById('canvas');

let gl = canvas.getContext('webgl2');

if (!gl) {
  console.error('There is no webgl 2');
}

let vertexShaderSource = `#version 300 es

in vec2 a_position;
uniform vec2 u_resolution;

void main(){
    vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;
    clipSpace.y = clipSpace.y * -1.0;
    gl_Position = vec4(clipSpace.xy, 0.0, 1.0);
}
`;

let fragmentShaderSource = `#version 300 es
precision highp float;

out vec4 outColor;
uniform vec4 u_color;

void main(){
    outColor = u_color;
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
    200, 0,
    200, 150,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

let posAttribLocation = gl.getAttribLocation(program, 'a_position');
let resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
let colorUniformLocation = gl.getUniformLocation(program, 'u_color');
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

gl.clearColor(0.2, 0.2, 0.2, 0.4);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);
gl.bindVertexArray(vao);

// set the uniform after the use of the program
gl.uniform4f(colorUniformLocation, 1, 0, 1, 1);
gl.uniform2fv(resolutionUniformLocation, new Float32Array([gl.canvas.width, gl.canvas.height]));

let primitiveType = gl.TRIANGLES;
gl.drawArrays(gl.TRIANGLES, 0, 3); // 0 offset, 3 count, how many time to execute the vertex shader

for (let i = 0; i < 30; i++){
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1.0); 
    let x = Math.random() * gl.canvas.width;
    let y = Math.random() * gl.canvas.height;
    let w = Math.random() * 100 + 20;
    let h = Math.random() * 100 + 20;
    rect(x, y, w, h);
}