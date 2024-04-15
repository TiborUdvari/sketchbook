function preload() {
  createARCanvas();
}

function setup() {
  describe("Lines between each finger of your hand");
}

function draw() {
  stroke(255);

  for (let i = 0; i < fingersMain.length; i++) {
    const currentFinger = fingersMain[i];
    const nextFinger = fingersMain[(i+1) % fingersMain.length];
    line(currentFinger.x, currentFinger.y, currentFinger.z, nextFinger.x, nextFinger.y, nextFinger.z);
  }

  for (let i = 0; i < fingersAlt.length; i++) {
    const currentFinger = fingersAlt[i];
    const nextFinger = fingersAlt[(i+1) % fingersAlt.length];
    line(currentFinger.x, currentFinger.y, currentFinger.z, nextFinger.x, nextFinger.y, nextFinger.z);
  }
}
