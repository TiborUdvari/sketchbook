// https://webgl2fundamentals.org/webgl/lessons/webgl-2d-translation.html
// webgl2 graphic primitives https://webgl2fundamentals.org/webgl/lessons/webgl-points-lines-triangles.html
// F shape
// translation using uniform 2

function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,
 
          // top rung
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,
 
          // middle rung
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90]),
      gl.STATIC_DRAW);
}

function rect(x, y, w, h) {
  let points = [0, 0, 0, h, w, 0, w, h];

  let posAttribLocation = gl.getAttribLocation(program, "a_position");
  let translationUniformLocation = gl.getUniformLocation(
    program,
    "u_translation"
  );
  gl.enableVertexAttribArray(posAttribLocation);
  gl.uniform2f(translationUniformLocation, x, y);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

let canvas = document.getElementById("canvas");

let gl = canvas.getContext("webgl2");

if (!gl) {
  console.error("There is no webgl 2");
}

let vertexShaderSource = `#version 300 es

in vec2 a_position;
uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;

void main(){
    vec2 scaledPosition = a_position * u_scale;
    // apply the trig in the main program
    vec2 rotatedPosition = vec2(
      scaledPosition.x * u_rotation.y - scaledPosition.y * u_rotation.x,
      scaledPosition.x * u_rotation.x + scaledPosition.y * u_rotation.y
    );

    vec2 clipSpace = (rotatedPosition + u_translation) / u_resolution * 2.0 - 1.0;
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
if (!compileStatus) {
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
if (!compileStatus) {
  console.log("Failed to compile frag shader");
  let log = gl.getShaderInfoLog(fragShader);
  console.log(log);
  gl.deleteShader(fragShader);
}

gl.linkProgram(program);

let linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
if (!linkStatus) {
  console.log("Linking failed");
  let log = gl.getProgramInfoLog(program);
  console.log(log);
  gl.deleteProgram(program);
}

// The progam is ready, now we need to pass it data to render
let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

let positions = [0, 0, 200, 0, 200, 150];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

let posAttribLocation = gl.getAttribLocation(program, "a_position");
let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
let translationUniformLocation = gl.getUniformLocation(program, "u_translation");
let rotationUniformLocation = gl.getUniformLocation(program, 'u_rotation');
let scaleUniformLocation = gl.getUniformLocation(program, 'u_scale');

let colorUniformLocation = gl.getUniformLocation(program, "u_color");
gl.enableVertexAttribArray(posAttribLocation);

let size = 2; // 2 components
let type = gl.FLOAT;
let normalized = false;
let stride = 0;
let offset = 0;
gl.vertexAttribPointer(
  posAttribLocation,
  size,
  type,
  normalized,
  stride,
  offset
);

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
gl.uniform2fv(
  resolutionUniformLocation,
  new Float32Array([gl.canvas.width, gl.canvas.height])
);

const rotation = (rads) => [
    Math.sin(rads),
    Math.cos(rads)
];

let rot = 0;
let rotInc = Math.PI * 2 * 0.001;

function main(){
  rot += rotInc;
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(scaleUniformLocation, 1, 1);
  gl.uniform2fv(rotationUniformLocation, rotation(rot));

  setGeometry(gl);
  gl.uniform4f(colorUniformLocation, 1.0, 1.0, 0.0, 1.0);
  gl.uniform2f(translationUniformLocation, 200, 100);

  gl.drawArrays(gl.TRIANGLES, 0, 18);
  
  requestAnimationFrame(main);
}

requestAnimationFrame(main);