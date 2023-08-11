class MoserCircleData {
  constructor() {
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

  computeData(inputData) {
    this.numPoints = inputData.numPoints;
    this.numLines = (this.numPoints * (this.numPoints-1)) / 2;
    this.circleAngle = PI * 2.0 / this.numPoints;

    this.circlePos = createVector(width/2, height/2);
    const circleScale = 0.7;
    this.circleRadius = Math.min(width, height)*circleScale;  
    this.quadruplets = combinations(this.numPoints, 4);

    this.circumferencePoints = [];
    for (let i = 0; i < this.numPoints; ++i) {
      this.circumferencePoints.push(this.getPosOnCircle(this.circleAngle * i));
    }

    this.lines = [];
    for (let i = 0; i <= this.numPoints; ++i) {
      for (let j = i + 1; j <= this.numPoints; ++j) {
        this.lines.push([this.getPosOnCircle(this.circleAngle * j), this.getPosOnCircle(this.circleAngle * i)]);
      }
    }

    this.intersections = [];
    this.quadruplets.forEach(quad => {
      const posA = this.circumferencePoints[quad[0]];
      const posB = this.circumferencePoints[quad[1]];
      const posC = this.circumferencePoints[quad[2]];
      const posD = this.circumferencePoints[quad[3]];
      this.intersections.push(lineIntersection(posA, posC, posB, posD));
    });

    this.closestIntersectPerLine = {};
    this.quadruplets.forEach(quad => {
      const posA = this.circumferencePoints[quad[0]];
      const posB = this.circumferencePoints[quad[1]];
      const posC = this.circumferencePoints[quad[2]];
      const posD = this.circumferencePoints[quad[3]];
      const intersect = lineIntersection(posA, posC, posB, posD);
      const lines = [[posA, posC], [posB, posD]];

      lines.forEach(p => {
        const key = hashVecs(p[0], p[1]);
        if (this.closestIntersectPerLine[key] === undefined) {
          this.closestIntersectPerLine[key] = [p[0], p[1]];
        }
        this.closestIntersectPerLine[key].push(createVector(intersect.x, intersect.y));
      });
    });

    this.planarGraph = {};
    for (const intersections of Object.values(this.closestIntersectPerLine)) {
      const from = intersections[0].copy();
      intersections.sort((a, b) => {
        return p5.Vector.sub(a, from).magSq() - p5.Vector.sub(b, from).magSq();
      });

      // Setup planar graph connections
      for (let i = 0; i < intersections.length - 1; ++i) {
        let key = hashVec(intersections[i]);
        if (this.planarGraph[key] === undefined) {
          this.planarGraph[key] = [intersections[i]];
        }
        this.planarGraph[key].push(intersections[i + 1]);
        key = hashVec(intersections[i + 1]);
        if (this.planarGraph[key] === undefined) {
          this.planarGraph[key] = [intersections[i + 1]];
        }
        this.planarGraph[key].push(intersections[i]);
      }
    }

    for (let i = 0; i < this.circumferencePoints.length; ++i) {
      const posA = this.circumferencePoints[i];
      const posB = this.circumferencePoints[(i + 1) % this.circumferencePoints.length];
      this.planarGraph[hashVec(posB)].push(posA);
      this.planarGraph[hashVec(posA)].push(posB);
    }

    // Sort planar graph nodes for each node by its clockwise connections
    Object.values(this.planarGraph).forEach(node => {
      const from = node[0].copy();
      node.sort((a, b) => {
        if (vecEquals(a, from)) { return -9999; }
        if (vecEquals(b, from)) { return 9999; }
        const dirA = p5.Vector.sub(a, from);
        const dirB = p5.Vector.sub(b, from);
        return dirA.heading() - dirB.heading();
      });
    });

    // Compute faces
    this.faces = [];
    const used = new Set();
    let values = Object.values(this.planarGraph);

    for (let idx = 0; idx < values.length; ++idx) {
      let currentNode = values[idx];
      let start = currentNode[0];
      let vertices = []

      for (let i = 1; i < currentNode.length; ++i) {
        let previous = start;
        let current = currentNode[i];

        while (!vecEquals(start, current)) {
          const key = hashVecs(previous, current);
          if (used.has(key)) {
            vertices.length = 0;
            break;
          }
          used.add(key);

          vertices.push(current);
          const nextP = this.planarGraph[hashVec(current)];
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
          vertices.push(current);
          this.faces.push(vertices);
          vertices = []
        }
      }
    }

    // Outside edge faces
    for (let i = 0; i <= this.numPoints; ++i) {
      const baseAng = this.circleAngle * i;
      const pos = this.getPosOnCircle(baseAng);
      let vertices = [pos];
      const numVerts = Math.round(128/this.numPoints);
      for(let v = 0; v <= numVerts; ++v) {
        vertices.push(this.getPosOnCircle(baseAng + this.circleAngle/numVerts * v));
      }
      this.faces.push(vertices);
    }
  }

  getPosOnCircle(angle) {
    const offset = createVector(sin(angle), cos(angle)).mult(this.circleRadius/2.0);
    return p5.Vector.add(this.circlePos, offset);
  }  
}