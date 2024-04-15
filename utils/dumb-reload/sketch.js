// @ts-nocheck
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  describe('Example of using dumb-reload, a naive pull based live-reload library. It reloads the sketch without the need for a full page refresh.');
}

function draw() {
  background(100);  
  ellipse(100, 100, 40, 40);
  ellipse(200, 100, 40, 40);
}
