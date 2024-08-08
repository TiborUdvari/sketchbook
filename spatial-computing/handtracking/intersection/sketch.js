let intersectionBox;
let p;

function preload() {
  createARCanvas();
}

function setup() {
  describe("Finger intersection with boxes");
  mainHandMode(RIGHT);

  intersectionBox = buildGeometry(createBoxGeometry);
  intersectionBox.clearColors();
  console.log(intersectionBox);
  p = createVector(0, 0, 0);
  // startDumbReload(500);
}

function draw() {
  // push();
  // translate(0, 0, -0.5);
  // fill(255, 0, 0);
  // box(0.1, 0.1, 0.1);
  // pop();

  // calculate
  p = createVector(finger.x, finger.y, finger.z);

  // Intersection box transform
  let ibt = new p5.Matrix();
  ibt.translate([0, 0, -0.5]);

  // point relative to intersection box
  let invBt = ibt.copy().invert(ibt).transpose();
  let pTransformed = invBt.multiplyPoint(p);

  let bbox = intersectionBox.calculateBoundingBox();
  const isInside = pointInBBox(pTransformed, bbox);

  // draw
  push();
  translate(p.x, p.y, p.z);
  fill(255, 0, 0, 100);
  box(0.1);
  pop();

  if (isInside) {
    stroke(255, 255, 255);
    noFill();
  } else {
    noStroke();
    fill(255, 255, 255, 255);
  }

  push();
  applyMatrix(ibt.mat4);
  model(intersectionBox);
  pop();
}

// helper functions
function pointInBBox(p, bbox) {
  const b = bbox;
  return (
    p.x > b.min.x &&
    p.y > b.min.y &&
    p.z > b.min.z &&
    p.x < b.max.x &&
    p.y < b.max.y &&
    p.z < b.max.z
  );
}

function createBoxGeometry() {
  box(1);
}

p5.Geometry.prototype.calculateBoundingBox = function () {
  if (this.boundingBoxCache) {
    return this.boundingBoxCache; // Return cached result if available
  }

  let minVertex = new p5.Vector(
    Number.MAX_VALUE,
    Number.MAX_VALUE,
    Number.MAX_VALUE,
  );
  let maxVertex = new p5.Vector(
    Number.MIN_VALUE,
    Number.MIN_VALUE,
    Number.MIN_VALUE,
  );

  for (let i = 0; i < this.vertices.length; i++) {
    let vertex = this.vertices[i];
    minVertex.x = Math.min(minVertex.x, vertex.x);
    minVertex.y = Math.min(minVertex.y, vertex.y);
    minVertex.z = Math.min(minVertex.z, vertex.z);

    maxVertex.x = Math.max(maxVertex.x, vertex.x);
    maxVertex.y = Math.max(maxVertex.y, vertex.y);
    maxVertex.z = Math.max(maxVertex.z, vertex.z);
  }
  // Calculate size and offset properties
  let size = new p5.Vector(
    maxVertex.x - minVertex.x,
    maxVertex.y - minVertex.y,
    maxVertex.z - minVertex.z,
  );
  let offset = new p5.Vector(
    (minVertex.x + maxVertex.x) / 2,
    (minVertex.y + maxVertex.y) / 2,
    (minVertex.z + maxVertex.z) / 2,
  );

  // Cache the result for future access
  this.boundingBoxCache = {
    min: minVertex,
    max: maxVertex,
    size: size,
    offset: offset,
  };

  return this.boundingBoxCache;
};
