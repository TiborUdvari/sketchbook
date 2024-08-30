// Following tutorial from here
// https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html 

let canvas = document.getElementById('canvas');

var gl = canvas.getContext('webgl2');

if (!gl) {
  console.error('There is no webgl 2');
} 

// No transformation shader
const clipSpaceVertexShaderSource = `#version 300 es
// an attribute i san input (in) to a vertex shader
// it will receive data from a buffer
in vec4 a_position;

// all shaders have a main function
void main() {
  gl_Position = a_position;
}
`;

const vertexShaderSource = `#version 300 es
in vec2 a_position;

uniform vec2 u_resolution;

void main() {
  vec2 p = (a_position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(p.xy * vec2(1, -1), 0, 1);
  //gl_Position = vec4(a_position.xy, 0, 1);
}
`;

const fragShaderSource = `#version 300 es
// precision must be set
precision highp float;

uniform vec4 u_color;
out vec4 outColor;

void main() {
  //outColor = vec4(1, 0, 0, 1);
  outColor = u_color;
  //outColor = vec4(1, 0, 0.5, 1);
}
`;

// compile
// link

function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // check for errors
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

let fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);

function createProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

let program = createProgram(gl, vertexShader, fragShader);

let positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
let resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
let colorUniformLocation = gl.getUniformLocation(program, 'u_color');

let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// three 2d points
// let positions = [0, 0, 0, 0.5, 0.7, 0];

var positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

gl.enableVertexAttribArray(positionAttributeLocation);

let size = 2;
let type = gl.FLOAT;
var normalize = false;
var stride = 0;
var offset = 0;
gl.vertexAttribPointer(
  positionAttributeLocation,
  size,
  type,
  normalize,
  stride,
  offset
);

// check if this is actually okay
webglUtils.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
gl.uniform4f(colorUniformLocation, 1, 1, 0, 1);

gl.bindVertexArray(vao);

function setRectangle() {
  let x = Math.random() * gl.canvas.width;
  let y = Math.random() * gl.canvas.height;
  let width = Math.random() * 100;
  let height = Math.random() * 100;

  let rectPositions = [
    x,
    y,
    x + width,
    y,
    x,
    y + height,
    x,
    y + height,
    x + width,
    y,
    x + width,
    y + height,
  ];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(rectPositions),
    gl.STATIC_DRAW
  );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

for (let i = 0; i < 50; i++) {
  setRectangle();
}

var primitiveType = gl.TRIANGLES;
var offset = 0;
var count = positions.length / 2;
gl.drawArrays(primitiveType, offset, count);

// todo attach to a program
// todo link program
// todo use with useprogram
