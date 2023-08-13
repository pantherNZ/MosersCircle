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

  updatePoint(idx, pos) {
    let direction = p5.Vector.sub(pos, this.circlePos);
    direction.setMag(this.circleRadius / 2.0);
    this.circumferencePoints[idx] = p5.Vector.add(this.circlePos, direction);
    this.computeData(null, false);
  }

  computeData(inputData, recomputeEdgePoints=true) {
    if(inputData != null) {
      this.randomise = inputData.randomisePoints;
      this.numPoints = inputData.numPoints;
    }

    this.numLines = (this.numPoints * (this.numPoints - 1)) / 2;
    this.circleAngle = PI * 2.0 / this.numPoints;

    this.circlePos = createVector(width / 2, height / 2);
    const circleScale = 0.7;
    this.circleRadius = Math.min(width, height) * circleScale;
    this.quadruplets = combinations(this.numPoints, 4);

    if(recomputeEdgePoints) {
      this.circumferencePoints = [];
      for (let i = 0; i < this.numPoints; ++i) {
        this.circumferencePoints.push(this.getCirclePoint(i));
      }
    }

    this.circumferencePoints.sort((a, b) => p5.Vector.sub(a, this.circlePos).heading() - p5.Vector.sub(b, this.circlePos).heading());

    this.lines = [];
    for (let i = 0; i <= this.numPoints; ++i) {
      for (let j = i + 1; j <= this.numPoints; ++j) {
        this.lines.push([this.circumferencePoints[j % this.numPoints], this.circumferencePoints[i % this.numPoints]]);
      }
    }

    this.intersections = [];
    this.quadruplets.forEach(quad => {
      const posA = this.circumferencePoints[quad[0]];
      const posB = this.circumferencePoints[quad[1]];
      const posC = this.circumferencePoints[quad[2]];
      const posD = this.circumferencePoints[quad[3]];
      const intersect = lineIntersection(posA, posC, posB, posD);
      if(intersect != null) {
        this.intersections.push(intersect);
      }
    });

    this.closestIntersectPerLine = {};
    this.quadruplets.forEach(quad => {
      const posA = this.circumferencePoints[quad[0]];
      const posB = this.circumferencePoints[quad[1]];
      const posC = this.circumferencePoints[quad[2]];
      const posD = this.circumferencePoints[quad[3]];
      const intersect = lineIntersection(posA, posC, posB, posD);
      if(intersect == null) {
        return;
      }
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
      if(hashVec(posB) in this.planarGraph)
        this.planarGraph[hashVec(posB)].push(posA);
        if(hashVec(posA) in this.planarGraph)
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
    for (let i = 0; i < this.numPoints; ++i) {
      const fromPos = this.circumferencePoints[i];
      const fromDir = p5.Vector.sub(fromPos, this.circlePos);
      const toPos = this.circumferencePoints[(i + 1) % this.numPoints];
      const toDir = p5.Vector.sub(toPos, this.circlePos);
      const baseAng = fromDir.heading();
      const angleBetween = Math.abs(fromDir.angleBetween(toDir));
      let vertices = [fromPos];
      const numVerts = Math.ceil(128 / (PI * 2.0) * angleBetween);
      const angleGap = angleBetween / numVerts;
      for (let v = 0; v <= numVerts; ++v) {
        vertices.push(this.getPosOnCircle(baseAng + angleGap * v));
      }
      this.faces.push(vertices);
    }

    this.faces.sort((a, b) => p5.Vector.sub(getPolygonCentroid(a), this.circlePos).magSq() - p5.Vector.sub(getPolygonCentroid(b), this.circlePos).magSq());
  }

  getCirclePoint(idx) {
    if (this.randomise) {
      const randomAngle = Math.random() * 2.0 * PI;
      const offset = createVector(cos(randomAngle), sin(randomAngle)).mult(this.circleRadius / 2.0);
      return p5.Vector.add(this.circlePos, offset);
    }
    else {
      return this.getPosOnCircle(this.circleAngle * idx);
    }
  }

  getPosOnCircle(angle) {
    const offset = createVector(cos(angle), sin(angle)).mult(this.circleRadius / 2.0);
    return p5.Vector.add(this.circlePos, offset);
  }
}