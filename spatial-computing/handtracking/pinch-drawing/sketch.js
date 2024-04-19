let lines = [];
let verts = [];

let lastClick = 0;

function preload() {
  createARCanvas();
}

function setup() {
  describe("Draw lines with the pinch gesture. Double pinch to erase.");
  mainHandMode(RIGHT);
}

function draw() {
  p5.instance._pinchTreshold = 25e-3;
  strokeWeight(5);
  stroke(255);
  noFill();

  for (const lineData of lines) {
    let verts = lineData;
    beginShape();
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      vertex(v.x, v.y, v.z);
    }
    endShape();
  }
 
  push();
  translate(finger.x, finger.y, finger.z);
  scale(0.003);
  sphere(1);
  pop();
  
  if (frameCount - lastClick < 15) return;
  if (fingersArePinched) {
    if (verts.length > 0) {
      const lv = verts[verts.length - 1];
      const spaced = dist(lv.x, lv.y, lv.z, finger.x, finger.y, finger.z);
      if (spaced > 5e-3) {
        verts.push({...finger});
      }
    } 
    else 
    {
      verts.push({...finger});
    }
  }
}

function fingersPinched(){
  if (frameCount - lastClick < 50) {
    lines = [];
    verts = [];
    lines.push(verts);
  } else {
    verts = [];
    lines.push(verts);
  }
  lastClick = frameCount;
}
