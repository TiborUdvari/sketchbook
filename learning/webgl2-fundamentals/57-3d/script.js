// https://webgl2fundamentals.org/webgl/lessons/webgl-3d-camera.html
// Look at function


// normalize func
// cross product

// Utils
const TAU = Math.PI * 2.0;
const deg2Rad = Math.PI / 180.0;

var v3 = {
  cross: function(a, b){
    return [a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]];
  }, 
  substract: function(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  },
  normalize: function(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
      return [v[0] / length, v[1] / length, v[2] / length];
    } else {
      return [0, 0, 0];
    }
  }
}

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
  },
 inverse: function(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
             (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
             (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
             (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
             (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
           (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
           (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
           (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
           (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
           (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
           (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
           (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
           (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
           (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
           (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
           (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
           (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ];
  },
  lookAt: function(camPos, target, up){
    const cp = camPos;
    const u = v3.normalize(up); // just to make sure
    const z = v3.normalize(v3.substract(camPos, target)); // becase looking at -z
    const x = v3.normalize(v3.cross(u, z));
    const y = v3.normalize(v3.cross(z, x));

    return [
      x[0], x[1], x[2], 0,     
      y[0], y[1], y[2], 0,     
      z[0], z[1], z[2], 0,     
      cp[0], cp[1], cp[2], 1,     
    ]; 
  },
  transformVector: function(m, v) {
    var dst = [];
    for (var i = 0; i < 4; ++i) {
      dst[i] = 0.0;
      for (var j = 0; j < 4; ++j) {
        dst[i] += v[j] * m[j * 4 + i];
      }
    }
    return dst;
  },
};

function setGeometry(gl) {
  let positions = 
      [
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
      ];

  var m = m4.xRotation(Math.PI);
  m = m4.multiply(m, m4.translation(-50, -75, -15));

  for (var ii = 0; ii < positions.length; ii += 3) {
    var vector = m4.transformVector(m, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }

  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW);
}

function setColData(gl) {
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
setColData(gl);

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

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

let fov = 50.0 * Math.PI / 180.0;
let zNear = 1;
let zFar = 2000;
let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;


let camRot = 0 * deg2Rad;

function main() {
  let rad = 200;
  // Camera
  let cam = m4.yRotation(camRot);
  // cam = m4.multiply(cam, m4.translation(0, 73, 0));
  cam = m4.multiply(cam, m4.translation(0, 50, rad * 1.5));
  cam = m4.multiply(cam, m4.xRotation(Math.PI));

  let camPos = [
    cam[12],
    cam[13],
    cam[14],
  ];

  // first f calculated manually
  let target = [
    rad, 
    0, 
    0, 
  ];

  let up = [0, 1, 0];

  cam = m4.lookAt(camPos, target, up);

  let view = m4.inverse(cam);

  // Projection
  let proj = m4.perspective(fov, aspect, zNear, zFar);

  let viewProjection = m4.multiply(proj, view);

  let n = 6;

  camRot += 1e-3 * 3;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let i = 0; i < n; i++){
    const p = i / n; 
    let x = Math.cos(p * TAU) * rad;
    let z = Math.sin(p * TAU) * rad;

    let m = viewProjection;
    let tm = m4.translation(x, 0, z);

    m = m4.multiply(m, tm);

    gl.uniformMatrix4fv(matrixUniformLocation, false, m);
    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  }

  requestAnimationFrame(main);
}

requestAnimationFrame(main);
