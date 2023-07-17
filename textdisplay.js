class TextDisplay {
  constructor() {

  }

  render(stateMachine) {
    textAlign(CENTER);
    switch(stateMachine.state) {
      case State.Intro:

      case State.DrawLines:
        drawText("Moser's circle problem", createVector(width/2, 50), 255, 40);
        drawText("How many regions are there when we divide a circle by N points connected to each other around the circumference?", 
          createVector(width/2, 80), 255, 20);
        break;
      case State.CountPlanarEdges: {
          //let tex = createP();
          //tex.style('font-size', '20px')
          //tex.position(60, 165)
          //katex.render('{n\\choose x}', tex.elt)
          break;
      }
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