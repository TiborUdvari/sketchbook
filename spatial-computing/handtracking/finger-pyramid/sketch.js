// todo - fix cube bounds

function preload() {
  createARCanvas();
}

function setup() {
  describe("A pyramid with your finger at the peak inside a box.");
}

function draw() {
  let f = 0.3;
  stroke(255);
  fill(0, 0, 0, 0);
  noFill();

  let s = 0.3;
  let boxTransform = new p5.Matrix();
  boxTransform.translate([0.25, -0.25, -f]);
  boxTransform.scale([s, s, s]);

  let inverseBoxTransform = boxTransform.copy().invert(new p5.Matrix());
  let lf = inverseBoxTransform.multiplyPoint(finger); 
  
  let isInside = ((abs(lf.x) < .5) && (abs(lf.y) < .5) && (abs(lf.z) < .5));
  let vertPositions = [
    {x: -0.5, y: -0.5, z: -0.5}, 
    {x: 0.5, y: -0.5, z: 0.5}, 
    {x: -0.5, y: -0.5, z: 0.5}, 
    {x: 0.5, y: -0.5, z: -0.5}, 
  ]; 

  if (isInside) {
    for (let i = 0; i < vertPositions.length; i++) {
      const vert = vertPositions[i];
      let globalVert = boxTransform.multiplyPoint(vert);

      line(finger.x, finger.y, finger.z, globalVert.x, globalVert.y, globalVert.z);
    }
  }

  push();
  applyMatrix(boxTransform.mat4);
  box(1, 1, 1);
  pop();
}
