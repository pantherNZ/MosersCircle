// Moser's circle problem
// https://www.youtube.com/watch?v=YtkIWDE36qU

// TODO:
// Add text/info display
// Drag and drop points input
// Randomise vs symetrical dropdown option
// Input for # points

let stateMachine, data, renderData, textDisplay, input;

function setup() {
  createCanvas(windowWidth, windowHeight);

  input = new InputController();
  stateMachine = new StateMachine();
  data = new MoserCircleData();
  renderData = new MoserRenderData();
  textDisplay = new TextDisplay();
  stateMachine.addStateChangedCallback((prevState, state) => textDisplay.onStateChanged(prevState, state));
  input.addInputChangedCallback((inputData) => stateMachine.onInputChanged(inputData));
}

function draw() {
  background(0);
  stateMachine.processState();
  renderData.render(data, stateMachine);
  textDisplay.render(stateMachine);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  data.computeData();
}