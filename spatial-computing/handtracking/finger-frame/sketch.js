// Hand specification indexes https://www.w3.org/TR/webxr-hand-input-1/

function preload() {
  createARCanvas();
}

function setup() {
  describe("Frame something with your fingers.");
  // startDumbReload(200);
}

function draw() {
  noFill();
  stroke(255);

  let treshold = 0.07;
  let lp = handLeft[9];
  let lj = handLeft[6]; // mid joint. Proximal phalanx if you want to be fancy
  let lt = handLeft[4];
  let rp = handRight[9];
  let rj = handRight[6];
  let rt = handRight[4];
  
  let d1 = dist(lp.x, lp.y, lp.z, rt.x, rt.y, rt.z) < treshold;
  let d2 = dist(rp.x, rp.y, rp.z, lt.x, lt.y, lt.z) < treshold;

  let connected = d1 && d2;
  strokeWeight(7);

  if (!connected) {
    beginShape(POINTS); // Left hand
    vertex(lp.x, lp.y, lp.z);
    vertex(lj.x, lj.y, lj.z);
    vertex(lt.x, lt.y, lt.z);
    endShape();

    beginShape(POINTS); // Right hand
    vertex(rp.x, rp.y, rp.z);
    vertex(rj.x, rj.y, rj.z);
    vertex(rt.x, rt.y, rt.z);
    endShape();
  }

  if (connected) {
    let mid1 = { x: (lt.x + rp.x) / 2, y: (lt.y + rp.y) / 2, z: (lt.z + rp.z) / 2 };
    let mid2 = { x: (rt.x + lp.x) / 2, y: (rt.y + lp.y) / 2, z: (rt.z + lp.z) / 2 };

    beginShape();
    vertex(mid1.x, mid1.y, mid1.z);
    vertex(rj.x, rj.y, rj.z);
    vertex(mid2.x, mid2.y, mid2.z);
    vertex(lj.x, lj.y, lj.z);
    endShape(CLOSE);
  }
}
