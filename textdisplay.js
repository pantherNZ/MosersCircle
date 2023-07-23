class TextDisplay {
  constructor() {
    this.allKatexRenders = [];

    this.drawLines1 = this.createKatex("\\text{We can calculate this as }{n\\choose 2}");
    this.drawLines2 = this.createKatex("\\text{More generally, this is equivalent to }{\\Big(\\frac{Num\\space Points\\space *\\space (Num\\space Points\\space -\\space 1)}{2}\\Big)}");
    this.drawLines3 = this.createKatex("\\text{Where }{n\\choose 2}\\text{ is the binomial coefficient }{\\Big(\\frac{n!}{k!*(n-k)!}\\Big)}");
  }

  createKatex(renderText) {
    let newRender = createElement();
    newRender.style('font-size', '20px');
    newRender.style('display', 'block');
    newRender.style('text-align','center');
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
    textAlign(CENTER);
    textSize(5);
    strokeWeight(0);
    textFont('Helvetica');
    stateMachine.state = State.DrawLines;

    switch(stateMachine.state) {
      case State.Intro:
        drawText("Moser's circle problem", createVector(width/2, 50), 255, 40);
        drawText("How many regions are there when we divide a circle by N points connected to each other around the circumference?", 
          createVector(width/2, 80), 255, 15);
        break;
      case State.DrawLines:
        //if(stateMachine.getStatePercentProgress() < 0.5) {
        //  drawText("To start, we can find how many lines there are.", createVector(width/2, 80), 255, 15);
        //}
        //else {
          this.drawLines1.position(width/2, 40);
          this.drawLines2.position(width/2, 75);
          this.drawLines3.position(width/2, 120);
          this.drawLines1.show();
          this.drawLines2.show();
          this.drawLines3.show();
        //}
        break;
      case State.CountIntersections:
        break;
      case State.CountPlanarEdges:
        break;
      default:
        break;
    }
  }
}

//Moser's circle problem
//How many regions are there when we divide a circle by N points connected to each other around the circumference?
//
//how many lines are there?
//n choose 2 OR ((this.numPoints + 1) * this.numPoints) / 2;
//
//how many intersection points are there?
//n choose 4
//
//binomial coefficient n, 4
//x! / (k! * (n-k)!)
//
//non-planar graph faces (Euler's formula)
//F = E - V + 2
//F = E - V + 1 (subtract 1 for the infinite outside face)
//
//
//E = n choose 2 + n choose 4 + n
//V = n + n choose 4
//F = n choose 2 + n choose 4 + n + n + n choose 4 + 1
//Simplify to get
//F = 1 + (N choose 2) + (N choose 4)
//F = (SHOW RESULT)
//
//Count: (COUNT THEM UP)