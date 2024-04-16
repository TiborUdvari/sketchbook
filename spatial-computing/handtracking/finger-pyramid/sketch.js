function preload() {
  createARCanvas();
}

function setup() {
  describe("A pyramid with your finger at the peak inside a box.");
}

// todo - create coords for the interaction space
// should it be 0 to 1 ? - probably to make it simpler
// make it a space of 1 centered around the origin
// move the origin elsewhere

function draw() {
  let f = 0.5;

  stroke(255);
  fill(0, 0, 0, 0);
  noFill();
  let s = 1;
  push();
  translate(0, 0, -f);
  scale(1);
  box(s, s, s);
  pop();
  //
  // push();
  // translate(finger.x, finger.y, finger.z);
  // scale(0.1);
  // sphere(1);
  // pop();
}
