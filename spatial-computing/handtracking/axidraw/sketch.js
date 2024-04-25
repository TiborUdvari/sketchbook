console.log("Axidraw");

let lastClick = 0;

let isInteracting = false;
let pIsInteracting = false;

let lineStart = null;
let lineEnd = null;

let pinchCounter = 0;

const gun = Gun(['https://20d01978c152881447a9919050afa584.loophole.site/gun']);
gun.get('tibor').on(data => console.log('Update:', data));

let x = 0;


// setInterval(() => {
//   console.log("send");
//   x = x + 1;
//   // gun.get("tibor").put({ msg: "tibor" + JSON.stringify(x) });
// }, 1000);

function preload() {
  createARCanvas();
}

function setup() {
}

function draw() {
  strokeWeight(5);
  stroke(255);
  noFill();

  if (fingersArePinched) {
    pinchCounter = pinchCounter + 1;
  } else {
    pinchCounter = 0;
  }

  isInteracting = pinchCounter > 30;


  if (isInteracting && !pIsInteracting){
    lineStart = {...finger};
  }

  if (!isInteracting && pIsInteracting) {
    lineEnd = {...finger};
  }

  if (isInteracting) {
    line(lineStart.x, lineStart.y, lineStart.z, finger.x, finger.y, finger.z);
  } 

  if (!isInteracting && lineStart && lineEnd){
    line(lineStart.x, lineStart.y, lineStart.z, lineEnd.x, lineEnd.y, lineEnd.z);
  }

  pIsInteracting = isInteracting;
}

function fingersPinched(){
  // send the command to axidraw  

  let inited = lineStart && lineEnd;
  if (!inited) return;
  let d = dist(lineStart.x, lineStart.y, lineStart.z, lineEnd.x, lineEnd.y, lineEnd.z);

  console.log("send gun msg");
  gun.get("tibor").put({ msg: JSON.stringify(d) });
 
  let pv1 = createVector(lineStart.x, lineStart.y, lineStart.z);
  let pv2 = createVector(lineEnd.x, lineEnd.y, lineEnd.z);

  let dir = p5.Vector.sub(pv2, pv1).normalize();
  pv2 = p5.Vector.add(pv1, dir.mult(d * 0.8));   
  lineEnd.x = pv2.x;
  lineEnd.y = pv2.y;
  lineEnd.z = pv2.z;
}
