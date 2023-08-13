// Moser's circle problem
// https://www.youtube.com/watch?v=YtkIWDE36qU

// TODO:
// Drag and drop points input

let stateMachine, data, renderData, textDisplay, input, dragging;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');

  input = new InputController();
  stateMachine = new StateMachine();
  data = new MoserCircleData();
  renderData = new MoserRenderData();
  textDisplay = new TextDisplay();
  
  windowResized();

  input.addInputChangedCallback((inputData) => {
    stateMachine.onInputChanged(inputData);
    windowResized();
  });

  stateMachine.addStateChangedCallback((old, newState) => {
    if(newState == State.Intro) {
      windowResized();
    }
  });
}

function draw() {
  background(0);
  stateMachine.processState();
  renderData.render(data, stateMachine);
  textDisplay.render(stateMachine);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  data.computeData(input.data);
  textDisplay.initialise(data);
}

function mousePressed() {
  const pointCollisionSize = 20;
  const mouse = createVector(mouseX, mouseY);
  for(const [index, pos] of data.circumferencePoints.entries()) {
    if(p5.Vector.sub(pos, mouse).magSq() <= pointCollisionSize * pointCollisionSize) {
      dragging = index;
      break;
    }
  }
}

function mouseDragged() {
  if(dragging != null) {
    data.updatePoint(dragging, createVector(mouseX, mouseY));
  }
}

function mouseReleased() {
  dragging = null;
}