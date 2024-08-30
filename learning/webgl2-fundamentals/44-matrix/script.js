// https://webgl2fundamentals.org/webgl/lessons/webgl-2d-matrices.html
// Simple cool js oriented matrix lib
// https://github.com/stackgl/gl-mat4/blob/master/multiply.js
// todo modify the shader to use a matrix instead of translation, rotation and scale uniforms

var m3 = {
  multiply: function (a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];

    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
  translation: function (tx, ty) {
    return [
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1
    ];
  },
  rotation: function (angleInRadians) {
    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);
    return [
        c, -s, 0,
        s, c, 0,
        0, 0, 1
    ];
  },
  scaling: function (sx, sy) {
    return [
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1
    ];
  },
  identity: function () {
    return [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    ];
  },
  projection: function (width, height) {
    return [
        2 / width, 0, 0,
        0, -2 / height, 0,
        -1, 1, 1,
    ];
  }
};

function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // left column
      0, 0, 30, 0, 0, 150, 0, 150, 30, 0, 30, 150,

      // top rung
      30, 0, 100, 0, 30, 30, 30, 30, 100, 0, 100, 30,

      // middle rung
      30, 60, 67, 60, 30, 90, 30, 90, 67, 60, 67, 90,
    ]),
    gl.STATIC_DRAW,
  );
}

let canvas = document.getElementById("canvas");

/** @type {WebGLRenderingContext} */
let gl = canvas.getContext("webgl2");

if (!gl) {
  console.error("There is no webgl 2");
}

let vertexShaderSource = `#version 300 es

in vec4 a_position; // adds in defaults at the end
uniform vec2 u_resolution;
uniform mat3 u_matrix;

void main() {
    gl_Position = vec4((u_matrix * vec3(a_position.xy, 1.0)).xy, 0.0, 1.0);

    //vec2 scaledPosition = a_position * u_scale;
    //vec2 rotatedPosition = vec2(
    //  scaledPosition.x * u_rotation.y - scaledPosition.y * u_rotation.x,
    //  scaledPosition.x * u_rotation.x + scaledPosition.y * u_rotation.y
    //);

    //vec2 clipSpace = (rotatedPosition + u_translation) / u_resolution * 2.0 - 1.0;
    //clipSpace.y = clipSpace.y * -1.0;
    //gl_Position = vec4(clipSpace.xy, 0.0, 1.0);
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

let program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

// The progam is ready, now we need to pass it data to render
let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

let positions = [0, 0, 200, 0, 200, 150];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

let posAttribLocation = gl.getAttribLocation(program, "a_position");
let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
let colorUniformLocation = gl.getUniformLocation(program, "u_color");
let matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

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
  offset,
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
  new Float32Array([gl.canvas.width, gl.canvas.height]),
);

const rotation = (rads) => [Math.sin(rads), Math.cos(rads)];

let rot = 0;
let rotInc = Math.PI * 2 * 0.001;

// Screen space to clip space
let identity = m3.identity();
let proj = m3.identity();
proj = m3.multiply(proj, m3.translation(-1, 1));
proj = m3.multiply(proj, m3.scaling(2 / gl.canvas.width, -2 / gl.canvas.height));

let mat = proj;
let scale = m3.scaling(1.1, 1.1);
let t = m3.translation(50, 0);

mat = m3.multiply(mat, t);
mat = m3.multiply(mat, scale);

function main() {
  rot += rotInc;
  gl.clear(gl.COLOR_BUFFER_BIT);

  setGeometry(gl);
  gl.uniform4f(colorUniformLocation, 1.0, 1.0, 0.0, 1.0);
  gl.uniformMatrix3fv(matrixUniformLocation, false, mat);
  gl.drawArrays(gl.TRIANGLES, 0, 18);
  requestAnimationFrame(main);
}

requestAnimationFrame(main);


