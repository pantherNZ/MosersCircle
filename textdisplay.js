class TextDisplay {
  constructor() {
    this.allKatexRenders = [];

    this.intro = this.createKatex("\\text{Moser's circle problem}", 40);
    this.intro2 = this.createKatex("\\text{How many regions are there when we divide a circle by N points connected to each other?}");
    this.drawLines = this.createKatex("\\text{To start, we can find how many lines there are.}");
    this.drawLines1 = this.createKatex("\\text{We can calculate this as }{\\Big(\\frac{Num\\space Points\\space *\\space (Num\\space Points\\space -\\space 1)}{2}\\Big)}");
    this.drawLines2 = this.createKatex("\\text{More generally, this is equivalent to n choose 2: }{n\\choose 2}");
    this.drawLines3 = this.createKatex("\\text{Where }{n\\choose 2}\\text{ is the binomial coefficient }{\\Big(\\frac{n!}{k!(n-k)!}\\Big)}");
    this.countIntersections = this.createKatex("\\text{Next we can find how many intersection points there are.}");
    this.countIntersections2 = this.createKatex("\\text{This can be calculated as n choose 4: }{n\\choose 4}");
    this.planarGraph = this.createKatex("\\text{Next we can use the intersections to form a planar graph.}");
    this.planarGraph2 = this.createKatex("\\text{For a planar graph: }{Faces\\space =\\space Edges\\space -\\space Vertices\\space +\\space 2}");
    this.planarGraph3 = this.createKatex("\\text{We can subtract 1 for the infinite outside face.}");
    this.countFaces1 = this.createKatex("{E = n\\choose 2}{ + n\\choose 4 + n}");
    this.countFaces2 = this.createKatex("{V = n + n\\choose 4}");
    this.countFaces3 = this.createKatex("{F = n\\choose 2}{+ n\\choose 4 + n}{ - (n + n\\choose 4) + 1}");
    this.countFaces4 = this.createKatex("\\text{Simplify to get our final calculation: }{F = n\\choose 2}{+ n\\choose 4 + 1}");
    this.countFaces4 = this.createKatex("{F = n\\choose 2}{ + n\\choose 4 + 1}");
  }

  createKatex(renderText, size=20) {
    let newRender = createP();
    newRender.style('font-size', size+'px');
    newRender.hide();
    katex.render(renderText, newRender.elt);
    this.allKatexRenders.push(newRender);
    return newRender;
  }

  onStateChanged(prevState, state) {
    for(const text of this.allKatexRenders) {
      text.hide();
    }
  }

  render(stateMachine) {
    textAlign(CENTER, CENTER);
    textSize(5);
    strokeWeight(0);
    textFont('Helvetica');

    switch(stateMachine.state) {
      case State.Intro:
        this.intro.position(width/2-220, 20);
        this.intro2.position(width/2-450, 100);
        this.intro.show();
        this.intro2.show();
        break;
      case State.DrawLines:
        if(stateMachine.getStatePercentProgress() < 0.5) {
          this.drawLines.position(width/2-220, 40);
          this.drawLines.show();
        }
        else {
          this.drawLines1.position(width/2-240, 40);
          this.drawLines2.position(width/2-240, 85);
          this.drawLines3.position(width/2-220, 120);
          this.drawLines1.show();
          this.drawLines2.show();
          this.drawLines3.show();
          this.drawLines.hide();
        }
        break;
      case State.CountIntersections:
        this.countIntersections.position(width/2-280, 40);
        this.countIntersections.show();
        if(stateMachine.getStatePercentProgress() >= 0.5) {
          this.countIntersections2.position(width/2-200, 80);
          this.countIntersections2.show();
        }
        break;
      case State.CountPlanarEdges:
        this.planarGraph.position(width/2-280, 40);
        this.planarGraph.show();

        if(stateMachine.getStatePercentProgress() >= 0.5) {
          this.planarGraph2.position(width/2-270, 80);
          this.planarGraph3.position(width/2-250, 120);
          this.planarGraph2.show();
          this.planarGraph3.show();
        }
        break;
      default:
        break;
    }
  }
}