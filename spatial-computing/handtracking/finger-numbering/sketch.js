// Fonts need to be loaded and set for WEBGL
let font;

function preload() {
  createARCanvas();
  font = loadFont("assets/SpaceGrotesk-Regular.otf");
}

function setup() {
  describe("Demonstrates the indexing of fingers");
  textFont(font);
  textAlign(CENTER, BASELINE);
  // Texts were occluding each other otherwise
  gl = this._renderer.GL;
  gl.disable(gl.DEPTH_TEST);
}

function draw() {
  fill(255);
  for (let i = 0; i < fingersMain.length; i++) {
    const f = fingersMain[i];
    push();
    translate(f.x, f.y, f.z);
    translate(0, 0.02, 0);
    rotateX(PI);
    // applyMatrix(f.mat4); - use this if you want to rotate numbers with finger tips
    scale(0.001);
    text(i, 0, 0);     
    pop();
  }

  for (let i = 0; i < fingersAlt.length; i++) {
    const f = fingersAlt[i];
    push();
    translate(f.x, f.y, f.z);
    translate(0, 0.02, 0);
    rotateX(PI);
    scale(0.001);
    text(i, 0, 0); 
    pop();
  }
}
