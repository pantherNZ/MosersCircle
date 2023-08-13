class InputData {
  constructor() {
    this.animationSpeed = 1.0;
    this.randomisePoints = false;
    this.numPoints = 9;
  }
}

class InputController {
  constructor() {
    this.data = new InputData();
    this.callbacks = [];
    
    this.slider = createSlider(0,5,1,0.2);
    this.slider.position(0,0);
    this.slider.input(() => this.inputChanged());

    this.speedText = createElement('speedText', 'Speed: ' + this.data.animationSpeed);
    this.speedText.position(30,20);

    this.pointsSlider = createSlider(3,30,9,1);
    this.pointsSlider.position(150,0);
    this.pointsSlider.input(() => this.inputChanged());

    this.pointsText = createElement('pointsText', 'Points: ' + this.data.numPoints);
    this.pointsText.position(180,20);

    this.selector = createSelect();
    this.selector.position(300, 0);
    this.selector.option('Symmetrical');
    this.selector.option('Random');
    this.selector.changed(() => this.inputChanged());
  }

  addInputChangedCallback(event) {
    this.callbacks.push(event);
  }

  inputChanged() {
    this.data.animationSpeed = this.slider.value();
    this.data.randomisePoints = this.selector.value() == 'Random';
    this.data.numPoints = this.pointsSlider.value();
    this.speedText.html("Speed: " + this.data.animationSpeed);
    this.pointsText.html("Points: " + this.data.numPoints);
    this.callbacks.forEach(x => x(this.data));
  }
}

let dragging;

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