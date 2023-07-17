// TODO:
// Move data generation to CircleData class
// Optimise
// Add text/info display
// CountPlanarEdges interp needs to scale based on length
// Drag and drop points input
// Randomise vs symetrical dropdown option
// Input for # points

class MoserCircleData {
  constructor() {
    this.numPoints = 9;
    this.numLines = ((this.numPoints + 1) * this.numPoints) / 2;
    this.circleAngle = PI * 2.0 / this.numPoints;
  }
}

class MoserRenderData {
  constructor() {
    this.drawLineTime = 0.5;
  }

  render(stateMachine, data) {
    this.numPoints = data.numPoints;
    this.numLines = data.numLines;
    const circleScale = 0.7;
    this.circlePos = createVector(width/2, height/2);
    this.circleRadius = Math.min(width, height)*circleScale;
    this.circleAngle = data.circleAngle;

    drawCircle(this.circlePos, this.circleRadius, 0, color(255, 0, 0), 2);
    this.drawLines(stateMachine);
    this.drawPlanarGraph(stateMachine);
    this.drawIntersections(stateMachine);
    this.drawPoints(stateMachine);
  }
    
  getPosOnCircle(angle) {
    const offset = createVector(sin(angle), cos(angle)).mult(this.circleRadius/2.0);
    return p5.Vector.add(this.circlePos, offset);
  }

  drawPoints(stateMachine) {
    for (let i = 0; i <= this.numPoints; ++i) {
      const angle = this.circleAngle * i;
      drawCircle(this.getPosOnCircle(angle), 15, 255, 255, 0);
    }
  }
  
  drawLines(stateMachine) {
    if (stateMachine.state >= State.CountPlanarEdges) {
      return;
    }

    let count = 0;

    for (let i = 0; i <= this.numPoints; ++i) {
      const pos = this.getPosOnCircle(this.circleAngle * i);
      const drawLineNextT = (stateMachine.getStateLength() / this.numPoints) * (i + 1);
      const drawLineT = (stateMachine.getStateLength() / this.numPoints) * i;

      for (let j = i + 1; j <= this.numPoints; ++j, ++count) {
        const drawPairNextT = (stateMachine.getStateLength() / this.numLines) * count;
        const drawPairT = (stateMachine.getStateLength() / this.numLines) * (count - 1);
        const drawPairInterp = stateMachine.state == State.CountPairs ? (stateMachine.time - drawPairT) / (drawPairNextT - drawPairT) : 1.0;
        const drawLineInterp = stateMachine.state == State.DrawLines ? (stateMachine.time - drawLineT) / (drawLineNextT - drawLineT) : 1.0;
        const colour = (drawPairInterp >= 0.0 && drawPairInterp < 1.0) ? color(0, 0, 255) : 100;
        const size = (drawPairInterp >= 0.0 && drawPairInterp < 1.0) ? 3.0 : 1.0;
        animateLine(this.getPosOnCircle(this.circleAngle * j), pos, colour, size, drawLineInterp);
      }
    }
  }

  drawIntersections(stateMachine) {
    if (stateMachine.state != State.CountIntersections) {
      return;
    }

    let quadruplets = combinations(this.numPoints, 4);

    const drawIntersectionIdx = Math.floor(stateMachine.time / (stateMachine.getStateLength() / quadruplets.length));

    const drawIntersection = (quad, drawLines) => {
      const posA = this.getPosOnCircle(this.circleAngle * quad[0]);
      const posB = this.getPosOnCircle(this.circleAngle * quad[1]);
      const posC = this.getPosOnCircle(this.circleAngle * quad[2]);
      const posD = this.getPosOnCircle(this.circleAngle * quad[3]);

      if (drawLines) {
        drawLine(posA, posC, 255, 2);
        drawLine(posB, posD, 255, 2);
      }

      // Compute intersection
      let intersect = lineIntersection(posA, posC, posB, posD);
      drawCircle(intersect, 8.0, color(0, 255, 255));
    }

    for (let i = 0; i <= drawIntersectionIdx; ++i) {
      drawIntersection(quadruplets[i], i == drawIntersectionIdx);
    }
  }

