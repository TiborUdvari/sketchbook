const dirMult = 1e-4;
const b = 0.1;
const s = 0.03; 
const offset = new p5.Vector(0, 0, -0.5);

const vb = b + s / 2;
let dir = null;
let p = null;
let img;
let colIndex = 0;
let dvdGraphics;

// cols
const cols = [
  [255, 105, 180],  // Bright Pink
  [0, 255, 255],    // Electric Blue
  [20, 255, 0],     // Neon Green
  [255, 255, 0],    // Sunny Yellow
  [148, 0, 211],    // Vibrant Purple
  [255, 85, 85],    // Hot Coral
  [0, 255, 255],    // Cyan (Duplicate of Electric Blue noted earlier, included for completeness)
  [50, 205, 50],    // Lime Green
  [64, 224, 208],   // Turquoise
  [75, 0, 130]      // Dark Purple
];


// utils
const mult = (vector, multiplier) => p5.Vector.mult(vector, multiplier);
const dot = (v1, v2) => p5.Vector.dot(v1, v2);
const sub = (v1, v2) => p5.Vector.sub(v1, v2);

let offsets = null;

function preload(){
  createARCanvas();
  img = loadImage('dvd-small.png');
}

function setup() {
  describe("A colorful DVD logo hitting a cube in space.");

  dvdGraphics = createGraphics(img.width, img.height, WEBGL);
  
  dir = p5.Vector.random3D().normalize().mult(dirMult);
  p = createVector(0, 0, 0);
  noFill();
  
  offsets = [
    [ 1, 0, 0, PI / 2, 0, 1, 0, 0],
    [-1, 0, 0, PI / 2, 0, 1 ,0, 0],
    [0,  1, 0, PI / 2, 1, 0, 0, 0],
    [0, -1, 0, PI / 2, 1, 0, 0, 0],
    [0, 0,  1, 0, 0, 1, 0, 0],
    [0, 0, -1, 0, 0, 1, 0, 0]
  ]; 

  offsets = offsets.map(off => [
    off[0] * vb, 
    off[1] * vb, 
    off[2] * vb, 
    ...off.splice(3)]);
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
  //box(s, s, s);
  //image(img, 0, 0, s, s);
  drawDvd();

  pop();

  pop();
}

function drawDvd(){
  dvdGraphics.clear();
  // don't understand why i need to divide here
  dvdGraphics.image(img, 0, 0, dvdGraphics.width / 2, dvdGraphics.height /2 , 0, 0, img.width, img.height, CONTAIN);
  
  dvdGraphics.blendMode(MULTIPLY);
  dvdGraphics.fill(...cols[colIndex]);
  dvdGraphics.rect(0, 0, dvdGraphics.width, dvdGraphics.height);

  dvdGraphics.blendMode(BLEND);

  fill(255);
  noStroke();
  push();
  texture(dvdGraphics);
    scale(1, -1, -1); // not sure why

  translate(-s/2, -s/2);
  plane(s * 2, s * 2); 
  pop();
}

function drawBounds(){
  // rotation - angle - axis
  // should I crate it with vertices instead? 
  // Next iteration - do vertices and shaders
  // pack the data like offset, angle, axis

  for (let i = 0; i < 6; i++) {
    const [x, y, z, angle, ex, ey, ez, f] = offsets[i];
    
    push();
    translate(x, y, z);
    rotate(angle, createVector(ex, ey, ez));
    scale(vb * 2);
    rect(-0.5, -0.5, 1, 1);
    pop();
    
    noFill();
    if (f == 1) {
      colIndex = Math.floor(Math.random() * cols.length); 
      bip();
      offsets[i][7] = 2; // hack make it happen only once
    }
    
  }
}

function checkBounds() {
  let normal = null;
  if (p.x > b) {
    normal = createVector(-1, 0, 0);
    offsets[0][7] = 1;
  }
  
  if (p.x < -b ){
    normal = createVector(1, 0, 0);
    offsets[1][7] = 1;
  }
  
  if (p.y > b){
    normal = createVector(0, 1, 0);
    offsets[2][7] = 1;
  }
  
  if (p.y < -b){
    normal = createVector(0, -1, 0);
    offsets[3][7] = 1;
  }
  
  if (p.z > b) {
    normal = createVector(0, 0, -1);
    offsets[4][7] = 1;
  }
  
  if (p.z < -b){
    normal = createVector(0, 0, 1);
    offsets[5][7] = 1;
  }
  
  if (normal === null) return;
  
  // reflection v′= v−2(v⋅n)n
  // could just use p5 reflect method, but no
  let d = dot(normal, dir);
  let proj = mult(normal, d);
  
  dir = sub(dir, mult(proj, 2));
}

function bip() {
  let osc = new p5.Oscillator('sine');
  osc.freq(440); // Frequency in Hz (A4 note)
  osc.start();
  osc.amp(0.5, 0.1); // Set amplitude to 0.5 over 0.1 seconds
  osc.stop(0.2); // Stop after 0.2 seconds
}
