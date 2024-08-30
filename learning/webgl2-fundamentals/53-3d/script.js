// https://webgl2fundamentals.org/webgl/lessons/webgl-3d-perspective.html
// Perspective matrix
// Assumes:
// 1. Camera is at 0, 0, 0
// 2. Looking in negative z direction
// 3. Positive Y is up

var m4 = {
  identity: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },
  translation: function(tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ];
  },
  scaling: function(sx, sy, sz) {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ];
  },
  zRotation: function(a) {
    const s = Math.sin(a);
    const c = Math.cos(a);
    return [
      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },
  xRotation: function(a) {
    const s = Math.sin(a);
    const c = Math.cos(a);
    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },
  yRotation: function(a) {
    const s = Math.sin(a);
    const c = Math.cos(a);
    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },
  multiply: function(a, b) {
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];

    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },
  projection: function(width, height, depth) {
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },
  orthographic: function(left, right, bottom, top, near, far){
    return [
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, 2 / (near - far), 0,
      (left + right) / (left - right), (bottom + top) / (bottom - top),
      (near + far) / (near - far), 1,
    ];
  },
  zToW: function(fudge){
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, fudge,
      0, 0, 0, 1,
    ];
  },
  perspective: function(fov, aspect, near, far){
    let f = Math.tan(Math.PI * .5 - .5 * fov);
    let rangeInv = 1.0 / (near - far); 

    return [
      f / aspect, 0, 0, 0, 
      0, f, 0, 0, 
      0, 0, (near + far) * rangeInv, -1, 
      0, 0, near * far * rangeInv * 2, 0, 
    ];
  }
};

function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column front
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0,
      ]),
      gl.STATIC_DRAW);
}

function setColData() {
  let colData = [
    255, 0, 0,
    255, 0, 0,
    255, 0, 0,
    255, 0, 0,
    255, 0, 0,
    255, 0, 0,

    // top rung front
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,

    // middle rung front
    0, 0, 255,
    0, 0, 255,
    0, 0, 255,
    0, 0, 255,
    0, 0, 255,
    0, 0, 255,

    // left column back
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,

    // top rung back
    255, 0, 255,
    255, 0, 255,
    255, 0, 255,
    255, 0, 255,
    255, 0, 255,
    255, 0, 255,

    // middle rung back
    0, 255, 255,
    0, 255, 255,
    0, 255, 255,
    0, 255, 255,
    0, 255, 255,
    0, 255, 255,

    // top
    125, 0, 0,
    125, 0, 0,
    125, 0, 0,
    125, 0, 0,
    125, 0, 0,
    125, 0, 0,

    // top rung right
    0, 125, 0,
    0, 125, 0,
    0, 125, 0,
    0, 125, 0,
    0, 125, 0,
    0, 125, 0,

    // under top rung
    0, 0, 125,
    0, 0, 125,
    0, 0, 125,
    0, 0, 125,
    0, 0, 125,
    0, 0, 125,

    // between top rung and middle
    125, 125, 0,
    125, 125, 0,
    125, 125, 0,
    125, 125, 0,
    125, 125, 0,
    125, 125, 0,

    // top of middle rung
    125, 0, 125,
    125, 0, 125,
    125, 0, 125,
    125, 0, 125,
    125, 0, 125,
    125, 0, 125,

    // right of middle rung
    0, 125, 125,
    0, 125, 125,
    0, 125, 125,
    0, 125, 125,
    0, 125, 125,
    0, 125, 125,
    // bottom of middle rung.
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,

    // right of bottom
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,

    // bottom
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,

    // left side
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colData), gl.STATIC_DRAW);
}

let canvas = document.getElementById("canvas");

/** @type {WebGLRenderingContext} */
let gl = canvas.getContext("webgl2");

if (!gl) {
  console.error("There is no webgl 2");
}

let vertexShaderSource = `#version 300 es

in vec4 a_position; 
in vec4 a_color;
uniform mat4 u_matrix;

out vec4 v_color;

void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
}
`;

let fragmentShaderSource = `#version 300 es
    precision highp float;

    out vec4 outColor;
    in vec4 v_color;

    uniform vec4 u_color;

    void main(){
        outColor = vec4(v_color.rgb, 1.0);
    }
`;

let program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

// The progam is ready, now we need to pass it data to render
let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

let posAttribLocation = gl.getAttribLocation(program, "a_position");
let colAttribLocation = gl.getAttribLocation(program, "a_color");
let matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");
let fudgeFactorUniformLocation = gl.getUniformLocation(program, "u_fudgeFactor");

gl.enableVertexAttribArray(posAttribLocation);

let size = 3; // 3 components
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
  offset,
);
setGeometry(gl);

// Color buffer
let colBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
setColData();

gl.enableVertexAttribArray(colAttribLocation);
gl.vertexAttribPointer(colAttribLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

// resize the canvas to match the display size
webglUtils.resizeCanvasToDisplaySize(gl.canvas);

// Map from clip space to window coordinates
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0.2, 0.2, 0.2, 0.4);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);
gl.bindVertexArray(vao);

// set the uniform after the use of the program

let mat = m4.identity();

let left = 0;
let right = gl.canvas.clientWidth;
let bottom = gl.canvas.clientHeight;
let top = 0;
let near = 400;
let far = -400;

// overrides simpler projection from before
// let proj = m4.zToW(2);
// proj = m4.multiply(proj, m4.orthographic(left, right, bottom, top, near, far));

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

let fov = 50;
let zNear = 1;
let zFar = 2000;
let aspect = gl.cav
let proj = m4.perspective(fov, aspect, zNear, zFar);
mat = proj;

let t = m4.translation(0, 0, -299);
mat = m4.multiply(mat, t);

let xRot = 0;

function main() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  xRot += 0.01;

  // mat = m4.multiply(projCenterMatrix, m4.xRotation(xRot));
  // mat = m4.multiply(mat, m4.zRotation(xRot));

  // gl.uniform1f(fudgeFactorUniformLocation, fudgeFactor);
  gl.uniformMatrix4fv(matrixUniformLocation, false, mat);

  gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  requestAnimationFrame(main);
}

requestAnimationFrame(main);
