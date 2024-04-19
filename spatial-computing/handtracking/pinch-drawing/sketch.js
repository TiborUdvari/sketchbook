let lines = [];
let verts = [];

let lastClick = 0;

function preload() {
  createARCanvas();
}

function setup() {
  describe("Toggle between a box and a sphere with a pinch.");
  mainHandMode(RIGHT);
}

function draw() {
  p5.instance._pinchTreshold = 25e-3;
  strokeWeight(5);
  stroke(255);
  noFill();
  // normalMaterial();
  // scale(0.01);

  for (const lineData of lines) {
    let verts = lineData;
    beginShape();
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      // const nv = verts[Math.min(i+1, verts.length - 1)] 
      // line(v.x, v.y, v.z, nv.x, nv.y, nv.z);
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


function mouseClicked(){
  console.log("mouse clicked");
  lines = [];
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
