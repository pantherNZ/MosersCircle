// Moser's circle problem
// https://www.youtube.com/watch?v=YtkIWDE36qU

let stateMachine, data, renderData, textDisplay, input;

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