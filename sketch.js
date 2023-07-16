// Moser's circle problem
// https://www.youtube.com/watch?v=YtkIWDE36qU
const numPoints = 9;
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
  state = State.CountFaces;//State.CountPlanarEdges;//State.CountIntersections;//State.CountPairs;//State.DrawLines;
  time = 0.0;
}

function draw() {
  background(0)
  processState();
  drawCircle(circlePos, circleRadius, 0, color(255,0,0), 2);
  drawLines();
  drawPlanarGraph();
  drawIntersections();
  drawPoints();
  
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

function drawPoints() {
  for(let i = 0; i <= numPoints; ++i) {
    const angle = circleAngle * i;
    drawCircle(getPosOnCircle(angle), 15, 255, 255, 0);
  }
}

function drawLines() {
  if(state >= State.CountPlanarEdges) {
    return;
  }
  
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
}

function drawIntersections() {
  if(state != State.CountIntersections) {
    return;
  }

  let quadruplets = combinations(numPoints, 4);
  let count = 0;

  const drawIntersectionIdx = Math.floor(time / (StateLength[state] / quadruplets.length));

  const drawIntersection = (quad, drawLines) => {
    const posA = getPosOnCircle(circleAngle * quad[0]);
    const posB = getPosOnCircle(circleAngle * quad[1]);
    const posC = getPosOnCircle(circleAngle * quad[2]);
    const posD = getPosOnCircle(circleAngle * quad[3]);
    
    if(drawLines) {
      drawLine(posA, posC, 255, 2);
      drawLine(posB, posD, 255, 2);
    }

    // Compute intersection
    let intersect = lineIntersection(posA, posC, posB, posD);
    drawCircle(intersect, 8.0, color(0,255,255));
  }

  for(let i = 0; i <= drawIntersectionIdx; ++i) {
    drawIntersection(quadruplets[i], i == drawIntersectionIdx);
  }
}

function drawPlanarGraph() {
  if(state != State.CountPlanarEdges && state != State.CountFaces) {
    return;
  }

  const quadruplets = combinations(numPoints, 4);
  const planarLineGapMax = 30.0;
  const t = time / (StateLength[state] / 2.0);
  const planarLineGap = state == State.CountFaces ? 0 : lerp(5.0, planarLineGapMax, min(t, 1.0));
  const planarGraph = {};
  const closestIntersectPerLine = {};
  
  quadruplets.forEach(quad => {
    const posA = getPosOnCircle(circleAngle * quad[0]);
    const posB = getPosOnCircle(circleAngle * quad[1]);
    const posC = getPosOnCircle(circleAngle * quad[2]);
    const posD = getPosOnCircle(circleAngle * quad[3]);
    const intersect = lineIntersection(posA, posC, posB, posD);
    const intersectV = createVector(intersect.x, intersect.y);
    const lines = [[posA, posC],[posB, posD]];

    lines.forEach(p => {
       const key = hashVecs(p[0], p[1]);
       if(closestIntersectPerLine[key] === undefined) {
          closestIntersectPerLine[key] = [p[0], p[1]];
        }
        closestIntersectPerLine[key].push(intersectV);
    });
    
    drawCircle(intersectV, 8, 255);
  });
  
  for (const intersections of Object.values(closestIntersectPerLine)) {
    const from = intersections[0].copy();
    intersections.sort((a,b) => {
      return p5.Vector.sub(a, from).magSq() - p5.Vector.sub(b, from).magSq();
    });

    for(let i = 0; i < intersections.length - 1; ++i) {
      let direction = p5.Vector.sub(intersections[i + 1], intersections[i]);
      direction.setMag(planarLineGap);
      drawLine(p5.Vector.add(intersections[i], direction), p5.Vector.sub(intersections[i + 1], direction), 200, 2);
      
      // Setup planar graph connections
      let key = hashVec(intersections[i]);
      if(planarGraph[key] === undefined) {
        planarGraph[key] = [intersections[i]];
      }
      planarGraph[key].push(intersections[i + 1]);
      key = hashVec(intersections[i + 1]);
      if(planarGraph[key] === undefined) {
        planarGraph[key] = [intersections[i + 1]];
      }
      planarGraph[key].push(intersections[i]);
    }
  }

  for(let i = 0; i < numPoints; ++i) {
    const posA = getPosOnCircle( circleAngle * i);
    const posB = getPosOnCircle( circleAngle * (i + 1));
    planarGraph[hashVec(posB)].push(posA);
    planarGraph[hashVec(posA)].push(posB);
    let direction = p5.Vector.sub(posB, posA);
    direction.setMag(planarLineGap);
    drawLine(p5.Vector.add(posA, direction), p5.Vector.sub(posB, direction), 200, 2);
  }
  
  // Faces
  if(state == State.CountFaces) {     
    // Sort planar graph nodes for each node by its clockwise connections
    Object.values(planarGraph).forEach(node => {
      const from = node[0].copy();
      node.sort((a,b) => {
        if(vecEquals(a, from)) {
          return -9999;
        }
        if(vecEquals(b, from)) {
          return 9999;
        }
        const dirA = p5.Vector.sub(a, from);
        const dirB = p5.Vector.sub(b, from);
        return dirA.heading() - dirB.heading();
      });
    });
    
    const used = new Set();
    let numFaces = 0;

    Object.values(planarGraph).forEach(currentNode => {
      let start = currentNode[0];
      let vertices = []
      
      for( let i = 1; i < currentNode.length; ++i) {
        let previous = start;
        let current = currentNode[i];
        let safety = 15;
        
        while(!vecEquals(start, current) && safety --> 0) {
          const key = hashVecs(previous, current);
          if(used.has(key)) {
            vertices.length = 0;
            break;
          }
          used.add(key);

          vertices.push(current);
          const nextP = planarGraph[hashVec(current)];
          const fromDir = p5.Vector.sub(current, previous);

          for(let i = 1; i < nextP.length; ++i) {
            if(vecEquals(previous, nextP[i])) {
              previous = current.copy();
              current = nextP[i == 1 ? nextP.length - 1 : i - 1];
              break;
            }
          }
      
          // If the next connection we've found is obtuse in angle/to the LEFT of the from direction (IE. an outside/circumference connection) then skip
          const toDir = p5.Vector.sub(current, previous);
          const dot = fromDir.x*-toDir.y + fromDir.y*toDir.x;
          if(dot > 0) {
            vertices.length = 0;
            break;
          }
        }

        if( vertices.length > 0) {
          ++numFaces;
          fill(randCol(createVector(numFaces*13.12, numFaces*99.23)));
          beginShape();
          vertices.push(current);
          vertices.forEach(v => vertex(v.x, v.y));
          endShape(CLOSE);
          vertices = []
        }
      }
    });
  }
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