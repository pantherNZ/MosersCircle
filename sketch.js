// Moser's circle problem
// https://www.youtube.com/watch?v=YtkIWDE36qU
const numPoints = 15;
let circlePos;
let circleRadius;

let time = 0.0;
const animationSpeed = 4.0;
const drawLineTime = 0.5;

function setup() {
  createCanvas(1000, 1000)
  background(0)
  let tex = createP();
  tex.style('font-size', '20px')
  tex.position(60, 165)
  //katex.render('{n\\choose x}', tex.elt)
  
  circlePos = createVector(width/2, height/2);
  circleRadius = width/1.2;
}

function draw() {
  time += deltaTime * 0.001 * animationSpeed;
  let t = time;
  drawCircle(circlePos, circleRadius, 0, color(255,0,0), 2);
  t = drawLines(t);
  t = drawIntersections(t);
}

function drawLines(t) {
  let drawPairsT = t - drawLineTime * numPoints;
  
  for(let i = 0; i <= numPoints; ++i) {
    const pos = getPosOnCircle( PI * 2.0 / numPoints * i);
    
    for(let j = i + 1; j <= numPoints; ++j) {
      let timeV = min(1.0, max(0.0, t - j));
      let colourT = drawPairsT - ((i * numPoints) + j) * drawLineTime;
      let colour = (colourT >= 0.0 && colourT < 1.0) ? color(0,0,255) : 100;
      let size = (colourT >= 0.0 && colourT < 1.0) ? 10.0 : 1.0;
      animateLine(getPosOnCircle(PI * 2.0 / numPoints * j), pos, colour, size, timeV);
    }
  }
  
  for(let i = 0; i <= numPoints; ++i) {
    const angle = PI * 2.0 / numPoints * i;
    drawCircle(getPosOnCircle(angle), 15, 255, 255, 0);
  }
  
  return drawPairsT - ((numPoints + 1) * numPoints / 2.0) * drawLineTime;
}

function drawIntersections(t) {
  
  
  return t;
}

function getPosOnCircle(angle) {
  const offset = createVector(sin(angle), cos(angle)).mult(circleRadius/2.0);
  return p5.Vector.add(circlePos, offset);
}

function drawCircle(pos, size, fillCol, strokeCol, weight) {
  fill(fillCol);
  stroke(strokeCol);
  strokeWeight(weight);
  ellipse(pos.x, pos.y, size, size);
}

function animateLine(posA, posB, col, size, t) {
  drawLine(posA, p5.Vector.lerp(posA, posB, t), col, size);
}

function drawLine(posA, posB, col, size) {
  stroke(col)
  strokeWeight(size);
  line(posA.x, posA.y, posB.x, posB.y);
}

function drawText(str, pos, col, size) {
  fill(col);
  textSize(size);
  text(str, pos.x, pos.y)
}

function numFaces() {
  // Euler's characteristic formula for planar graphs
  // V - E + F = 2
  // F = E - V + 1 (subtracting 1 because of the outside/external region face)
  // E = (N choose 2) + 2 * (N choose 4) + N
  // V = N + (N choose 4)
  // F = ((N choose 2) + 2 * (N choose 4) + N) - (N + (N choose 4)) + 1
  // F = 1 + (N choose 2) + (N choose 4)
  return 1 + numLines() + numIntersections();
}
  
function numLines() {
  if(numPoints < 2) {
    return 0;
  }
  // N choose 2
  return binomialCoefficient(2);
}

function numIntersections(numPoints) {
  if(numPoints < 4) {
    return 0;
  }
  // N choose 4
  return binomialCoefficient(4);
}