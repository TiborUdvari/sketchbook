let dir = null;
let p = null;
const b = 0.1;
const s = 0.03; 
const offset = new p5.Vector(0, 0, -0.5);
const vb = b + s / 2;

// utils
const mult = (vector, multiplier) => p5.Vector.mult(vector, multiplier);
const dot = (v1, v2) => p5.Vector.dot(v1, v2);
const sub = (v1, v2) => p5.Vector.sub(v1, v2);

// Cube setup
let offsets = null;

function preload() {
  createARCanvas();
}

function setup() {
  dir = p5.Vector.random3D().normalize().mult(0.0001);
  p = createVector(0, 0, 0);
  noFill();

  offsets = [
    [1, 0, 0, PI / 2, 0, 1, 0, 0],
    [-1, 0, 0, PI / 2, 0, 1, 0, 0],
    [0, 1, 0, PI / 2, 1, 0, 0, 0],
    [0, -1, 0, PI / 2, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, -1, 0, 0, 1, 0, 0],
  ];

  offsets = offsets.map((off) => [
    off[0] * vb,
    off[1] * vb,
    off[2] * vb,
    ...off.splice(3),
  ]);
}

function draw() {
  stroke(255);

  checkBounds();

  push();
  translate(offset);

  drawBounds();

  push();
  p.add(dir);
  translate(p);
  box(s, s, s);
  pop();

  pop();
}

function drawBounds() {
  for (let i = 0; i < 6; i++) {
    const [x, y, z, angle, ex, ey, ez, f] = offsets[i];
    if (f > 0) {
      fill(255, 255, 255);
    }

    push();
    translate(x, y, z);
    rotate(angle, createVector(ex, ey, ez));
    scale(vb * 2);
    rect(-0.5, -0.5, 1, 1);
    pop();

    noFill();
    if (f == 1) {
      bip();
      offsets[i][7] = 2; // hack make it happen only once
      setTimeout(() => {
        offsets[i][7] = 0;
      }, 50);
    }
  }
}

function checkBounds() {
  let normal = null;
  if (p.x > b) {
    normal = createVector(-1, 0, 0);
    offsets[0][7] = 1;
  }

  if (p.x < -b) {
    normal = createVector(1, 0, 0);
    offsets[1][7] = 1;
  }

  if (p.y > b) {
    normal = createVector(0, 1, 0);
    offsets[2][7] = 1;
  }

  if (p.y < -b) {
    normal = createVector(0, -1, 0);
    offsets[3][7] = 1;
  }

  if (p.z > b) {
    normal = createVector(0, 0, -1);
    offsets[4][7] = 1;
  }

  if (p.z < -b) {
    normal = createVector(0, 0, 1);
    offsets[5][7] = 1;
  }

  if (normal === null) return;

  // reflection v′= v−2(v⋅n)n
  // could just use p5 reflect method
  let d = dot(normal, dir);
  let proj = mult(normal, d);

  dir = sub(dir, mult(proj, 2));
}

function bip() {
  let osc = new p5.Oscillator("sine");
  osc.freq(440); // Frequency in Hz (A4 note)
  osc.start();
  osc.amp(0.5, 0.1); // Set amplitude to 0.5 over 0.1 seconds
  osc.stop(0.2); // Stop after 0.2 seconds
}
