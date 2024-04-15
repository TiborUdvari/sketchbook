function preload() {
  createARCanvas();
}

function setup() {
  describe("A sphere on your right index finger");
  mainHandMode(RIGHT);
}

function draw() {
  normalMaterial();
  push();
  translate(finger.x, finger.y, finger.z);
  sphere(0.01);
  pop();
}