  drawPlanarGraph(stateMachine) {
    if (stateMachine.state != State.CountPlanarEdges && stateMachine.state != State.CountFaces) {
      return;
    }

    const quadruplets = combinations(this.numPoints, 4);
    const planarLineGapMax = 30.0;
    const t = stateMachine.time / (stateMachine.getStateLength() / 2.0);
    const planarLineGap = stateMachine.state == State.CountFaces ? 0 : lerp(5.0, planarLineGapMax, min(t, 1.0));
    const planarGraph = {};
    const closestIntersectPerLine = {};

    quadruplets.forEach(quad => {
      const posA = this.getPosOnCircle(this.circleAngle * quad[0]);
      const posB = this.getPosOnCircle(this.circleAngle * quad[1]);
      const posC = this.getPosOnCircle(this.circleAngle * quad[2]);
      const posD = this.getPosOnCircle(this.circleAngle * quad[3]);
      const intersect = lineIntersection(posA, posC, posB, posD);
      const intersectV = createVector(intersect.x, intersect.y);
      const lines = [[posA, posC], [posB, posD]];

      lines.forEach(p => {
        const key = hashVecs(p[0], p[1]);
        if (closestIntersectPerLine[key] === undefined) {
          closestIntersectPerLine[key] = [p[0], p[1]];
        }
        closestIntersectPerLine[key].push(intersectV);
      });

      drawCircle(intersectV, 8, 255);
    });

    for (const intersections of Object.values(closestIntersectPerLine)) {
      const from = intersections[0].copy();
      intersections.sort((a, b) => {
        return p5.Vector.sub(a, from).magSq() - p5.Vector.sub(b, from).magSq();
      });

      for (let i = 0; i < intersections.length - 1; ++i) {
        let direction = p5.Vector.sub(intersections[i + 1], intersections[i]);
        direction.setMag(planarLineGap);
        drawLine(p5.Vector.add(intersections[i], direction), p5.Vector.sub(intersections[i + 1], direction), 200, 2);

        // Setup planar graph connections
        let key = hashVec(intersections[i]);
        if (planarGraph[key] === undefined) {
          planarGraph[key] = [intersections[i]];
        }
        planarGraph[key].push(intersections[i + 1]);
        key = hashVec(intersections[i + 1]);
        if (planarGraph[key] === undefined) {
          planarGraph[key] = [intersections[i + 1]];
        }
        planarGraph[key].push(intersections[i]);
      }
    }

    for (let i = 0; i < this.numPoints; ++i) {
      const posA = this.getPosOnCircle(this.circleAngle * i);
      const posB = this.getPosOnCircle(this.circleAngle * (i + 1));
      planarGraph[hashVec(posB)].push(posA);
      planarGraph[hashVec(posA)].push(posB);
      let direction = p5.Vector.sub(posB, posA);
      direction.setMag(planarLineGap);
      drawLine(p5.Vector.add(posA, direction), p5.Vector.sub(posB, direction), 200, 2);
    }

    // Faces
    if (stateMachine.state == State.CountFaces) {
      // Sort planar graph nodes for each node by its clockwise connections
      Object.values(planarGraph).forEach(node => {
        const from = node[0].copy();
        node.sort((a, b) => {
          if (vecEquals(a, from)) {
            return -9999;
          }
          if (vecEquals(b, from)) {
            return 9999;
          }
          const dirA = p5.Vector.sub(a, from);
          const dirB = p5.Vector.sub(b, from);
          return dirA.heading() - dirB.heading();
        });
      });

      const used = new Set();
      let numFaces = 0;
      let maxFaces = this.numFaces();
      let timePerFace = stateMachine.getStateLength() / 4.0 / maxFaces;
      let values = Object.values(planarGraph);

      for (let idx = 0; idx < values.length && numFaces*timePerFace < stateMachine.time; ++idx) {
        let currentNode = values[idx];
        let start = currentNode[0];
        let vertices = []

        for (let i = 1; i < currentNode.length && numFaces*timePerFace < stateMachine.time; ++i) {
          let previous = start;
          let current = currentNode[i];
          let safety = 15;

          while (!vecEquals(start, current) && safety-- > 0) {
            const key = hashVecs(previous, current);
            if (used.has(key)) {
              vertices.length = 0;
              break;
            }
            used.add(key);

            vertices.push(current);
            const nextP = planarGraph[hashVec(current)];
            const fromDir = p5.Vector.sub(current, previous);

            for (let i = 1; i < nextP.length; ++i) {
              if (vecEquals(previous, nextP[i])) {
                previous = current.copy();
                current = nextP[i == 1 ? nextP.length - 1 : i - 1];
                break;
              }
            }

            // If the next connection we've found is obtuse in angle/to the LEFT of the from direction (IE. an outside/circumference connection) then skip
            const toDir = p5.Vector.sub(current, previous);
            const dot = fromDir.x * -toDir.y + fromDir.y * toDir.x;
            if (dot > 0) {
              vertices.length = 0;
              break;
            }
          }

          if (vertices.length > 0) {
            ++numFaces;
            vertices.push(current);
            this.drawFace(stateMachine.numCycles, numFaces, vertices);
            vertices = []
          }
        }
      }

      for (let i = 0; i <= this.numPoints && numFaces * timePerFace < stateMachine.time; ++i) {
        const baseAng = this.circleAngle * i;
        const pos = this.getPosOnCircle(baseAng);
        ++numFaces;
        let vertices = [pos];
        const numVerts = Math.round(128/this.numPoints);
        for(let v = 0; v <= numVerts; ++v) {
          vertices.push(this.getPosOnCircle(baseAng + this.circleAngle/numVerts * v));
        }
        this.drawFace(stateMachine.numCycles, numFaces, vertices);
      }
    }
  }

  drawFace(numCycles, numFaces, vertices) {
    fill(randCol(createVector(numFaces*13.12 + numCycles*9.32), numFaces*99.23 + numCycles*11.23));
    beginShape();
    vertices.forEach(v => vertex(v.x, v.y));
    endShape(CLOSE);
  }

  numFaces() {
    // Euler's characteristic formula for planar graphs
    // V - E + F = 2
    // F = E - V + 1 (subtracting 1 because of the outside/external region face)
    // E = (N choose 2) + 2 * (N choose 4) + N
    // V = N + (N choose 4)
    // F = ((N choose 2) + 2 * (N choose 4) + N) - (N + (N choose 4)) + 1
    // F = 1 + (N choose 2) + (N choose 4)
    return 1 + this.numLines + this.numIntersections();
  }

  numIntersections() {
    if (this.numPoints < 4) {
      return 0;
    }
    // N choose 4
    return binomialCoefficient(this.numPoints, 4);
  }
}