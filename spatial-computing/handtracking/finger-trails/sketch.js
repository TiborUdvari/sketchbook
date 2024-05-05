let trails = [[], [], [], [], []];

function preload() {
  createARCanvas();
}

function setup() {
  describe("Leave trail with left hand while right one is pinched.");
  mainHandMode(RIGHT);
}

function draw() {
  sphere(0.0001); // hack, it is currently a problem if we don't draw anything
  strokeWeight(4);
  stroke(255);
  noFill();

  if (fingersArePinched) {
    for (let i = 0; i < fingersAlt.length; i++) {
      let finger = fingersAlt[i];
      trails[i].push({...finger}); 
    }
  } else {
    trails = [[], [], [], [], []];
  }
 
  for (let i = 0; i < trails.length; i++) {
    const trail = trails[i];
    beginShape();
    for (const v of trail) {
      vertex(v.x, v.y, v.z);
    }
    endShape();
  } 
}
