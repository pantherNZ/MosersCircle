class MoserRenderData {
  constructor() {
    // Visual settings -------
    this.circleColour = color(255, 0, 0);
    this.circumferencePointColour = color(255, 255, 255);
    this.connectionLineColour = color(100, 100, 100);
    this.intersectionPointColour = color(255, 255, 255);
    this.highlightLineColour = color(0, 255, 255);
    this.highlightIntersectionColour = color(0, 255, 255);
    this.planarLineColour = color(200, 200, 200);
    // ------------------------
  }

  render(data, stateMachine) {
    drawCircle(data.circlePos, data.circleRadius, 0, color(255, 0, 0), 2);
    this.drawLines(data, stateMachine);
    this.drawPlanarGraph(data, stateMachine);
    this.drawIntersections(data, stateMachine);
    this.drawPoints(data, stateMachine);
  }

  drawPoints(data, stateMachine) {
    data.circumferencePoints.forEach(x => {
      drawCircle(x, 15, this.circumferencePointColour);
    });
  }
  
  drawLines(data, stateMachine) {
    if (stateMachine.state == State.Intro || stateMachine.state >= State.CountPlanarEdges) {
      return;
    }

    for(let i = 0; i < data.lines.length; ++i) {
      const drawPairT = (stateMachine.getStateLength() / data.numLines) * (i - 1);
      const drawPairNextT = (stateMachine.getStateLength() / data.numLines) * i;
      const drawPairInterp = stateMachine.state == State.CountPairs ? (stateMachine.time - drawPairT) / (drawPairNextT - drawPairT) : 1.0;
      const line = i / data.numPoints;
      const drawLineT = (stateMachine.getStateLength() / data.numPoints) * line;
      const drawLineNextT = (stateMachine.getStateLength() / data.numPoints) * (line + 1);
      const drawLineInterp = stateMachine.state == State.DrawLines ? (stateMachine.time - drawLineT) / (drawLineNextT - drawLineT) : 1.0;
      const colour = (drawPairInterp >= 0.0 && drawPairInterp < 1.0) ? this.highlightLineColour : this.connectionLineColour;
      const size = (drawPairInterp >= 0.0 && drawPairInterp < 1.0) ? 3.0 : 1.0;
      animateLine(data.lines[i][0], data.lines[i][1], colour, size, drawLineInterp);
    }
  }

  drawIntersections(data, stateMachine) {
    if (stateMachine.state != State.CountIntersections) {
      return;
    }

    const drawIntersectionIdx = Math.floor(stateMachine.time / (stateMachine.getStateLength() / data.quadruplets.length));

    for (let i = 0; i <= drawIntersectionIdx; ++i) {
      drawCircle(data.intersections[i], 8.0, this.intersectionPointColour);
    }

    const quad = data.quadruplets[drawIntersectionIdx];
    drawLine(data.circumferencePoints[quad[0]], data.circumferencePoints[quad[2]], this.highlightIntersectionColour, 2);
    drawLine(data.circumferencePoints[quad[1]], data.circumferencePoints[quad[3]], this.highlightIntersectionColour, 2);
  }

  drawPlanarGraph(data, stateMachine) {
    if (stateMachine.state != State.CountPlanarEdges && stateMachine.state != State.CountFaces) {
      return;
    }

    const t = stateMachine.time / (stateMachine.getStateLength() / 2.0);

    for (const intersections of Object.values(data.closestIntersectPerLine)) {
      const from = intersections[0].copy();
      intersections.sort((a, b) => {
        return p5.Vector.sub(a, from).magSq() - p5.Vector.sub(b, from).magSq();
      });

      const calculateLineGap = (direction) => {
        const planarLineGapMax = min(30.0, max(10.0, direction.mag()/4.0));
        return stateMachine.state == State.CountFaces ? 0 : lerp(5.0, planarLineGapMax, min(t, 1.0));
      }

      for (let i = 0; i < intersections.length - 1; ++i) {
        let direction = p5.Vector.sub(intersections[i + 1], intersections[i]);
        direction.setMag(calculateLineGap(direction));
        drawLine(p5.Vector.add(intersections[i], direction), p5.Vector.sub(intersections[i + 1], direction), this.connectionLineColour, 2);
      }

      for (let i = 0; i < data.circumferencePoints.length; ++i) {
        const posA = data.circumferencePoints[i];
        const posB = data.circumferencePoints[(i + 1) % data.circumferencePoints.length];
        let direction = p5.Vector.sub(posB, posA);
        direction.setMag(calculateLineGap(direction));
        drawLine(p5.Vector.add(posA, direction), p5.Vector.sub(posB, direction), this.connectionLineColour, 2);
      }
    }

    data.intersections.forEach(x => {
      drawCircle(x, 8.0, this.intersectionPointColour);
    });

    // Faces
    if (stateMachine.state == State.CountFaces) {
      let timePerFace = stateMachine.getStateLength() / 4.0 / data.faces.length;
      for (let numFaces = 0; numFaces < data.faces.length && numFaces * timePerFace < stateMachine.time; ++numFaces) {
        drawFace(stateMachine.numCycles, numFaces, data.faces[numFaces]);
      }
    }
  }
}