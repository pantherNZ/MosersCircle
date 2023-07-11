// Moser's circle problem
// https://www.youtube.com/watch?v=YtkIWDE36qU
const numPoints = 5;
const numLines = ((numPoints + 1) * numPoints) / 2;
let circlePos;
let circleRadius;
let circleAngle;

let time;
let state;
const animationSpeed = 1.0;
const drawLineTime = 0.5;

function setup() {
  createCanvas(1000, 1000)

  let tex = createP();
  tex.style('font-size', '20px')
  tex.position(60, 165)
  //katex.render('{n\\choose x}', tex.elt)
  
  circlePos = createVector(width/2, height/2);
  circleRadius = width/1.2;
  circleAngle = PI * 2.0 / numPoints;
  state = State.DrawLines;
  time = 0.0;
}

function draw() {
  background(0)
  processState();
  drawCircle(circlePos, circleRadius, 0, color(255,0,0), 2);
  drawLines();
  drawIntersections();
  
  drawText(state, createVector(50,50), 255, 20);
  drawText(numLines, createVector(50,100), 255, 20);
}

function processState() {
  time += deltaTime * 0.001 * animationSpeed;
  
  if(time >= StateLength[state]) {
    time = 0.0;
    state = nextState(state);
  }
}

function drawLines() {
  let count = 0;
  
  for(let i = 0; i <= numPoints; ++i) {
    const pos = getPosOnCircle( circleAngle * i);
    const drawLineNextT = (StateLength[state] / numPoints) * (i + 1);
    const drawLineT = (StateLength[state] / numPoints) * i;
    
    for(let j = i + 1; j <= numPoints; ++j, ++count) {

      const drawPairNextT = (StateLength[state] / numLines) * count;
      const drawPairT = (StateLength[state] / numLines) * (count - 1);
      const drawPairInterp = state == State.CountPairs ? (time - drawPairT) / (drawPairNextT - drawPairT) : 1.0;
      const drawLineInterp = state == State.DrawLines ? (time - drawLineT) / (drawLineNextT - drawLineT) : 1.0;
      const colour = (drawPairInterp >= 0.0 && drawPairInterp < 1.0) ? color(0,0,255) : 100;
      const size = (drawPairInterp >= 0.0 && drawPairInterp < 1.0) ? 3.0 : 1.0;
      animateLine(getPosOnCircle(circleAngle * j), pos, colour, size, drawLineInterp);
    }
  }
  
  for(let i = 0; i <= numPoints; ++i) {
    const angle = circleAngle * i;
    drawCircle(getPosOnCircle(angle), 15, 255, 255, 0);
  }
}

function drawIntersections() {
  if(state == State.CountIntersections) {
    let quadruplets = combinations(numPoints, 4);
    let count = 0;
    
    const drawIntersectionIdx = Math.floor(time / (StateLength[state] / quadruplets.length));

    const drawIntersection = quad => {
      const posA = getPosOnCircle(circleAngle * quad[0]);
      const posB = getPosOnCircle(circleAngle * quad[1]);
      const posC = getPosOnCircle(circleAngle * quad[2]);
      const posD = getPosOnCircle(circleAngle * quad[3]);
      drawLine(posA, posC, 255, 2);
      drawLine(posB, posD, 255, 2);
      
      // Compute intersection
      const col = color(0,255,255);
      let intersect = lineIntersection(posA, posC, posB, posD);
      drawCircle(intersect, 15.0, col);
    }
    
    drawIntersection(quadruplets[drawIntersectionIdx]);
  }  
}

function getPosOnCircle(angle) {
  const offset = createVector(sin(angle), cos(angle)).mult(circleRadius/2.0);
  return p5.Vector.add(circlePos, offset);
}

function drawCircle(pos, size, fillCol, strokeCol = null, weight = 1) {
  fill(fillCol);
  stroke(strokeCol !== null ? strokeCol : fillCol);
  strokeWeight(weight);
  ellipse(pos.x, pos.y, size, size);
}

function animateLine(posA, posB, col, size, t) {
  drawLine(posA, p5.Vector.lerp(posA, posB, max(0.0, min(1.0, t))), col, size);
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
  return 1 + numLines + numIntersections();
}

function numIntersections() {
  if(numPoints < 4) {
    return 0;
  }
  // N choose 4
  return binomialCoefficient(numPoints, 4);
}