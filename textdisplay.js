class TextDisplay {
  constructor() {
    this.allKatexRenders = [];
  }

  initialise(data) {
    for(const [text, state, percentMin, percentMax] of this.allKatexRenders) {
      text.remove();
    }

    this.allKatexRenders = [];
    this.createKatex("\\text{Moser's circle problem}", State.Intro, width/2-220, 20, 0.0, 1.0, 40);
    this.createKatex("\\text{How many regions are there when we divide a circle by N points connected to each other?}", State.Intro, width/2-450, 100);
    this.createKatex("\\text{To start, we can find how many lines there are.}", State.DrawLines, width/2-220, 40);
    this.createKatex("\\text{We can calculate this as }{\\Big(\\frac{Num\\space Points\\space *\\space (Num\\space Points\\space -\\space 1)}{2}\\Big)}", State.CountPairs, width/2-240, 40);
    this.createKatex("\\text{More generally, this is equivalent to n choose 2: }{n\\choose 2}", State.CountPairs, width/2-240, 85, 0.2);
    this.createKatex("\\text{Where }{n\\choose 2}\\text{ is the binomial coefficient }{\\Big(\\frac{n!}{k!(n-k)!}\\Big)}", State.CountPairs, width/2-220, 120, 0.4);
    this.createKatex("\\text{Next we can find how many intersection points there are.}", State.CountIntersections, width/2-280, 40);
    this.createKatex("\\text{This can be calculated as n choose 4: }{n\\choose 4}", State.CountIntersections, width/2-200, 80, 0.5);
    this.createKatex("\\text{Next we can use the intersections to form a planar graph.}", State.CountPlanarEdges, width/2-280, 40);
    this.createKatex("\\text{For a planar graph: }{Faces\\space =\\space Edges\\space -\\space Vertices\\space +\\space 2}", State.CountPlanarEdges, width/2-270, 80, 0.5);
    this.createKatex("\\text{We can subtract 1 for the infinite outside face.}", State.CountPlanarEdges, width/2-250, 120, 0.7);
    this.createKatex("\\text{Now we can count the total number of faces.}", State.CountFaces, width/2-220, 40, 0.0, 0.3);
    this.createKatex("{E = }{n\\choose 2}{+}{n\\choose 4}{+n}", State.CountFaces, width/2-80, 20, 0.3, 0.7);
    this.createKatex("{V = n + }{n\\choose 4}", State.CountFaces, width/2-60, 60, 0.4, 0.7);
    this.createKatex("{F = }{n\\choose 2}{+}{n\\choose 4}{+n}{-}{(n + }{n\\choose 4}{)+1}", State.CountFaces, width/2-140, 100, 0.5, 0.7);
    this.createKatex("\\text{Simplify to get our final calculation: }{F = }{n\\choose 2}{+}{n\\choose 4}{+1}", State.CountFaces, width/2-240, 140, 0.6, 0.7);
    this.createKatex(`\\text{Final count for ${data.numPoints} points: }{F = }{${data.numPoints}\\choose 2}{+}{${data.numPoints}\\choose 4}{+1}`, State.CountFaces, width/2-180, 40, 0.7);
    this.createKatex(`{${data.numFaces()}}`, State.CountFaces, width/2-20, 80, 0.9, 1.0, 40);
  }

  createKatex(renderText, state, x, y, percentMin=0.0, percentMax=1.0, size=20) {
    let newRender = createP();
    newRender.style('font-size', size+'px');
    newRender.hide();
    newRender.position(x, y);
    katex.render(renderText, newRender.elt);
    this.allKatexRenders.push([newRender, state, percentMin, percentMax]);
    return newRender;
  }

  render(stateMachine) {
    textAlign(CENTER, CENTER);
    textSize(5);
    strokeWeight(0);
    textFont('Helvetica');

    for(const [text, state, percentMin, percentMax] of this.allKatexRenders) {
      if(state == stateMachine.state && 
        stateMachine.getStatePercentProgress() >= percentMin && 
        stateMachine.getStatePercentProgress() <= percentMax) {
        text.show();
      } 
      else {
        text.hide();
      }
    }
  }
}