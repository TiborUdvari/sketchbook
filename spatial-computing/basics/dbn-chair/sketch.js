// @ts-nocheck
function preload() {
  createARCanvas();
}

function setup() {
  describe("A chair in space inspired by DBN.");
  stroke(255);
  noFill();
  fill(0, 0, 0, 0);
  angleMode(DEGREES);
  rectMode(CENTER);
  // startDumbReload(200); -- activate this to do live coding, does not work on p5 web editor
}

function draw() {
  let f = 0.3;
  strokeWeight(2);
  noFill();

  let s = 0.3 * 0.01;
  let boxTransform = new p5.Matrix();
  boxTransform.translate([0.25, -0.25, -f]);
  boxTransform.scale([s, s, s]);

  push();
  applyMatrix(boxTransform.mat4);
  box(100, 100, 100);
  translate(0, -50, 0); 
 
  var d = 5;
  var h = 11;

  push();
  translate(30, 0, -30);
  push();
  rotateY(45);
  push();
  translate(d, 0, 0);
  line(0, 0, 0, 0, h, 0); 
  pop();

  push();
  translate(-d, 0, 0);
  line(0, 0, 0, 0, h, 0); 
  pop();

  push();
  translate(0, 0, d);
  line(0, 0, 0, 0, h, 0); 
  pop();

  push();
  translate(0, 0, -d);
  line(0, 0, 0, 0, h, 0); 
  pop();
  pop();

  push();
  translate(0, h + 1, 0);
  rotateX(90, 0, 0);
  fill(0, 0); 
  blendMode(REPLACE);
  rect(0, 0, 15, 15);
  blendMode(BLEND);
  pop();

  push();
  translate(0, h + 11.5, -7.5);
  fill(0, 0); 
  blendMode(REPLACE);
  rect(0, 0, 15, 8);
  blendMode(BLEND);
  pop();

  translate(0, h, -7.5);
  line(0, 0, 0, 0, 7.5, 0); 

  pop();
  rotateY(-90);
  translate(-35, 2, -50);
  arc(0, 0, 5, 5, 0, 180);

  push();
  translate(-2.5, -2, 0);
  line(0, 0, 0, 0, 2, 0);
  pop();

  push();
  translate(2.5, -2, 0);
  line(0, 0, 0, 0, 2, 0);
  pop();

  pop();
}
