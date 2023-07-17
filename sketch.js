// Moser's circle problem
// https://www.youtube.com/watch?v=YtkIWDE36qU

let stateMachine, data, renderData, textDisplay;

function setup() {
  createCanvas(windowWidth, windowHeight);

  data = new MoserCircleData();
  renderData = new MoserRenderData();
  textDisplay = new TextDisplay();
  stateMachine = new StateMachine();
}

function draw() {
  background(0)
  stateMachine.processState();
  renderData.render(stateMachine, data);
  textDisplay.render(stateMachine);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}